import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import axios from "axios";
import { useEffect, useState } from "react";

//Sample datas
export const bar1 = [
  {
    day: "Monday",
    degrees: 59,
  },
  {
    day: "Tuesday",
    degrees: 61,
  },
  {
    day: "Wednesday",
    degrees: 55,
  },
  {
    day: "Thursday",
    degrees: 78,
  },
  {
    day: "Friday",
    degrees: 71,
  },
  {
    day: "Saturday",
    degrees: 56,
  },
  {
    day: "Sunday",
    degrees: 67,
  },
];
export const line1 = [
  {
    id: "japan",
    color: "hsl(171, 70%, 50%)",
    data: [
      {
        x: "plane",
        y: 36,
      },
      {
        x: "helicopter",
        y: 197,
      },
      {
        x: "boat",
        y: 19,
      },
      {
        x: "train",
        y: 16,
      },
      {
        x: "subway",
        y: 204,
      },
      {
        x: "bus",
        y: 96,
      },
      {
        x: "car",
        y: 202,
      },
      {
        x: "moto",
        y: 133,
      },
      {
        x: "bicycle",
        y: 92,
      },
      {
        x: "horse",
        y: 31,
      },
      {
        x: "skateboard",
        y: 136,
      },
      {
        x: "others",
        y: 57,
      },
    ],
  },
  {
    id: "france",
    color: "hsl(246, 70%, 50%)",
    data: [
      {
        x: "plane",
        y: 138,
      },
      {
        x: "helicopter",
        y: 263,
      },
      {
        x: "boat",
        y: 8,
      },
      {
        x: "train",
        y: 204,
      },
      {
        x: "subway",
        y: 246,
      },
      {
        x: "bus",
        y: 225,
      },
      {
        x: "car",
        y: 89,
      },
      {
        x: "moto",
        y: 282,
      },
      {
        x: "bicycle",
        y: 23,
      },
      {
        x: "horse",
        y: 37,
      },
      {
        x: "skateboard",
        y: 24,
      },
      {
        x: "others",
        y: 280,
      },
    ],
  },
  {
    id: "us",
    color: "hsl(291, 70%, 50%)",
    data: [
      {
        x: "plane",
        y: 229,
      },
      {
        x: "helicopter",
        y: 10,
      },
      {
        x: "boat",
        y: 242,
      },
      {
        x: "train",
        y: 285,
      },
      {
        x: "subway",
        y: 245,
      },
      {
        x: "bus",
        y: 174,
      },
      {
        x: "car",
        y: 207,
      },
      {
        x: "moto",
        y: 19,
      },
      {
        x: "bicycle",
        y: 109,
      },
      {
        x: "horse",
        y: 44,
      },
      {
        x: "skateboard",
        y: 76,
      },
      {
        x: "others",
        y: 90,
      },
    ],
  },
  {
    id: "germany",
    color: "hsl(6, 70%, 50%)",
    data: [
      {
        x: "plane",
        y: 145,
      },
      {
        x: "helicopter",
        y: 165,
      },
      {
        x: "boat",
        y: 81,
      },
      {
        x: "train",
        y: 118,
      },
      {
        x: "subway",
        y: 244,
      },
      {
        x: "bus",
        y: 286,
      },
      {
        x: "car",
        y: 214,
      },
      {
        x: "moto",
        y: 27,
      },
      {
        x: "bicycle",
        y: 64,
      },
      {
        x: "horse",
        y: 264,
      },
      {
        x: "skateboard",
        y: 74,
      },
      {
        x: "others",
        y: 66,
      },
    ],
  },
  {
    id: "norway",
    color: "hsl(115, 70%, 50%)",
    data: [
      {
        x: "plane",
        y: 174,
      },
      {
        x: "helicopter",
        y: 178,
      },
      {
        x: "boat",
        y: 50,
      },
      {
        x: "train",
        y: 213,
      },
      {
        x: "subway",
        y: 172,
      },
      {
        x: "bus",
        y: 277,
      },
      {
        x: "car",
        y: 55,
      },
      {
        x: "moto",
        y: 40,
      },
      {
        x: "bicycle",
        y: 117,
      },
      {
        x: "horse",
        y: 156,
      },
      {
        x: "skateboard",
        y: 64,
      },
      {
        x: "others",
        y: 36,
      },
    ],
  },
];
export const pie1 = [
  {
    id: "java",
    label: "java",
    value: 195,
  },
  {
    id: "erlang",
    label: "erlang",
    value: 419,
  },
  {
    id: "ruby",
    label: "ruby",
    value: 407,
  },
  {
    id: "haskell",
    label: "haskell",
    value: 474,
  },
  {
    id: "go",
    label: "go",
    value: 71,
  },
];
export const pie2 = [
  {
    id: "java",
    label: "java",
    value: 5000,
  },
  {
    id: "erlang",
    label: "erlang",
    value: 100,
  },
  {
    id: "ruby",
    label: "ruby",
    value: 400,
  },
  {
    id: "haskell",
    label: "haskell",
    value: 10,
  },
  {
    id: "go",
    label: "go",
    value: 1,
  },
];

//Modify graph text color here
const graphThemes = {
  text: {
    fontSize: "var(--graph-text-size)",
    fill: "var(--graph-text-fill)",
  },
  axis: {
    ticks: {
      text: {
        fontSize: "var(--graph-text-size)",
      },
    },
    legend: {
      text: {
        fontSize: "var(--graph-text-size)",
      },
    },
  },
  legends: {
    title: {
      text: {
        fontSize: "var(--graph-text-size)",
      },
    },
    text: {
      fontSize: "var(--graph-text-size)",
    },
    ticks: {
      text: {
        fontSize: "var(--graph-text-size)",
      },
    },
  },
  annotations: {
    text: {
      fontSize: "var(--graph-text-size)",
    },
  },
  tooltip: {
    container: {
      background: "var(--tooltip-container-background)",
      fontSize: "var(--graph-text-size)",
    },
  },
};

//Bar Graph
export const BarGraph = (props) => {
  console.log(props);
  return (
    <ResponsiveBar
      theme={graphThemes}
      data={props.data}
      keys={props.graphKeys}
      indexBy={props.graphIndexBy}
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

//Line Graph
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
            id: "Temp",
            data: [
              {
                x: "plane",
                y: 36,
              },
              {
                x: "helicopter",
                y: 197,
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
      } else {
        setData(props.data);
      }
    } catch (e) {
      console.Error(e);
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
      const readVal =
        props.dataName === "numMinutes"
          ? "Number of Minutes"
          : "Average Percentage of Streams";
      const itemType =
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

      setData(
        itemsSelected.map((item) => ({
          id:
            props.dataVariation === "songs" || props.dataVariation === "artists"
              ? props.data[itemType][item].Name
              : item,
          data: Object.entries(dataSource)
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

  let xAxisTicks = xScale.type === "time" ? [] : "auto";

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
            tickValues: { xAxisTicks },
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
          pointSize={10}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          tooltip={({ point }) => {
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
                  {props.dataName.includes("percent") ? "% of time" : "Minutes"}
                  :{" "}
                  {point.data.yFormatted *
                    (props.dataName === "percentTimes" ? 100.0 : 1.0)}
                </div>
              </div>
            );
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
      </>
    );
  } catch (e) {
    console.error(e);
    return <p>Your data is empty!</p>;
  }
};

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

async function sendSongRequest(spotify_uri) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/player/play_song",
    {
      spotify_uri: spotify_uri,
    }
  );
  const data = response.data;
  return data;
}

async function sendPlaylistRequest(spotify_uri) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/player/play_playlist",
    {
      spotify_uri: spotify_uri,
    }
  );
  const data = response.data;
  return data;
}

async function sendAlbumRequest(spotify_uri) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/player/play_album",
    {
      spotify_uri: spotify_uri,
    }
  );
  const data = response.data;
  return data;
}

export const ImageGraph = (props) => {
  function onClickAction(uri) {
    if (props.clickAction === "playMusic") {
      if (props.dataName.includes("song")) {
        sendSongRequest(uri);
      } else if (props.dataName.includes("album")) {
        sendAlbumRequest(uri);
      } else if (props.dataName.includes("playlist")) {
        sendPlaylistRequest(uri);
      }
    } else {
      const uriParts = uri.split(":");
      const url = `http://open.spotify.com/${uriParts[1]}/${uriParts[2]}`;
      window.open(url, "_blank");
    }
  }

  try {
    return (
      <div
        className="ImageGraph custom-draggable-cancel"
        onWheel={(e) => {
          if (e.deltaY === 0) return;
          e.preventDefault();
          e.currentTarget.scrollTo({
            left: e.currentTarget.scrollLeft + e.deltaY,
            behavior: "auto",
          });
        }}
      >
        {props.dataName.includes("top_artist") ||
        props.dataName.includes("followed_artists") ? (
          props.data.map((artist, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={artist.name}
              onClick={() => onClickAction(artist.uri)}
              style={{ cursor: "pointer" }}
              key={artist.id + index}
            >
              <img
                src={artist.images[0].url}
                alt={artist.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : props.dataName.includes("top_song") ? (
          props.data.map((track, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={track.name + " by " + track.artists[0].name}
              onClick={() => onClickAction(track.uri)}
              style={{ cursor: "pointer" }}
              key={track.id + index}
            >
              <img
                src={track.album.images[0].url}
                alt={track.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : props.dataName.includes("recent_songs") ||
          props.dataName.includes("saved_songs") ? (
          props.data.map((trackObj, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={
                trackObj.track.name +
                " by " +
                trackObj.track.artists[0].name +
                " played at " +
                (props.dataName.includes("recent")
                  ? trackObj.played_at
                  : trackObj.added_at)
              }
              onClick={() => onClickAction(trackObj.track.uri)}
              style={{ cursor: "pointer" }}
              key={trackObj.track.id + index}
            >
              <img
                src={trackObj.track.album.images[0].url}
                alt={trackObj.track.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : props.dataName.includes("saved_albums") ? (
          props.data.map((album, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={
                album.album.name + " by " + album.album.artists[0].name
              }
              onClick={() => onClickAction(album.album.uri)}
              style={{ cursor: "pointer" }}
              key={album.album.id + index}
            >
              <img
                src={album.album.images[0].url}
                alt={album.album.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : props.dataName.includes("saved_playlists") ? (
          props.data.map((playlist, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={
                playlist.name + " created by " + playlist.owner.display_name
              }
              onClick={() => onClickAction(playlist.uri)}
              style={{ cursor: "pointer" }}
              key={playlist.id + index}
            >
              <img
                src={playlist.images[0].url}
                alt={playlist.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : props.dataName.includes("song_recommendations") ? (
          props.data.map((trackObj, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={
                trackObj.track.name + " by " + trackObj.track.artists[0].name
              }
              onClick={() => onClickAction(trackObj.track.uri)}
              style={{ cursor: "pointer" }}
              key={trackObj.track.id + index}
            >
              <img
                src={trackObj.track.album.images[0].url}
                alt={trackObj.track.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : (
          <p>Bad data name</p>
        )}

        <Tooltip id="body-tooltip" />
      </div>
    );
  } catch (e) {
    console.log(e);
    return <p>Your data is empty!</p>;
  }
};
