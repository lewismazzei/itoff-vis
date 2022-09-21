// import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'
import { google } from 'googleapis'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import dynamic from 'next/dynamic'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
})

export async function getServerSideProps() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: 'Sheet1',
  })

  const sheet = response.data.values.slice(1)
  const allSpecies = sheet.map((row) => row[0])

  return {
    props: {
      sheet,
      allSpecies,
    },
  }
}

const parseImpactingString = (impactingString) => {
  if (impactingString === '' || impactingString === undefined) {
    return null
  }

  // split species name from impact types via regex pattern
  return impactingString
    .trim()
    .split(';')
    .map((impactingSubstring) => {
      const [, speciesName, impactTypesString] =
        /([^\(]+)\s(?:\(([^)]+)\))?/.exec(impactingSubstring.trim())
      return {
        name: speciesName,
        impactTypes:
          impactTypesString !== undefined
            ? impactTypesString.split(',').map((s) => s.trim())
            : ['Unclear'],
      }
    })
}

export default function Home({ sheet, allSpecies }) {
  const [list, setList] = useState(allSpecies)
  const [graph, setGraph] = useState({ nodes: [], links: [] })

  const expandGraph = (graph, speciesName) => {
    // get row of impacter species
    const speciesRow = allSpecies.indexOf(speciesName)

    // return graph as is if impacter species cannot be found
    if (speciesRow === -1) return graph

    // parse impacted species names and types
    const impactedSpecies = parseImpactingString(sheet[speciesRow][14])

    // return graph as is if there are no impacted species
    if (impactedSpecies) {
      // iterate through impacted species
      for (const impacted of impactedSpecies) {
        // if impacted species is not in the graph
        if (!graph.nodes.some((node) => node.id === impacted.name)) {
          // add it as a node
          graph.nodes.push({ id: impacted.name })
          // and recurse to further expand graph
          graph = expandGraph(graph, impacted.name)
        }

        // add directed link from impacter to impacted species
        graph.links.push({ source: speciesName, target: impacted.name })
      }
    }

    for (const sheetRow of sheet) {
      const impactingSpeciesName = sheetRow[0]
      const impactedSpecies = parseImpactingString(sheetRow[14])

      if (!impactedSpecies) continue

      if (impactedSpecies.some((impacted) => impacted.name === speciesName)) {
        if (!graph.nodes.some((node) => node.id === impactingSpeciesName)) {
          // add it as a node
          graph.nodes.push({ id: impactingSpeciesName })
          // and recurse to further expand graph
          graph = expandGraph(graph, impactingSpeciesName)
        }

        // add directed link from impacter to impacted species
        graph.links.push({
          source: impactingSpeciesName,
          target: speciesName,
        })
      }
    }

    return graph
  }

  const buildGraph = (speciesName) => {
    // initialise graph with selected species
    let graph = {
      nodes: [{ id: speciesName }],
      links: [],
    }
    // expand graph with impacted species
    graph = expandGraph(graph, speciesName)

    return graph
  }

  const ListItems = ({ index, data, style }) => {
    const species = data[index]

    return (
      <ListItem key={index} style={style} component='div' disablePadding>
        <ListItemButton
          onClick={(e) => setGraph(buildGraph(e.target.innerText))}
        >
          <ListItemText primary={species} />
        </ListItemButton>
      </ListItem>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Allotment snap>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemData={list}
              itemCount={list.length}
              itemSize={46}
              overscanCount={50}
            >
              {ListItems}
            </List>
          )}
        </AutoSizer>
        <AutoSizer>
          {({ height, width }) => (
            <ForceGraph2D
              height={height}
              width={width}
              graphData={graph}
              nodeAutoColorBy='group'
              linkWidth={1}
              linkDirectionalArrowLength={5}
              linkDirectionalArrowRelPos={0.75}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.id
                const fontSize = 14 / globalScale
                ctx.font = `${fontSize}px Sans-Serif`
                const textWidth = ctx.measureText(label).width
                const bckgDimensions = [textWidth, fontSize].map(
                  (n) => n + fontSize * 0.2
                ) // some padding

                ctx.fillStyle = 'rgba(255, 255, 255, 1)'
                ctx.fillRect(
                  node.x - bckgDimensions[0] / 2,
                  node.y - bckgDimensions[1] / 2,
                  ...bckgDimensions
                )

                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillStyle = node.color
                ctx.fillText(label, node.x, node.y)

                node.__bckgDimensions = bckgDimensions // to re-use in nodePointerAreaPaint
              }}
              nodePointerAreaPaint={(node, color, ctx) => {
                ctx.fillStyle = color
                const bckgDimensions = node.__bckgDimensions
                bckgDimensions &&
                  ctx.fillRect(
                    node.x - bckgDimensions[0] / 2,
                    node.y - bckgDimensions[1] / 2,
                    ...bckgDimensions
                  )
              }}
            />
          )}
        </AutoSizer>
      </Allotment>
    </div>
  )
}
