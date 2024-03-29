import { ResponsivePie } from "@nivo/pie";
import graphThemes from "./Graphs.js";
import { useEffect, useState } from "react";
import FilterPopup from "./FilterPopup.js";
import { setupAdvancedData, formatAdvancedGraphData } from "./DataFormatter.js";

//Pie Graph
export const PieGraph = (props) => {
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
    //console.log("Graph props");
    //console.log(props);
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

  try {
    //console.log(data);
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
        <ResponsivePie
          theme={graphThemes}
          data={data}
          colors={{ scheme: props.graphTheme }}
          margin={{
            top: 40,
            right: props.legendEnabled ? 110 : 40,
            bottom: selectionGraph ? 95 : 75,
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
      </div>
    );
  } catch (e) {
    console.error(e);
    return <p>Your data is empty!</p>;
  }
};

export default PieGraph;
