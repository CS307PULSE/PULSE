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

//Returns name from dataName
export const nameFromDataName = (name) => {
  switch (name) {
    case "numMinutes":
      return "Number of minutes listened to";
    case "percentTimes":
      return "% of music listened to";
    case "percentTimePeriod":
      return "Times listened to per time period";
    case "numTimesSkipped":
      return "Times listened to or skipped or repeated";
    case "emotion":
      return "Emotion of music listened to";
    case "followers":
      return "Followers";
    case "top_songs":
      return "Top Songs";
    case "top_artists":
      return "Top Artists";
    case "recent_songs":
      return "Recent Songs";
    case "saved_songs":
      return "Saved Songs";
    case "saved_albums":
      return "Saved Albums";
    case "saved_playlists":
      return "Saved Playlists";
    case "followed_artists":
      return "Followed Artists";
    case "bar1":
    case "line1":
    case "pie1":
    case "pie2":
      return "Sample data";
    default:
      return "I dont know what " + name + " is";
  }
};

//Modify graph text color here
export const graphThemes = {
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

export default graphThemes;
