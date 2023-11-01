import { ResponsiveBar } from "@nivo/bar";
import graphThemes from "./Graphs.js";

//Bar Graph
export const BarGraph = (props) => {
  return (
    <ResponsiveBar
      theme={graphThemes}
      data={props.data}
      keys={props.graphKeys}
      indexBy={props.graphIndexBy}
      layout={props.graphName === "VertBar" ? "vertical" : "horizontal"}
      margin={{
        top: 30,
        right: props.legendEnabled ? 110 : 50,
        bottom: 70,
        left: 60,
      }}
      padding={0.4}
      valueScale={{ type: "linear" }}
      colors={{ scheme: props.graphTheme }}
      animate={true}
      enableLabel={false}
      axisTop={null}
      axisRight={null}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: props.vertAxisTitle,
        legendPosition: "middle",
        legendOffset: -40,
      }}
      axisBottom={{
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: props.hortAxisTitle,
        legendOffset: 36,
        legendPosition: "middle",
      }}
      legends={
        props.legendEnabled
          ? [
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]
          : undefined
      }
    />
  );
};

export default BarGraph;
