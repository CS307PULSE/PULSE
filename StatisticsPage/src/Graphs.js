import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";

const data = [
  {
    day: "Monday",
    degress: 59,
  },
  {
    day: "Tuesday",
    degress: 61,
  },
  {
    day: "Wednesday",
    degress: 55,
  },
  {
    day: "Thursday",
    degress: 78,
  },
  {
    day: "Friday",
    degress: 71,
  },
  {
    day: "Saturday",
    degress: 56,
  },
  {
    day: "Sunday",
    degress: 67,
  },
];

const data2 = [
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

export const BarGraph = () => {
  return (
    <ResponsiveBar
      data={data}
      keys={["degress"]}
      indexBy="day"
      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
      padding={0.4}
      valueScale={{ type: "linear" }}
      colors="#3182CE"
      animate={true}
      enableLabel={false}
      axisTop={null}
      axisRight={null}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "degrees",
        legendPosition: "middle",
        legendOffset: -40,
      }}
    />
  );
};

export const LineGraph = () => (
  <ResponsiveLine
    data={data2}
    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
    xScale={{ type: "point" }}
    yScale={{
      type: "linear",
      min: "auto",
      max: "auto",
      stacked: true,
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
      legend: "transportation",
      legendOffset: 36,
      legendPosition: "middle",
    }}
    axisLeft={{
      orient: "left",
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "count",
      legendOffset: -40,
      legendPosition: "middle",
    }}
    pointSize={10}
    pointColor={{ theme: "background" }}
    pointBorderWidth={2}
    pointBorderColor={{ from: "serieColor" }}
    pointLabelYOffset={-12}
    useMesh={true}
    legends={[
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
    ]}
  />
);

export default BarGraph;
