import ForceGraph2D from "react-force-graph-2d";
import AutoSizer from "react-virtualized-auto-sizer";
import { useEffect, useRef, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import { legend } from "../lib/legend";
import * as d3 from "d3";

export default function SpeciesGraph({ speciesName, graphData, sheet }) {
    const fgRef = useRef();
    const [open, setOpen] = useState(false);
    const [speciesInfo, setSpeciesInfo] = useState(null);
    const [globalScaleState, setGlobalScaleState] = useState(1);
    const [initialZoomDone, setInitialZoomDone] = useState(false); // Added state to track if initial zoom has been done
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    function getClimateRegions(speciesRow) {
        const climateRegions = [];
        if (sheet[speciesRow][16] === "1") {
            climateRegions.push("Polar");
        }
        if (sheet[speciesRow][17] === "1") {
            climateRegions.push("Boreal");
        }
        if (sheet[speciesRow][18] === "1") {
            climateRegions.push("Temperate");
        }
        if (sheet[speciesRow][19] === "1") {
            climateRegions.push("Subtropical");
        }
        if (sheet[speciesRow][20] === "1") {
            climateRegions.push("Tropical");
        }
        return climateRegions;
    }

    // Function to dynamically adjust forces based on globalScale (proxy for zoom level)
    useEffect(() => {
        const fg = fgRef.current;
        if (!fg) return;

        // Adjust collision radius based on globalScale
        const adjustedRadius = () => 10 / globalScaleState; // Example dynamic adjustment
        fg.d3Force("collide", d3.forceCollide(4).radius(adjustedRadius));
        fg.d3Force("link").distance(200 / globalScaleState);
        // fg.d3Force("charge", d3.forceManyBody().strength(-30)); // Adjust strength as needed

        // const linkForce = d3
        //     .forceLink(graphData.links)
        //     .id((d) => d.id)
        //     .distance((link) => {
        //         // Example dynamic distance calculation
        //         // You can adjust this based on link or node properties
        //         return 50 + 1 * 50; // Random length between 50 and 100 for demonstration
        //     });

        // fg.d3Force("link", linkForce);
        // // You can also adjust other forces as needed
        // fg.d3Force("charge", d3.forceManyBody());
        // fg.d3Force(
        //     "center",
        //     d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
        // );

        fg.d3ReheatSimulation();
    }, [globalScaleState, graphData, dimensions]);

    // Extend your existing useEffect hook for dynamic force adjustments
    useEffect(() => {
        const fg = fgRef.current;
        if (!fg) return;

        const simulation = d3.forceSimulation(nodes);
        if (simulation === undefined) return;
        console.log("Simulation found.");
        const nodes = graphData.nodes;

        // Function to check if any nodes are overlapping
        const areNodesOverlapping = () => {
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = nodes[i].val + nodes[j].val; // Assuming 'val' is radius; adjust as needed

                    if (distance < minDistance) {
                        return true; // Overlap found
                    }
                }
            }
            return false; // No overlap
        };

        // Custom 'tick' event listener for the simulation
        const checkOverlapAndFreeze = () => {
            console.log("Checking for overlaps...");
            if (!areNodesOverlapping()) {
                simulation.stop(); // Freeze the simulation if no nodes are overlapping
                console.log("Simulation frozen due to no overlaps.");
            }
        };

        simulation.on("tick", checkOverlapAndFreeze); // Add the 'tick' event listener

        return () => {
            simulation.on("tick", null); // Clean up the event listener
        };
    }, [graphData.nodes, globalScaleState, dimensions]); // Add dependencies as needed

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
                        nodeRelSize={4}
                        onEngineStop={() => {
                            if (!initialZoomDone) {
                                // Check if initial zoom has been done
                                const rootNode = graphData.nodes.find(
                                    (node) => node.id === speciesName
                                );
                                if (rootNode && fgRef.current) {
                                    fgRef.current.centerAt(
                                        rootNode.x,
                                        rootNode.y,
                                        250
                                    );
                                    fgRef.current.zoom(5, 250);
                                    setInitialZoomDone(true); // Mark initial zoom as done
                                }
                            }
                        }}
                        linkWidth={1}
                        linkLabel={(link) => link.impactTypes.join(", ")}
                        linkDirectionalArrowLength={5}
                        linkDirectionalArrowRelPos={0.75}
                        nodeCanvasObject={(node, ctx, globalScale) => {
                            const label = node.id;
                            // const fontSize = 14 / globalScale;
                            // const fontSize = Math.min(20 / globalScale, 5);
                            const fontSize = 5;
                            ctx.font = `${fontSize}px Oxygen`;
                            const textWidth = ctx.measureText(label).width;
                            const bckgDimensions = [textWidth, fontSize].map(
                                (n) => n + fontSize * 0.2
                            ); // some padding

                            ctx.fillStyle = "rgba(255, 255, 255, 1)";
                            ctx.fillRect(
                                node.x - bckgDimensions[0] / 2,
                                node.y - bckgDimensions[1] / 2,
                                ...bckgDimensions
                            );

                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";

                            {
                                /* colour node by species status */
                            }
                            const speciesRow = sheet.findIndex(
                                (row) => row[0] == node.id
                            );
                            const status =
                                speciesRow === -1
                                    ? undefined
                                    : sheet[speciesRow][12];
                            let color = "";

                            {
                                /* missing */
                            }
                            if (status === undefined) {
                                color = "grey";
                            } else {
                                switch (status.toLowerCase()) {
                                    case "invasive":
                                        color = legend.find(
                                            (l) => l.label === "Invasive"
                                        ).color;
                                        break;
                                    case "established":
                                        color = legend.find(
                                            (l) => l.label === "Established"
                                        ).color;
                                        break;
                                    case "reported":
                                        color = legend.find(
                                            (l) => l.label === "Reported"
                                        ).color;
                                        break;
                                    case "failed":
                                        color = legend.find(
                                            (l) => l.label === "Failed"
                                        ).color;
                                        break;
                                    case "extirpated":
                                        color = legend.find(
                                            (l) => l.label === "Extirpated"
                                        ).color;
                                        break;
                                    case "en":
                                        color = legend.find(
                                            (l) => l.label === "EN"
                                        ).color;
                                        break;
                                    case "cr":
                                        color = legend.find(
                                            (l) => l.label === "CR"
                                        ).color;
                                        break;
                                    case "lc":
                                        color = legend.find(
                                            (l) => l.label === "LC"
                                        ).color;
                                        break;
                                        {
                                            /* other */
                                        }
                                    default:
                                        color = legend.find(
                                            (l) => l.label === "Other"
                                        ).color;
                                }
                            }
                            ctx.fillStyle = color;

                            ctx.fillText(label, node.x, node.y);

                            node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint

                            if (globalScale !== globalScaleState) {
                                setGlobalScaleState(globalScale); // Update the globalScale state if it has changed
                            }
                            // set dimensions state
                            setDimensions({
                                width,
                                height,
                            });
                        }}
                        nodePointerAreaPaint={(node, color, ctx) => {
                            ctx.fillStyle = color;
                            const bckgDimensions = node.__bckgDimensions;
                            bckgDimensions &&
                                ctx.fillRect(
                                    node.x - bckgDimensions[0] / 2,
                                    node.y - bckgDimensions[1] / 2,
                                    ...bckgDimensions
                                );
                        }}
                        onNodeClick={(node) => {
                            const speciesRow = sheet.findIndex(
                                (row) => row[0] == node.id
                            );

                            let info = {
                                name: node.id,
                                system: "No Data",
                                status: "No Data",
                                climateRegion: "No Data",
                                generationTime: "No Data",
                                trophicLevel: "No Data",
                            };
                            if (speciesRow > -1) {
                                info.system = sheet[speciesRow][10];
                                info.status = sheet[speciesRow][12];
                                info.climateRegion =
                                    getClimateRegions(speciesRow)?.join(", ") ??
                                    "No Data";
                                info.generationTime = sheet[speciesRow][37];
                                info.trophicLevel = sheet[speciesRow][38];
                            }

                            setSpeciesInfo(info);
                            setOpen(true);
                        }}
                    />

                    <Drawer
                        anchor={"right"}
                        open={open}
                        onClose={() => setOpen(false)}
                        style={{
                            borderLeft: "2px solid #ccc",
                            boxShadow: "0 0 10px 5px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        {speciesInfo && (
                            <Grid
                                container
                                spacing={1}
                                columns={1}
                                sx={{
                                    paddingTop: 2,
                                    paddingLeft: 2,
                                    paddingRight: 2,
                                    maxWidth: "220px",
                                    minWidth: "250px",
                                }}
                            >
                                <Grid
                                    item
                                    xs={1}
                                    align='left'
                                    sx={{
                                        fontSize: "h6.fontSize",
                                        paddingBottom: 2,
                                    }}
                                >
                                    {speciesInfo.name}
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    align='left'
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "20px",
                                    }}
                                >
                                    {"System"}
                                </Grid>
                                <Grid item xs={1} align='left'>
                                    {speciesInfo.system || "No Data"}
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    align='left'
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "20px",
                                    }}
                                >
                                    {"Status"}
                                </Grid>
                                <Grid item xs={1} align='left'>
                                    {speciesInfo.status || "No Data"}
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    align='left'
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "20px",
                                    }}
                                >
                                    {"Climate Regions"}
                                </Grid>
                                <Grid item xs={1} align='left'>
                                    {speciesInfo.climateRegion || "No Data"}
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    align='left'
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "20px",
                                    }}
                                >
                                    {"Generation Time"}
                                </Grid>
                                <Grid item xs={1} align='left'>
                                    {speciesInfo.generationTime + " years" ||
                                        "No Data"}
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    align='left'
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "20px",
                                    }}
                                >
                                    {"Trophic Level"}
                                </Grid>
                                <Grid item xs={1} align='left'>
                                    {speciesInfo.trophicLevel || "No Data"}
                                </Grid>
                            </Grid>
                        )}
                    </Drawer>
                </>
            )}
        </AutoSizer>
    );
}
