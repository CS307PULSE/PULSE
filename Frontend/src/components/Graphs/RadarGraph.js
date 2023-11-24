import { ResponsiveRadar } from "@nivo/radar";
import { useEffect, useState } from "react";
import FilterPopup from "./FilterPopup.js";
import axios from "axios";
import graphThemes from "./Graphs.js";

async function getEmotion(track_uri, track_popularity) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/stats/emotion_percent",
    { trackid: track_uri, popularity: track_popularity }
  );
  const data = response.data;
  console.log("Got");
  console.log(response);
  return data;
}

export const RadarGraph = (props) => {
  //Functions to enable opening and closing of the "Filter" menu
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const openPopup = () => {
    setIsPopupOpen(true);
  };
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const [data, setData] = useState();
  const [keys, setKeys] = useState([]);
  const [itemsSelected, setItemsSelected] = useState([]);

  useEffect(() => {
    setItemsSelected(props.selectedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log(itemsSelected);
    if (itemsSelected === undefined || itemsSelected.length === 0) {
      return;
    }
    if (props.dataName.includes("emotion")) {
      setKeys([itemsSelected[0].name]);
      getEmotion(itemsSelected[0].id, itemsSelected[0].popularity).then(
        (emotions) => {
          const tempObj = [
            {
              emotion: "Angry",
              [itemsSelected[0]["name"]]: emotions["percent_angry"] * 100,
            },
            {
              emotion: "Happy",
              [itemsSelected[0]["name"]]: emotions["percent_happy"] * 100,
            },
            {
              emotion: "Sad",
              [itemsSelected[0]["name"]]: emotions["percent_sad"] * 100,
            },
          ];
          setData(tempObj);
        }
      );
    }
    props.selectData(itemsSelected, props.graphName);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsSelected]);

  if (data === undefined) {
    return (
      <>
        <FilterPopup
          isOpen={isPopupOpen}
          onClose={closePopup}
          setItems={setItemsSelected}
        />
        <button
          className="PopupCloseButton custom-draggable-cancel"
          onClick={openPopup}
        >
          Select Data
        </button>
      </>
    );
  }
  return (
    <>
      {props.data === undefined ? (
        <>
          <FilterPopup
            isOpen={isPopupOpen}
            onClose={closePopup}
            setItems={setItemsSelected}
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
      <ResponsiveRadar
        theme={graphThemes}
        data={data}
        keys={keys}
        indexBy="emotion"
        maxValue={1.0}
        valueFormat=">-.2f"
        margin={{
          top: 40,
          right: props.legendEnabled ? 110 : 50,
          bottom: 75,
          left: 60,
        }}
        borderColor={{ from: "color" }}
        gridLabelOffset={36}
        dotSize={10}
        dotColor={{ theme: "background" }}
        dotBorderWidth={2}
        colors={{ scheme: props.graphTheme }}
        blendMode="multiply"
        motionConfig="wobbly"
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
};

export default RadarGraph;
