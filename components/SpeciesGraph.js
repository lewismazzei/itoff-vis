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
    <>
      <AutoSizer>
        {({ height, width }) => (
          <ForceGraph2D
            ref={fgRef}
            height={height}
            width={width}
            graphData={graphData}
            cooldownTime={1500}
            onEngineStop={() => {
              const rootNode = graphData.nodes.find(
                (node) => node.id === speciesName
              )
              fgRef.current.centerAt(rootNode.x, rootNode.y, 250)
              fgRef.current.zoom(5, 250)
            }}
            nodeAutoColorBy='group'
            linkWidth={1}
            linkLabel={(link) => link.impactTypes.join(', ')}
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
            onNodeClick={(node) => {
              const speciesRow = sheet.findIndex((row) => row[0] == node.id)
              const info = speciesRow === -1 ? '' : sheet[speciesRow][35]
              setSpeciesInfo({
                name: node.id,
                info:
                  info === '' || info === 'NA' || info === undefined
                    ? 'No Info'
                    : info,
              })
              setOpen(true)
            }}
          />
        )}
      </AutoSizer>
      <Drawer anchor={'right'} open={open} onClose={() => setOpen(false)}>
        {speciesInfo && (
          <Grid
            container
            spacing={2}
            columns={1}
            sx={{
              paddingTop: 2,
              paddingLeft: 2,
              paddingRight: 2,
              maxWidth: '25vw',
            }}
          >
            <Grid item xs={1} align='center' sx={{ fontSize: 'h6.fontSize' }}>
              {speciesInfo.name}
            </Grid>
            <Grid item xs={1} align='center'>
              {speciesInfo.info}
            </Grid>
          </Grid>
        )}
      </Drawer>
    </>
  )
}
