import { ResponsiveLine } from "@nivo/line";
import graphThemes from "./Graphs.js";
import { useEffect, useState } from "react";

export const LineGraph = (props) => {
  const [data, setData] = useState();
  const [itemsSelectable, setItemsSelectable] = useState([]);
  const [itemsSelected, setItemsSelected] = useState([]);
  const [selectionGraph, setSelectionGraph] = useState(false);
  const [xScale, setXScale] = useState({ type: "point" });
  const fixFollowerData = () => {
    let tempData = {
      id: "Followers",
      data: Object.keys(props.data).map((key) => ({
        x: key,
        y: props.data[key],
      })),
    };
    //console.log(tempData);
    return [tempData];
  };

  //Setup Data per selected values
  useEffect(() => {
    if (props.data === undefined || props.data === null) {
      setData("Bad Data");
      return;
    }
    try {
      if (props.dataName === "followers") {
        setXScale({
          type: "time",
          format: "%Y-%m-%d %H:%M:%S",
          precision: "millisecond",
        });
        setData(fixFollowerData());
      } else if (
        props.dataName === "numMinutes" ||
        props.dataName === "percentTimes"
      ) {
        switch (props.dataVariation) {
          case "songs":
            setItemsSelectable(
              Object.keys(props.data.Tracks).map((key) => ({
                name: props.data.Tracks[key].Name,
                uri: key,
              }))
            );
            break;
          case "artists":
            setItemsSelectable(
              Object.keys(props.data.Artists).map((key) => ({
                name: props.data.Artists[key].Name,
                uri: key,
              }))
            );
            break;
          case "genres":
            setItemsSelectable(
              Object.keys(props.data.Genres).map((key) => ({
                name: key,
                uri: key,
              }))
            );
            break;
          case "eras":
            setItemsSelectable(
              Object.keys(props.data.Eras).map((key) => ({
                name: key,
                uri: key,
              }))
            );
            break;
          default:
            throw new Error("Bad DataVariation=" + props.dataVariation);
        }
        setSelectionGraph(true);
        setData([
          {
            id: "",
            data: [
              {
                x: "",
                y: 0,
              },
            ],
          },
        ]);
      } else if (props.dataName === "percentTimePeriod") {
        let tempDataArr = [];
        //Overall times
        tempDataArr.push({
          id: "Overall",
          data: [
            { x: "morning", y: props.data["Time of Day Breakdown"][0] },
            { x: "afternoon", y: props.data["Time of Day Breakdown"][1] },
            { x: "evening", y: props.data["Time of Day Breakdown"][2] },
            { x: "night", y: props.data["Time of Day Breakdown"][3] },
          ],
        });
        //Yearly -> Monthly
        for (const year of Object.keys(props.data.Yearly)) {
          tempDataArr.push({
            id: year,
            data: [
              {
                x: "morning",
                y: props.data.Yearly[year]["Time of Day Breakdown"][0],
              },
              {
                x: "afternoon",
                y: props.data.Yearly[year]["Time of Day Breakdown"][1],
              },
              {
                x: "evening",
                y: props.data.Yearly[year]["Time of Day Breakdown"][2],
              },
              {
                x: "night",
                y: props.data.Yearly[year]["Time of Day Breakdown"][3],
              },
            ],
          });

          //Monthly data
          for (const month of Object.keys(props.data.Yearly[year].Monthly)) {
            tempDataArr.push({
              id: year + " " + month,
              data: [
                {
                  x: "morning",
                  y: props.data.Yearly[year].Monthly[month][
                    "Time of Day Breakdown"
                  ][0],
                },
                {
                  x: "afternoon",
                  y: props.data.Yearly[year].Monthly[month][
                    "Time of Day Breakdown"
                  ][1],
                },
                {
                  x: "evening",
                  y: props.data.Yearly[year].Monthly[month][
                    "Time of Day Breakdown"
                  ][2],
                },
                {
                  x: "night",
                  y: props.data.Yearly[year].Monthly[month][
                    "Time of Day Breakdown"
                  ][3],
                },
              ],
            });
          }
        }
        console.log(tempDataArr);
        setData(tempDataArr);
      } else if (props.dataName === "numTimesSkipped") {
        setItemsSelectable(
          Object.keys(props.data.Tracks).map((key) => ({
            name: props.data.Tracks[key].Name,
            uri: key,
          }))
        );
        setSelectionGraph(true);
        setData([
          {
            id: "",
            data: [
              {
                x: "",
                y: 0,
              },
            ],
          },
        ]);
      } else {
        setData(props.data);
      }
    } catch (e) {
      console.error(e);
      setData("Bad Data");
    }
    console.log(itemsSelectable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Set data for selected values
  useEffect(() => {
    if (itemsSelected === undefined || itemsSelected[0] === undefined) {
      return;
    }
    //console.log(itemsSelected);
    if (selectionGraph) {
      let readVal =
        props.dataName === "numMinutes"
          ? "Number of Minutes"
          : props.dataName === "percentTimes"
          ? "Average Percentage of Streams"
          : "Skips";
      let itemType =
        props.dataVariation === "songs"
          ? "Tracks"
          : props.dataVariation === "artists"
          ? "Artists"
          : props.dataVariation === "genres"
          ? "Genres"
          : "Eras";
      const years = Object.keys(props.data.Yearly);
      const highestYear = Math.max(...years.map(Number));
      const dataSource =
        props.timeRange === "year"
          ? props.data.Yearly
          : props.data.Yearly[highestYear].Monthly;
      const monthsOrder = [
        "JANUARY",
        "FEBRUARY",
        "MARCH",
        "APRIL",
        "MAY",
        "JUNE",
        "JULY",
        "AUGUST",
        "SEPTEMBER",
        "OCTOBER",
        "NOVEMBER",
        "DECEMBER",
      ];

      //console.log("Main body is");
      //console.log(dataSource);
      console.log(itemsSelected);
      setData(
        itemsSelected.map((item) => ({
          id:
            props.dataVariation === "songs" || props.dataVariation === "artists"
              ? props.data[itemType][item].Name
              : item,
          data:
            props.timeRange === "all"
              ? [
                  {
                    x: "All",
                    y: props.data[itemType][item][readVal],
                  },
                ]
              : Object.entries(dataSource)
                  .map(([timePeriod, timeItems]) => {
                    /*
                console.log("Trying to find ");
                console.log(item);
                console.log("in");
                console.log(timeItems[itemType]);
                console.log(timeItems[itemType][item]);*/
                    if (timeItems[itemType][item] === undefined) {
                      return {
                        x: timePeriod,
                        y: 0,
                      };
                    } else {
                      return {
                        x: timePeriod,
                        y: timeItems[itemType][item][readVal],
                      };
                    }
                  })
                  .sort((a, b) => {
                    return monthsOrder.indexOf(a.x) - monthsOrder.indexOf(b.x);
                  }),
        }))
      );
      console.log(data);
    }
  }, [itemsSelected]);

  if (data === undefined) {
    return <>Still generating graph</>;
  } else if (data === "Bad Data") {
    return <p>Your data is empty!</p>;
  }

  const xAxisTicks =
    xScale.type === "time"
      ? {
          tickValues: [],
        }
      : {};

  try {
    //console.log(data);
    return (
      <>
        {selectionGraph ? (
          <div className="custom-draggable-cancel">
            <select
              style={{ maxWidth: "90%" }}
              name="items"
              value={itemsSelected}
              onChange={(e) => {
                const selectedOptions = Array.from(
                  e.target.selectedOptions
                ).map((option) => option.value);
                setItemsSelected(selectedOptions);
              }}
              multiple={true}
            >
              {itemsSelectable.map((item) => {
                return (
                  <option
                    key={item.uri}
                    value={item.uri}
                    selected={itemsSelected.includes(item.uri)}
                  >
                    {item.name}
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <></>
        )}
        <ResponsiveLine
          theme={graphThemes}
          data={data}
          colors={{ scheme: props.graphTheme }}
          margin={{
            top: 30,
            right: props.legendEnabled ? 110 : 50,
            bottom: selectionGraph ? 170 : 75,
            left: 60,
          }}
          xScale={xScale}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          yFormat=" >-.2f"
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
            ...xAxisTicks,
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
          pointSize={10}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          tooltip={
            props.dataName === "numMinutes" ||
            props.dataName === "percentTimes" ||
            props.dataName === "percentTimePeriod" ||
            props.dataName === "numTimesSkipped"
              ? ({ point }) => {
                  if (point === undefined) {
                    return undefined;
                  } else {
                    return (
                      <div
                        style={{
                          background: "white",
                          padding: "9px 12px",
                          border: "1px solid #ccc",
                        }}
                      >
                        <div>{point.id.slice(0, -2)}</div>
                        <div>
                          {props.dataName.includes("percent")
                            ? "% of time"
                            : props.dataName === "numMinutes"
                            ? "Minutes"
                            : "Times skipped"}
                          :{" "}
                          {point.data.yFormatted *
                            (props.dataName === "percentTimes" ? 100.0 : 1.0)}
                        </div>
                      </div>
                    );
                  }
                }
              : undefined
          }
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
      </>
    );
  } catch (e) {
    console.error(e);
    return <p>Your data is empty!</p>;
  }
};

export default LineGraph;
