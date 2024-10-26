import {Chart as ChartJS} from "chart.js/auto";
import dayjs from "dayjs";
import {Bar} from "react-chartjs-2";

import "chartjs-plugin-annotation";
import {Ticks, Tooltip} from "chart.js";
import "dayjs/locale/en-gb";

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
    if (elements.length === 0) {
        return false;
    }
    const tooltip = this;
    const element = elements[0].element;
    return {
        x: element.x >= tooltip.chart.width / 2 ? element.x - element.width : element.x,
        y: element.y,
    };
};


function ScheduleChart({ tasks, schedule_start, view_min, view_max, data_labels }) {
    const appliance_data = [];
    const battery_charge_data = [];
    const battery_discharge_data = [];
    for (const task of tasks) {
        const start = schedule_start.add(task.start, "hour");
        const end = schedule_start.add(task.start + task.duration, "hour");
        const datapoint = {x: [start.toString(), end.toString()], y: task.device};
        if (task.device === "Battery") {
            if (task.action === "Charge") {
                battery_charge_data.push(datapoint);
            } else if (task.action === "Discharge") {
                battery_discharge_data.push(datapoint);
            }
        } else {
            appliance_data.push(datapoint);
        }
    }
    if (data_labels === undefined) {
        data_labels = ["Battery"];
    }
    return (
        <Bar
            datasetIdKey={"label"}
            data={{
                // labels: ["Washer", "Dryer", "Battery"],
                labels: data_labels,
                datasets: [
                    {
                        label: "Appliance on",
                        data: appliance_data,
                        backgroundColor: cssColour("second", 0.4),
                        borderColor: cssColour("second", 1.0),
                        borderWidth: 3,
                        borderSkipped: false,
                    },
                    {
                        label: "Battery charge",
                        data: battery_charge_data,
                        backgroundColor: cssColour("first", 0.4),
                        borderColor: cssColour("first", 1.0),
                        borderWidth: 3,
                        borderSkipped: false,
                    },
                    {
                        label: "Battery discharge",
                        data: battery_discharge_data,
                        backgroundColor: cssColour("fourth", 0.4),
                        borderColor: cssColour("fourth", 1.0),
                        borderWidth: 3,
                        borderSkipped: false,
                    },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                scales: {
                    x: {
                        type: "time",
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
                        grid: {
                            display: true,
                            drawOnChartArea: false,
                        },
                        border: {
                            display: false,
                        },
                        min: view_min.toString(),
                        max: view_max.toString(),
                        afterTickToLabelConversion: function(scale) {
                            scale.ticks[scale.ticks.length-1].label = "";
                        },
                        title: {
                            display: true,
                            text: function(ctx) {
                                return ctx.scale._unit === "hour" ? dayjs(ctx.scale.ticks[0].value).format("dddd") : "";
                            },
                        },
                    },
                    y: {
                        stacked: true,
                    },
                    y2: {
                        position: "right",
                        grid: {
                            display: true,
                            drawOnChartArea: false,
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                        onClick: null,
                    },
                    tooltip: {
                        position: "customTooltipPosition",
                        callbacks: {
                            label: function(context) {
                                const start = dayjs(context.raw.x[0]);
                                const end = dayjs(context.raw.x[1]);
                                let label = context.dataset.label.split(" ")[1];
                                label = label.charAt(0).toUpperCase() + label.substring(1);
                                if (start.day() === end.day()) {
                                    return label + ": " + start.format("dddd") + " " + start.format("HH:mm") + "-" + end.format("HH:mm");
                                } else {
                                    return label + ": " + start.format("dddd") + " " + start.format("HH:mm") + " to " + end.format("dddd") + " " + end.format("HH:mm");
                                }
                            }
                        },
                    },
                }
            }}
        />
    );
}

export default ScheduleChart;
