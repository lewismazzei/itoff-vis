import React from "react";
import {
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
} from "@mui/material";

export default function ClimateRegionSelector({ onChange, validRegions = [] }) {
    return (
        <div
            style={{
                position: "fixed",
                top: "165px",
                right: "15px",
                width: "fit-content",
                height: "fit-content",
                padding: "10px 20px 10px 20px",
                border: "2px solid #ccc",
                textAlign: "center",
                justifyContent: "center",
                borderRadius: "20px",
                boxShadow: "0 0 10px 5px rgba(0, 0, 0, 0.1)",
                backgroundColor: "aliceblue",
                marginTop: "10px",
            }}
        >
            <FormControl component='fieldset'>
                <FormLabel
                    component='legend'
                    style={{ marginBottom: "0.5em", letterSpacing: "0.05em" }}
                >
                    <strong style={{ color: "#1f2232" }}>Climate Region</strong>
                </FormLabel>
                <RadioGroup
                    onChange={onChange}
                    defaultValue={validRegions == [] ? "none" : "all"}
                >
                    <FormControlLabel
                        value='all'
                        control={<Radio disabled={validRegions == []} />}
                        label='All'
                    />
                    <FormControlLabel
                        value='polar'
                        control={
                            <Radio disabled={!validRegions.includes("polar")} />
                        }
                        label='Polar'
                    />
                    <FormControlLabel
                        value='boreal'
                        control={
                            <Radio
                                disabled={!validRegions.includes("boreal")}
                            />
                        }
                        label='Boreal'
                    />
                    <FormControlLabel
                        value='temperate'
                        control={
                            <Radio
                                disabled={!validRegions.includes("temperate")}
                            />
                        }
                        label='Temperate'
                    />
                    <FormControlLabel
                        value='subtropical'
                        control={
                            <Radio
                                disabled={!validRegions.includes("subtropical")}
                            />
                        }
                        label='Subtropical'
                    />
                    <FormControlLabel
                        value='tropical'
                        control={
                            <Radio
                                disabled={!validRegions.includes("tropical")}
                            />
                        }
                        label='Tropical'
                    />
                </RadioGroup>
            </FormControl>
        </div>
    );
}
