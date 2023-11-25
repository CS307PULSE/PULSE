import { ResponsiveBar } from "@nivo/bar";
import graphThemes from "./Graphs.js";
import { useEffect, useState } from "react";
import FilterPopup from "./FilterPopup.js";
import { setupAdvancedData, formatAdvancedGraphData } from "./DataFormatter.js";

export const BarGraph = (props) => {
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
      if (
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
  console.log(data);

  return (
    <div className="GraphSVG">
      {selectionGraph ? (
        <>
          <FilterPopup
            isOpen={isPopupOpen}
            onClose={closePopup}
            setItems={setItemsSelected}
            itemsSelectable={itemsSelectable}
          />
          <button
            className="FilterButton custom-draggable-cancel"
            onClick={openPopup}
          >
            ¥
          </button>
        </>
      ) : (
        <></>
      )}
      <ResponsiveBar
        theme={graphThemes}
        data={data}
        keys={props.graphKeys}
        indexBy={props.graphIndexBy}
        layout={props.graphType === "VertBar" ? "vertical" : "horizontal"}
        margin={{
          top: 30,
          right: props.legendEnabled ? 110 : 50,
          bottom: 75,
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
    </div>
  );
};

export default BarGraph;
