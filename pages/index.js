// import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'
import { useState, useCallback, useEffect } from 'react'
import { google } from 'googleapis'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import SpeciesGraph from '../components/SpeciesGraphWrapper'
import TextField from '@mui/material/TextField'
import Legend from '../components/Legend'
import { items } from '../lib/legend'
import SeparationSlider from '../components/SeparationSlider'

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
  const [graph, setGraph] = useState({
    root: null,
    data: { nodes: [], links: [] },
  })
  const [currentSpecies, setCurrentSpecies] = useState(null)
  const [separation, setSeparation] = useState(0)

  const handleSeparationChange = (event, value) => {
    setSeparation(value)
  }

  const expandGraph = useCallback(
    (graph, speciesName, maxLevel, currentLevel = 0) => {
      // return the graph as is if the current recursion level exceeds the max level
      if (currentLevel > maxLevel) return graph

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
          if (!graph.data.nodes.some((node) => node.id === impacted.name)) {
            // add it as a node
            graph.data.nodes.push({ id: impacted.name })
            // and recurse to further expand graph
            graph = expandGraph(
              graph,
              impacted.name,
              maxLevel,
              currentLevel + 1
            )
          }

          // add directed link from impacter to impacted species
          graph.data.links.push({
            source: speciesName,
            target: impacted.name,
            impactTypes: impacted.impactTypes,
          })
        }
      }

      for (const sheetRow of sheet) {
        const impactingSpeciesName = sheetRow[0]
        const impactedSpecies = parseImpactingString(sheetRow[14])

        if (!impactedSpecies) continue

        if (impactedSpecies.some((impacted) => impacted.name === speciesName)) {
          if (
            !graph.data.nodes.some((node) => node.id === impactingSpeciesName)
          ) {
            // add it as a node
            graph.data.nodes.push({ id: impactingSpeciesName })
            // and recurse to further expand graph
            graph = expandGraph(
              graph,
              impactingSpeciesName,
              maxLevel,
              currentLevel + 1
            )
          }

          // add directed link from impacter to impacted species
          graph.data.links.push({
            source: impactingSpeciesName,
            target: speciesName,
            impactTypes: impactedSpecies.find(
              (impacted) => impacted.name === speciesName
            ).impactTypes,
          })
        }
      }

      return graph
    },
    [allSpecies, sheet]
  )

  const buildGraph = useCallback(
    (speciesName, maxLevel) => {
      // initialise graph with selected species
      let graph = {
        root: speciesName,
        data: {
          nodes: [{ id: speciesName }],
          links: [],
        },
      }
      // expand graph with impacted species
      graph = expandGraph(graph, speciesName, maxLevel)

      return graph
    },
    [expandGraph]
  )

  const ListItems = ({ index, data, style }) => {
    const species = data[index]

    return (
      <ListItem key={index} style={style} component='div' disablePadding>
        <ListItemButton
          onClick={(e) => {
            setCurrentSpecies(e.target.innerText)
            // setGraph(buildGraph(e.target.innerText, separation))
          }}
        >
          <ListItemText primary={species} />
        </ListItemButton>
      </ListItem>
    )
  }

  useEffect(() => {
    setGraph(buildGraph(currentSpecies, separation - 1))
  }, [allSpecies, buildGraph, currentSpecies, separation])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Allotment snap>
        <>
          <form>
            <TextField
              id='search-bar'
              className='text'
              onInput={(e) => {
                setList(() => {
                  if (!e.target.value) return allSpecies
                  return allSpecies.filter((speciesName) =>
                    speciesName.toLowerCase().includes(e.target.value)
                  )
                })
              }}
              variant='filled'
              size='small'
              fullWidth
            />
          </form>
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
        </>
        {graph.root ? (
          <>
            <SpeciesGraph
              speciesName={graph.root}
              graphData={graph.data}
              sheet={sheet}
            />
            <Legend items={items} />
            <SeparationSlider maxLevel={10} onChange={handleSeparationChange} />
          </>
        ) : (
          <>
            <div></div>
            <Legend items={items} />
            <SeparationSlider
              maxLevel={10}
              onChange={handleSeparationChange}
              disabled={true}
            />
          </>
        )}
      </Allotment>
    </div>
  )
}
