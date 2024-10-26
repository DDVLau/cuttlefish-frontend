import {Chart as ChartJS} from "chart.js/auto";
import dayjs from "dayjs";
import {Bar} from "react-chartjs-2";

import "chartjs-plugin-annotation";
import {Ticks, Tooltip} from "chart.js";
import "dayjs/locale/en-gb";

import React, {useEffect, useState} from "react";
import {
    Table,
    ButtonToolbar,
    ButtonGroup,
    Button,
    Container,
    OverlayTrigger,
    Popover
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus, faArrowRotateRight, faArrowLeft, faArrowRight
} from '@fortawesome/free-solid-svg-icons'

import { SCHEDULE_START, SCHEDULE_END } from "./data/constants";

dayjs.locale("en-gb");

// const BULMA_HEX = {
//     primary: "#00d1b2",
//     link: "#485fc7",
//     info: "#3e8ed0",
//     success: "#48c78e",
//     warning: "#ffe08a",
//     danger: "#f14668",
// }

const CHARTJS_HEX = {
    first: "#36a2eb",
    second: "#ff6384",
    third: "#4bc0c0",
    fourth: "#ff9f40",
    fifth: "#9966ff",
    sixth: "#ffcd56",
    seventh: "#c9cbcf",
}

function cssColour(hexColour, alpha) {
    const tokens = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColour);
    if (tokens) {
        const red = parseInt(tokens[1], 16);
        const green = parseInt(tokens[2], 16);
        const blue = parseInt(tokens[3], 16);
        return "rgba(" + [red, green, blue, alpha].toString() + ")";
    }
    return null;
}


Tooltip.positioners.customTooltipPosition = function(elements, eventPosition) {
    return {
        x: eventPosition.x,
        y: 0,
    };
};


function PricesChart({ import_prices, export_prices, view_min, view_max }) {
    return (
        <Bar
            datasetIdKey={"label"}
            data={{
                labels: [],
                datasets: [
                    {
                        label: "Import from grid",
                        data: import_prices,
                        backgroundColor: cssColour(CHARTJS_HEX["second"], 0.5),
                        hoverBackgroundColor: cssColour(CHARTJS_HEX["second"], 1.0),
                    },
                    {
                        label: "Export to grid",
                        data: export_prices,
                        backgroundColor: cssColour(CHARTJS_HEX["first"], 0.5),
                        hoverBackgroundColor: cssColour(CHARTJS_HEX["first"], 1.0),
                    },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                // interaction: {
                //     mode: "index",
                //     intersect: false,
                // },
                barPercentage: 0.85, // 0.9
                categoryPercentage: 1.0,  // 0.8
                // layout: {
                //     padding: {
                //         top: 72,
                //     },
                // },
                scales: {
                    x: {
                        type: "time",
                        stacked: true,
                        time: {
                            displayFormats: {
                                day: "dddd",
                                hour: "HH:mm",
                            },
                            unit: view_max.diff(view_min, "day") > 1 ? "day" : "hour",
                            tooltipFormat: "dddd HH:mm",
                        },
                        ticks: {
                            labelOffset: function(context) {
                                return -((context.scale.getPixelForTick(0) - context.scale.getPixelForTick(1)) / 2); // negative offset means offset to the right, positive means to the left
                            },
                        },
                        afterTickToLabelConversion: function(scale) {
                            scale.ticks[scale.ticks.length-1].label = "";
                        },
                        offset: false,
                        grid: {
                            offset: false,
                            display: true,
                            drawOnChartArea: false,
                        },
                        border: {
                            display: false,
                        },
                        min: view_min.toString(),
                        max: view_max.toString(),
                        title: {
                            display: true,
                            text: function(ctx) {
                                return ctx.scale._unit === "hour" ? dayjs(ctx.scale.ticks[0].value).format("dddd") : "";
                            },
                        },
                    },
                    y: {
                        ticks: {
                            callback: function(value, index, ticks) {
                                return value > 0 ? "pay " + value + "p" : value < 0 ? "earn " + Math.abs(value) + "p" : value + "p";
                            },
                        },
                        min: -20,
                        max: 40,
                        title: {
                            display: true,
                            text: "per kWh",
                        },
                    },
                    y2: {
                        position: "right",
                        ticks: {
                            callback: function(value, index, ticks) {
                                return value > 0 ? "pay " + value + "p" : value < 0 ? "earn " + Math.abs(value) + "p" : value + "p";
                            },
                            count: function(ctx) {
                                return ctx.chart.scales.y.ticks.length;
                            },
                        },
                        min: function(ctx) {
                            return ctx.chart.scales.y.min;
                        },
                        max: function(ctx) {
                            return ctx.chart.scales.y.max;
                        },
                        grid: {
                            display: true,
                            drawOnChartArea: false,
                        },
                        title: {
                            display: true,
                            text: "per kWh",
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        // position: "customTooltipPosition",
                        // backgroundColor: "rgba(0, 0, 0, 0)",
                        // titleColor: ChartJS.defaults.color,
                        // bodyColor: ChartJS.defaults.color,
                        // footerColor: ChartJS.defaults.color,
                        // cornerRadius: 0,
                        // xAlign: "center",
                        // caretSize: 0,
                        // usePointStyle: true,
                        // animation: {
                        //     duration: 0,
                        // },
                        callbacks: {
                            title: function(context) {
                                const start = dayjs(context[0].raw.x);
                                const end = dayjs(context[0].raw.x2);
                                return start.format("dddd HH:mm") + "-" + end.format("HH:mm");
                            },
                            label: function(context) {
                                let label = context.dataset.label || "";

                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    if (context.parsed.y > 0) {
                                        label += "pay " + context.parsed.y + "p";
                                    } else if (context.parsed.y < 0) {
                                        label += "earn " + Math.abs(context.parsed.y) + "p per kWh";
                                    } else {
                                        label += "N/A";
                                    }
                                }
                                return label;
                            },
                        },
                    },
                    legend: {
                        display: true,
                        onClick: null,
                    },
                },
                animation: {
                    type: "boolean",
                },
                transitions: {
                    active: {
                        animation: {
                            duration: 0,
                        },
                    },
                },
            }}
            // plugins={[
            //     {
            //         beforeDraw: chart => {
            //             if (chart.tooltip?._active?.length) {
            //                 let x = chart.tooltip._active[0].element.x;
            //                 let yAxis = chart.scales.y;
            //                 let ctx = chart.ctx;
            //                 ctx.save();
            //                 ctx.beginPath();
            //                 ctx.moveTo(x, yAxis.top);
            //                 ctx.lineTo(x, yAxis.bottom);
            //                 ctx.lineWidth = 1;
            //                 ctx.strokeStyle = ChartJS.defaults.borderColor;
            //                 ctx.stroke();
            //                 ctx.restore();
            //                 // console.log("Tooltip is showing");
            //             } else {
            //                 // console.log("Tooltip is hidden");
            //             }
            //         },
            //     },
            // ]}
        />
    );
}

function ChartNavigation({viewMin, setViewMin, viewMax, setViewMax}) {
    function handleZoomOut() {
        const oldMin = viewMin;
        const oldMax = viewMax;
        const newMin = oldMin.subtract(1, "day");
        const newMax = oldMax.add(1, "day");
        const newDiff = newMax.diff(newMin, "day");
        if (newMin < SCHEDULE_START) {
            setViewMin(SCHEDULE_START);
            setViewMax(SCHEDULE_START.add(newDiff, "day"));
        } else if (newMax > SCHEDULE_END) {
            setViewMin(SCHEDULE_END.subtract(newDiff, "day"));
            setViewMax(SCHEDULE_END);
        } else {
            setViewMin(newMin);
            setViewMax(newMax);
        }
    }

    function handleZoomIn() {
        const newMin = viewMin.add(1, "day");
        const newMax = viewMax.subtract(1, "day");
        const newDiff = newMax.diff(newMin, "day");
        if (newMin < SCHEDULE_START) {
            setViewMin(SCHEDULE_START);
            setViewMax(SCHEDULE_START.add(newDiff, "day"));
        } else if (newMax > SCHEDULE_END) {
            setViewMin(SCHEDULE_END.subtract(newDiff, "day"));
            setViewMax(SCHEDULE_END);
        } else {
            setViewMin(newMin);
            setViewMax(newMax);
        }
    }

    function handleReset() {
        setViewMin(SCHEDULE_START);
        setViewMax(SCHEDULE_END);
    }

    function handlePrevious() {
        setViewMin(viewMin.subtract(1, "day"));
        setViewMax(viewMax.subtract(1, "day"));
    }

    function handleNext() {
        setViewMin(viewMin.add(1, "day"));
        setViewMax(viewMax.add(1, "day"));
    }

    return (
        <ButtonToolbar aria-label="Navigation" className={"justify-content-evenly"}>
            <ButtonGroup aria-label="Level">
                <Button variant="outline-secondary" size="sm" className={"icon-link"} onClick={handleZoomOut} disabled={viewMax.diff(viewMin, "day") >= 7}>
                    <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
                    Zoom out
                </Button>
                <Button variant="outline-secondary" size="sm" className={"icon-link"} onClick={handleZoomIn} disabled={viewMax.diff(viewMin, "day") <= 1}>
                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                    Zoom in
                </Button>
            </ButtonGroup>
            <Button variant="outline-secondary" size="sm" className={"icon-link"} onClick={handleReset} disabled={(viewMin <= SCHEDULE_START) && (viewMax >= SCHEDULE_END)}>
                <FontAwesomeIcon icon={faArrowRotateRight} />
                Reset
            </Button>
            <ButtonGroup aria-label="Page">
                <Button variant="outline-secondary" size="sm" className={"icon-link"} onClick={handlePrevious} disabled={viewMin <= SCHEDULE_START}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Previous
                </Button>
                <Button variant="outline-secondary" size="sm" className={"icon-link"} onClick={handleNext} disabled={viewMax >= SCHEDULE_END}>
                    <FontAwesomeIcon icon={faArrowRight} />
                    Next
                </Button>
            </ButtonGroup>
        </ButtonToolbar>
    );
}

const pkWh = (value) => (Math.round((value + Number.EPSILON) * 100) / 100) + "p per kWh";

const payEarn = (value, preferPay) => {
    if (value > 0.0) {
        return "pay " + pkWh(value);
    } else if (value < 0.0) {
        return "earn " + pkWh(Math.abs(value))
    } else if (preferPay) {
        return "pay " + pkWh(0.0);
    } else {
        return "earn " + pkWh(0.0);
    }
};


function PriceTable({ importPrices, exportPrices, viewMin, viewMax }) {
    function min(data) {
        let value = Infinity;
        for (const datapoint of data) {
            if (dayjs(datapoint.x) >= viewMin && dayjs(datapoint.x2) <= viewMax && datapoint.y < value) {
                value = datapoint.y;
            }
        }
        return value;
    }

    function max(data) {
        let value = -Infinity;
        for (const datapoint of data) {
            if (dayjs(datapoint.x) >= viewMin && dayjs(datapoint.x2) <= viewMax && datapoint.y > value) {
                value = datapoint.y;
            }
        }
        return value;
    }

    function mean(data) {
        let count = 0;
        let sum = 0;
        for (const datapoint of data) {
            if (dayjs(datapoint.x) >= viewMin && dayjs(datapoint.x2) <= viewMax) {
                count += 1;
                sum += datapoint.y;
            }
        }
        return sum / count;
    }

    return (
        <div className={"d-flex justify-content-center p-5"}>
            <Table hover responsive>
                <thead>
                <tr>
                    <th></th>
                    <th>Minimum</th>
                    <th>Average</th>
                    <th>Maximum</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <th>Import from grid</th>
                    <td>{payEarn(min(importPrices))}</td>
                    <td>{payEarn(mean(importPrices))}</td>
                    <td>{payEarn(max(importPrices))}</td>
                </tr>
                <tr>
                    <th>Export to grid</th>
                    <td>{payEarn(max(exportPrices))}</td>
                    <td>{payEarn(mean(exportPrices))}</td>
                    <td>{payEarn(min(exportPrices))}</td>
                </tr>
                </tbody>
            </Table>
        </div>
    );
}


function PriceTab({ username, api_token }) {
    const [importPrices, setImportPrices] = useState([]);
    const [exportPrices, setExportPrices] = useState([]);
    const [viewMin, setViewMin] = useState(SCHEDULE_START);
    const [viewMax, setViewMax] = useState(SCHEDULE_END);

    useEffect(() => {
        const options = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${username},${api_token}`,
            },
        };
        fetch(`${process.env.REACT_APP_API_URL}/prices`, options)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                const buildImportPrices = [];
                const buildExportPrices = [];
                for (const [timestep, datapoint] of data.entries()) {
                    const timestamp = SCHEDULE_START.add(timestep, "hour").toString();
                    const successorTimestamp = SCHEDULE_START.add(timestep + 1, "hour").toString()
                    buildImportPrices.push({x: timestamp, x2: successorTimestamp, y: datapoint.import_price});
                    buildExportPrices.push({x: timestamp, x2: successorTimestamp, y: -datapoint.export_price});
                }
                setImportPrices(buildImportPrices);
                setExportPrices(buildExportPrices);
            })
            .catch((error) => console.log(error));
    }, []);

    return (
        <Container className="">
            {/* <h1 className="title">
                Energy price tariff
            </h1> */}
            <p>
                Here is what you will pay or earn for energy in <em>pence (p)</em> per <em>kilowatt-hour (kWh)</em>. 
                <br />
                According to a rate in 2024, 100 pence = £1 (1 British Pound) = $1.28 USD = €1.17 EUR.
            </p>
            <div className="m-3" style={{height: "384px"}}>
                <PricesChart import_prices={importPrices} export_prices={exportPrices} view_min={viewMin} view_max={viewMax} />
            </div>
            <ChartNavigation viewMin={viewMin} setViewMin={setViewMin} viewMax={viewMax} setViewMax={setViewMax} />
            <PriceTable importPrices={importPrices} exportPrices={exportPrices} viewMin={viewMin} viewMax={viewMax} />
        </Container>
    );
}

function DismissiblePriceTab({ username, api_token,  }) {
    const popover = (
        <Popover id="popover-basic" style={{maxWidth:"960px"}}>
            <Popover.Header as="h3">
                <strong>Energy Price Tariff</strong>
            </Popover.Header>
            <Popover.Body style={{width:"768px"}}>
                <PriceTab username={username} api_token={api_token} />
            </Popover.Body>
        </Popover>
    );

    return (
        <OverlayTrigger trigger="click" placement="right-start" overlay={popover} >
            <Button style={{position:"fixed", top:"80px", left:"20px"}}>Price</Button>
        </OverlayTrigger>
    );
  }

export { ChartNavigation, PriceTab, DismissiblePriceTab };
export default PricesChart;
