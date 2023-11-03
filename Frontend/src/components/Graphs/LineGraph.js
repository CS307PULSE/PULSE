import { ResponsiveLine } from "@nivo/line";
import graphThemes from "./Graphs.js";
import { useEffect, useState } from "react";
import FilterPopup from "./FilterPopup.js";

export const LineGraph = (props) => {
  //Functions to enable opening and closing of the "Filter" menu
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const openPopup = () => {
    setIsPopupOpen(true);
  };
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const [data, setData] = useState();
  const [itemsSelectable, setItemsSelectable] = useState([]);
  const [itemsSelected, setItemsSelected] = useState([]);
  const [selectionGraph, setSelectionGraph] = useState(false);
  const [xScale, setXScale] = useState({ type: "point" });
  const fixFollowerData = () => {
    if (props.bothFriendAndOwnData) {
      let tempData = {
        id: "User Followers",
        data: Object.keys(props.data[0]).map((key) => ({
          x: key,
          y: props.data[key],
        })),
      };
      let tempData2 = {
        id: props.friendName + " Followers",
        data: Object.keys(props.data[1]).map((key) => ({
          x: key,
          y: props.data[key],
        })),
      };
      console.log([tempData, tempData2]);
      return [tempData, tempData2];
    } else if (props.friendName !== undefined) {
      let tempData = {
        id: props.friendName + " Followers",
        data: Object.keys(props.data).map((key) => ({
          x: key,
          y: props.data[key],
        })),
      };
      console.log([tempData]);
      return [tempData];
    } else {
      let tempData = {
        id: "User Followers",
        data: Object.keys(props.data).map((key) => ({
          x: key,
          y: props.data[key],
        })),
      };
      console.log([tempData]);
      return [tempData];
    }
    //console.log(tempData);
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
        if (props.bothFriendAndOwnData) {
          tempDataArr.push({
            id: "User Overall",
            data: [
              { x: "morning", y: props.data[0]["Time of Day Breakdown"][0] },
              { x: "afternoon", y: props.data[0]["Time of Day Breakdown"][1] },
              { x: "evening", y: props.data[0]["Time of Day Breakdown"][2] },
              { x: "night", y: props.data[0]["Time of Day Breakdown"][3] },
            ],
          });
          tempDataArr.push({
            id: props.friendName + "Overall",
            data: [
              { x: "morning", y: props.data[1]["Time of Day Breakdown"][0] },
              { x: "afternoon", y: props.data[1]["Time of Day Breakdown"][1] },
              { x: "evening", y: props.data[1]["Time of Day Breakdown"][2] },
              { x: "night", y: props.data[1]["Time of Day Breakdown"][3] },
            ],
          });
        } else {
          tempDataArr.push({
            id: "User Overall",
            data: [
              { x: "morning", y: props.data["Time of Day Breakdown"][0] },
              { x: "afternoon", y: props.data["Time of Day Breakdown"][1] },
              { x: "evening", y: props.data["Time of Day Breakdown"][2] },
              { x: "night", y: props.data["Time of Day Breakdown"][3] },
            ],
          });
        }

        //Yearly -> Monthly
        if (props.bothFriendAndOwnData) {
          //Yearly data
          for (const year of Object.keys(props.data[1].Yearly)) {
            tempDataArr.push({
              id: props.friendName + " " + year,
              data: [
                {
                  x: "morning",
                  y: props.data[1].Yearly[year]["Time of Day Breakdown"][0],
                },
                {
                  x: "afternoon",
                  y: props.data[1].Yearly[year]["Time of Day Breakdown"][1],
                },
                {
                  x: "evening",
                  y: props.data[1].Yearly[year]["Time of Day Breakdown"][2],
                },
                {
                  x: "night",
                  y: props.data[1].Yearly[year]["Time of Day Breakdown"][3],
                },
              ],
            });
            //Monthly data
            for (const month of Object.keys(
              props.data[1].Yearly[year].Monthly
            )) {
              tempDataArr.push({
                id: props.friendName + year + " " + month,
                data: [
                  {
                    x: "morning",
                    y: props.data[1].Yearly[year].Monthly[month][
                      "Time of Day Breakdown"
                    ][0],
                  },
                  {
                    x: "afternoon",
                    y: props.data[1].Yearly[year].Monthly[month][
                      "Time of Day Breakdown"
                    ][1],
                  },
                  {
                    x: "evening",
                    y: props.data[1].Yearly[year].Monthly[month][
                      "Time of Day Breakdown"
                    ][2],
                  },
                  {
                    x: "night",
                    y: props.data[1].Yearly[year].Monthly[month][
                      "Time of Day Breakdown"
                    ][3],
                  },
                ],
              });
            }
          }

          for (const year of Object.keys(props.data[0].Yearly)) {
            tempDataArr.push({
              id: "User " + year,
              data: [
                {
                  x: "morning",
                  y: props.data[0].Yearly[year]["Time of Day Breakdown"][0],
                },
                {
                  x: "afternoon",
                  y: props.data[0].Yearly[year]["Time of Day Breakdown"][1],
                },
                {
                  x: "evening",
                  y: props.data[0].Yearly[year]["Time of Day Breakdown"][2],
                },
                {
                  x: "night",
                  y: props.data[0].Yearly[year]["Time of Day Breakdown"][3],
                },
              ],
            });

            //Monthly data
            for (const month of Object.keys(
              props.data[0].Yearly[year].Monthly
            )) {
              tempDataArr.push({
                id: "User" + year + " " + month,
                data: [
                  {
                    x: "morning",
                    y: props.data[0].Yearly[year].Monthly[month][
                      "Time of Day Breakdown"
                    ][0],
                  },
                  {
                    x: "afternoon",
                    y: props.data[0].Yearly[year].Monthly[month][
                      "Time of Day Breakdown"
                    ][1],
                  },
                  {
                    x: "evening",
                    y: props.data[0].Yearly[year].Monthly[month][
                      "Time of Day Breakdown"
                    ][2],
                  },
                  {
                    x: "night",
                    y: props.data[0].Yearly[year].Monthly[month][
                      "Time of Day Breakdown"
                    ][3],
                  },
                ],
              });
            }
          }
        } else {
          //Yearly data
          for (const year of Object.keys(props.data.Yearly)) {
            tempDataArr.push({
              id: "User " + year,
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
      console.log(props.data);
      setData(
        itemsSelected.map((item) => ({
          id:
            props.dataVariation === "songs" || props.dataVariation === "artists"
              ? props.data[itemType][item].Name
              : item,
          data:
            props.timeRange === "all"
              ? [
                  props.bothFriendAndOwnData
                    ? ({
                        x: "User All",
                        y: props.data[0][itemType][item][readVal],
                      },
                      {
                        x: props.friendName + "All",
                        y: props.data[1][itemType][item][readVal],
                      })
                    : {
                        x:
                          props.friendName !== undefined
                            ? props.friendName + "All"
                            : "User All",
                        y: props.data[itemType][item][readVal],
                      },
                ]
              : Object.entries(dataSource)
                  .map(([timePeriod, timeItems]) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <>
            <FilterPopup
              isOpen={isPopupOpen}
              onClose={closePopup}
              setItems={setItemsSelected}
              itemsSelectable={itemsSelectable}
            />
            <button
              className="PopupCloseButton custom-draggable-cancel"
              onClick={openPopup}
            >
              Filter
            </button>
          </>
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
            bottom: selectionGraph ? 95 : 75,
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
                      <div className="GraphTooltip">
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
