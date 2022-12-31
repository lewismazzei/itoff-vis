import ForceGraph2D from 'react-force-graph-2d'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useRef, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'

export default function SpeciesGraph({ speciesName, graphData, sheet }) {
  const fgRef = useRef()
  const [open, setOpen] = useState(false)
  const [speciesInfo, setSpeciesInfo] = useState(null)

  return (
    <AutoSizer>
      {({ height, width }) => (
        <>
          <ForceGraph2D
            ref={fgRef}
            height={height}
            width={width}
            graphData={graphData}
            cooldownTime={1500}
            onEngineStop={() => {
              if (!graphData.root) return

              const rootNode = graphData.nodes.find(
                (node) => node.id === speciesName
              )
              fgRef.current.centerAt(rootNode.x, rootNode.y, 250)
              fgRef.current.zoom(5, 250)
            }}
            linkWidth={1}
            linkLabel={(link) => link.impactTypes.join(', ')}
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={0.75}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.id
              const fontSize = 14 / globalScale
              ctx.font = `${fontSize}px Oxygen`
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

              {
                /* colour node by species status */
              }
              const speciesRow = sheet.findIndex((row) => row[0] == node.id)
              const status =
                speciesRow === -1 ? undefined : sheet[speciesRow][10]
              let color = ''

              {
                /* missing */
              }
              if (status === undefined) {
                color = 'grey'
              } else {
                switch (status.toLowerCase()) {
                  case 'invasive':
                    color = '#FF2C00'
                    break
                  case 'established':
                    color = '#FF8D53'
                    break
                  case 'reported':
                    color = '#FFEF2F'
                    break
                  case 'failed':
                    color = '#FFB0B5'
                    break
                  case 'extirpated':
                    color = '#FFD698'
                    break
                  case 'en':
                    color = '#8DC9FF'
                    break
                  case 'cr':
                    color = '#0006FF'
                    break
                  case 'lc':
                    color = '#77FF80'
                    break
                    {
                      /* other */
                    }
                  default:
                    color = 'grey'
                }
              }
              ctx.fillStyle = color

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
            onNodeClick={(node) => {
              const speciesRow = sheet.findIndex((row) => row[0] == node.id)

              let info = {
                name: node.id,
                system: 'No Data',
                status: 'No Data',
                climateRegion: 'No Data',
                generationTime: 'No Data',
                trophicLevel: 'No Data',
              }
              if (speciesRow > -1) {
                info.system = sheet[speciesRow][7]
                info.status = sheet[speciesRow][10]
                info.climateRegion = sheet[speciesRow][13]
                info.generationTime = sheet[speciesRow][21]
                info.trophicLevel = sheet[speciesRow][22]
              }

              setSpeciesInfo(info)
              setOpen(true)
            }}
          />

          <Drawer anchor={'right'} open={open} onClose={() => setOpen(false)}>
            {speciesInfo && (
              <Grid
                container
                spacing={1}
                columns={1}
                sx={{
                  paddingTop: 2,
                  paddingLeft: 2,
                  paddingRight: 2,
                  maxWidth: '15vw',
                  minWidth: '250px',
                }}
              >
                <Grid
                  item
                  xs={1}
                  align='center'
                  sx={{ fontSize: 'h6.fontSize', paddingBottom: 2 }}
                >
                  {speciesInfo.name}
                </Grid>
                <Grid item xs={1} align='left' sx={{ fontWeight: 'bold' }}>
                  {'System'}
                </Grid>
                <Grid item xs={1} align='left'>
                  {speciesInfo.system}
                </Grid>
                <Grid item xs={1} align='left' sx={{ fontWeight: 'bold' }}>
                  {'Status'}
                </Grid>
                <Grid item xs={1} align='left'>
                  {speciesInfo.status}
                </Grid>
                <Grid item xs={1} align='left' sx={{ fontWeight: 'bold' }}>
                  {'Climate Region'}
                </Grid>
                <Grid item xs={1} align='left'>
                  {speciesInfo.climateRegion}
                </Grid>
                <Grid item xs={1} align='left' sx={{ fontWeight: 'bold' }}>
                  {'Generation Time'}
                </Grid>
                <Grid item xs={1} align='left'>
                  {speciesInfo.generationTime}
                </Grid>
                <Grid item xs={1} align='left' sx={{ fontWeight: 'bold' }}>
                  {'Trophic Level'}
                </Grid>
                <Grid item xs={1} align='left'>
                  {speciesInfo.trophicLevel}
                </Grid>
              </Grid>
            )}
          </Drawer>
        </>
      )}
    </AutoSizer>
  )
}
