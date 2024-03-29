// import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'
import { useState, useCallback, useEffect } from 'react'
// import { google } from 'googleapis'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import {
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Drawer,
} from '@mui/material'
import SeparationSlider from '../components/SeparationSlider'
import SpeciesGraph from '../components/SpeciesGraphWrapper'
import Legend from '../components/Legend'
import { legend } from '../lib/legend'
import Header from '../components/Header'
import { google } from 'googleapis'
import ClimateRegionSelector from '../components/ClimateRegionSelector'

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
      allSpecies,
      sheet,
    },
  }
  // return {
  //   props: {
  //     string: 'Hello World',
  //   },
  // }
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

export default function Home({ allSpecies, sheet }) {
  // console.log(string)
  // return null
  const [list, setList] = useState(allSpecies)
  const [graph, setGraph] = useState({
    root: null,
    data: { nodes: [], links: [] },
  })
  const [currentSpecies, setCurrentSpecies] = useState(null)
  const [separation, setSeparation] = useState(1)
  const [climateRegion, setClimateRegion] = useState('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  const handleSeparationChange = (event, value) => {
    setSeparation(value)
  }

  const handleClimateRegionChange = (event) => {
    setClimateRegion(event.target.value)
  }

  const handleToggle = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  const getClimateRegions = useCallback(
    (speciesRow) => {
      if (!sheet[speciesRow]) return []

      const climateRegions = []
      if (sheet[speciesRow][16] === '1') {
        climateRegions.push('polar')
      }
      if (sheet[speciesRow][17] === '1') {
        climateRegions.push('boreal')
      }
      if (sheet[speciesRow][18] === '1') {
        climateRegions.push('temperate')
      }
      if (sheet[speciesRow][19] === '1') {
        climateRegions.push('subtropical')
      }
      if (sheet[speciesRow][20] === '1') {
        climateRegions.push('tropical')
      }
      return climateRegions
    },
    [sheet]
    )

    const expandGraph = useCallback(
      (graph, speciesName, maxLevel, currentLevel = 0) => {
        // return the graph as is if the current recursion level exceeds the max level
        if (currentLevel > maxLevel) return graph

        if (climateRegion !== 'all') {
          const speciesRow = allSpecies.indexOf(speciesName)
          const climateRegions = getClimateRegions(speciesRow)
          if (!climateRegions.includes(climateRegion)) {
            return graph
          }
        }

        // get row of impacter species
        const speciesRow = allSpecies.indexOf(speciesName)

        // return graph as is if impacter species cannot be found
        if (speciesRow === -1) return graph

        // parse impacted species names and types
        const impactedSpecies = parseImpactingString(sheet[speciesRow][21])

        // return graph as is if there are no impacted species
        if (impactedSpecies) {
          // iterate through impacted species
          for (const impacted of impactedSpecies) {
            // if impacted species is not in the graph
            if (
              !graph.data.nodes.some(
                (node) => node.id === impacted.name
                )
                ) {
                  if (climateRegion !== 'all') {
                    const impactedSpeciesRow = allSpecies.indexOf(
                      impacted.name
                      )
                      const climateRegions =
                      getClimateRegions(impactedSpeciesRow)
                      if (!climateRegions.includes(climateRegion)) {
                        continue
                      }
                    }
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
                  const impactedSpecies = parseImpactingString(sheetRow[21])

                  if (!impactedSpecies) continue

                  if (
                    impactedSpecies.some(
                      (impacted) => impacted.name === speciesName
                      )
                      ) {
                        if (
                          !graph.data.nodes.some(
                            (node) => node.id === impactingSpeciesName
                            )
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
                          [allSpecies, climateRegion, getClimateRegions, sheet]
                          )
                          const buildGraph = useCallback(
                            (speciesName, maxLevel) => {
                              // ensure selected species is in the current climate region
                              if (climateRegion !== 'all') {
                                const climateRegions = getClimateRegions(
                                  allSpecies.indexOf(speciesName)
                                  )
                                  if (!climateRegions.includes(climateRegion)) {
                                    return { root: null, data: { nodes: [], links: [] } }
                                  }
                                }

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
                              [allSpecies, climateRegion, expandGraph, getClimateRegions]
                              )

                              const ListItems = ({ index, data, style }) => {
                                const species = data[index]
                                return (
                                  <ListItem key={index} component='div' disablePadding style={style}>
                                  <ListItemButton
                                  onClick={(e) => {
                                    setCurrentSpecies(e.target.innerText)
                                  }}
                                  selected={species === currentSpecies}
                                  disableTouchRipple
                                  >
                                  <ListItemText primary={species} />
                                  </ListItemButton>
                                  </ListItem>
                                  )
                                }

                                useEffect(() => {
                                  setGraph(buildGraph(currentSpecies, separation - 1))
                                }, [allSpecies, buildGraph, currentSpecies, separation, climateRegion])
                                return (
                                  <div style={{ width: '100vw', height: '100vh' }}>
                                  <Header onClick={handleToggle} isDrawerOpen={isDrawerOpen} />
                                  <Drawer
                                  anchor='left'
                                  open={isDrawerOpen}
                                  onClose={handleToggle}
                                  variant='persistent'
                                  >
                                  <form>
                                  <TextField
                                  id='search-bar'
                                  onInput={(e) => {
                                    setList(() => {
                                      if (!e.target.value) return allSpecies
                                      return allSpecies.filter((speciesName) =>
                                      speciesName
                                      .toLowerCase()
                                      .includes(e.target.value)
                                      )
                                    })
                                  }}
                                  variant='outlined'
                                  size='small'
                                  fullWidth
                                  placeholder='Search'
                                  sx={{ padding: '10px' }}
                                  />
                                  </form>
                                  <AutoSizer>
                                  {({ height, width }) => (
                                    <List
                                    height={height}
                                    width={width}
                                    itemData={list}
                                    itemCount={list.length}
                                    itemSize={52}
                                    overscanCount={50}
                                    >
                                    {ListItems}
                                    </List>
                                    )}
                                    </AutoSizer>
                                    </Drawer>
                                    {graph.root ? (
                                      <>
                                      <SpeciesGraph
                                      speciesName={graph.root}
                                      graphData={graph.data}
                                      sheet={sheet}
                                      />
                                      <Legend items={legend} />
                                      <SeparationSlider
                                      maxLevel={10}
                                      onChange={handleSeparationChange}
                                      />
                                      <ClimateRegionSelector
                                      onChange={handleClimateRegionChange}
                                      validRegions={getClimateRegions(
                                        allSpecies.indexOf(graph.root)
                                        )}
                                        />
                                        </>
                                        ) : (
                                          <>
                                          <Legend items={legend} />
                                          <SeparationSlider
                                          maxLevel={10}
                                          onChange={handleSeparationChange}
                                          disabled={true}
                                          />
                                          <ClimateRegionSelector
                                          onChange={handleClimateRegionChange}
                                          validRegions={[]}
                                          />
                                          </>
                                          )}
                                          </div>
                                          )
                                        }
