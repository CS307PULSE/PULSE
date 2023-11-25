import { ResponsiveLine } from "@nivo/line";
import graphThemes from "./Graphs.js";
import { useEffect, useState } from "react";
import FilterPopup from "./FilterPopup.js";
import {
  formatFollowerData,
  setupAdvancedData,
  formatAdvancedGraphData,
} from "./DataFormatter.js";

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

  //Setup Data per selected values
  useEffect(() => {
    console.log("Graph props");
    console.log(props);
    if (props.data === undefined || props.data === null) {
      setData("Bad Data");
      return;
    } else if (props.data === "Empty") {
      setData("Advanced Data Failed to Load");
      return;
    }
    try {
      if (props.dataName === "followers") {
        setXScale({
          type: "time",
          format: "%Y-%m-%d %H:%M:%S",
          precision: "millisecond",
        });
        setData(formatFollowerData(props));
      } else if (
        //Advanced data
        props.dataName === "numMinutes" ||
        props.dataName === "numStreams" ||
        props.dataName === "percentTimes" ||
        props.dataName === "percentTimePeriod" ||
        props.dataName === "numTimesSkipped"
      ) {
        const recievedData = setupAdvancedData(props);
        setSelectionGraph(recievedData.selectionGraph);
        setItemsSelectable(recievedData.itemsSelectable);
        setData(recievedData.data);
      } else {
        //Sample data
        setData(props.data);
      }
    } catch (e) {
      console.error(e);
      setData("Bad Data");
    }
    setItemsSelected(props.selectedData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Set data for selected values
  useEffect(() => {
    if (itemsSelected === undefined || itemsSelected[0] === undefined) {
      return;
    }
    //console.log(itemsSelected);
    if (selectionGraph) {
      setData(formatAdvancedGraphData(props, itemsSelected));
      props.selectData(itemsSelected, props.graphName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsSelected]);

  if (data === undefined) {
    return <>Still generating graph</>;
  } else if (data === "Bad Data") {
    return <p>Your data is empty!</p>;
  } else if (data === "Advanced Data Failed to Load") {
    return <p>Advanced Data is unavailable right now!</p>;
  }

  const xAxisTicks =
    xScale.type === "time"
      ? {
          tickValues: [],
        }
      : {};

  try {
    console.log(data);
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
              ¥
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
            props.dataName === "numStreams" ||
            props.dataName === "percentTimes" ||
            props.dataName === "percentTimePeriod" ||
            props.dataName === "numTimesSkipped"
              ? ({ point }) => {
                  //console.log(point);
                  if (point === undefined) {
                    return undefined;
                  } else {
                    return (
                      <div className="GraphTooltip">
                        <div>
                          {props.dataVariation === "all"
                            ? point.id.slice(0, -2) +
                              " " +
                              point.data.xFormatted
                            : point.id.slice(0, -2)}
                        </div>
                        <div>
                          {props.dataName.includes("percent")
                            ? "% of time"
                            : props.dataName === "numMinutes"
                            ? "Minutes"
                            : props.dataName === "numStreams"
                            ? "Number of streams"
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
