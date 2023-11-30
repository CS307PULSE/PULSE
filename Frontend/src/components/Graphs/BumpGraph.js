import { ResponsiveBump } from "@nivo/bump";
import graphThemes from "./Graphs.js";
import { useEffect, useState } from "react";

export const BumpGraph = (props) => {
  const [data, setData] = useState();

  useEffect(() => {
    function indexToString(index) {
      switch (index) {
        case 0:
          return "4 Weeks";
        case 1:
          return "6 Months";
        case 2:
          return "All time";
        default:
          return "You dun goofed";
      }
    }

    if (props.data === undefined || props.data === null) {
      console.log(props.data);
      console.log("Got shit data");
      setData("Bad Data");
      return;
    }

    try {
      if (props.dataName.includes("top")) {
        let dataTemp = [];
        props.data.forEach((arr, index_age) => {
          arr.forEach((item, index_top) => {
            let y = index_top + 1;
            if (y > 50) {
              y = 50;
            }
            const index = dataTemp.findIndex((obj) => obj.id === item.name);
            if (index === -1) {
              dataTemp.push({
                id: item.name,
                data: [{ x: indexToString(index_age), y: y }],
              });
            } else {
              dataTemp[index].data.push({
                x: indexToString(index_age),
                y: y,
              });
            }
          });
        });
        console.log(dataTemp);
        setData(dataTemp);
      } else {
        setData(props.data);
      }
    } catch (e) {
      console.error(e);
      setData("Bad Data");
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (data === undefined) {
    return <>Still generating graph</>;
  } else if (data === "Bad Data") {
    return <p>Your data is empty!</p>;
  }

  try {
    //console.log(data);
    return (
      <div className="GraphSVG">
        <ResponsiveBump
          theme={graphThemes}
          data={data}
          colors={{ scheme: props.graphTheme }}
          margin={{
            top: 30,
            right: props.legendEnabled ? 110 : 50,
            bottom: 75,
            left: 60,
          }}
          lineWidth={3}
          activeLineWidth={6}
          inactiveLineWidth={3}
          inactiveOpacity={0.15}
          pointSize={10}
          activePointSize={16}
          inactivePointSize={0}
          pointColor={{ theme: "background" }}
          pointBorderWidth={3}
          activePointBorderWidth={3}
          pointBorderColor={{ from: "serie.color" }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: props.hortAxisTitle,
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: props.vertAxisTitle,
            legendOffset: -40,
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
          animate={false}
        />
      </div>
    );
  } catch (e) {
    console.error(e);
    return <p>Your data is empty!</p>;
  }
};

export default BumpGraph;
