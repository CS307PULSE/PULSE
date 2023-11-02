import { ResponsivePie } from "@nivo/pie";
import graphThemes from "./Graphs.js";

//Pie Graph
export const PieGraph = (props) => {
  try {
    return (
      <ResponsivePie
        theme={graphThemes}
        data={props.data}
        colors={{ scheme: props.graphTheme }}
        margin={{
          top: 40,
          right: props.legendEnabled ? 110 : 40,
          bottom: 80,
          left: 40,
        }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        enableArcLabels={false}
        enableArcLinkLabels={false}
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
  } catch (e) {
    console.log(e);
    return <p>Your data is empty!</p>;
  }
};

export default PieGraph;
