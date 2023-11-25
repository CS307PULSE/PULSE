/*
Functions needed
    followers
    numMinutes
    numStreams
    percentTimes
    percentTimePeriod
    numTimesSkipped
*/

export function formatFollowerData(props) {
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
    return [tempData, tempData2];
  } else if (props.friendName !== undefined) {
    let tempData = {
      id: props.friendName + " Followers",
      data: Object.keys(props.data).map((key) => ({
        x: key,
        y: props.data[key],
      })),
    };
    return [tempData];
  } else {
    let tempData = {
      id: "User Followers",
      data: Object.keys(props.data).map((key) => ({
        x: key,
        y: props.data[key],
      })),
    };
    return [tempData];
  }
}

export function setupAdvancedData(props) {
  const emptyData = [
    {
      id: "",
      data: [
        {
          x: "",
          y: 0,
        },
      ],
    },
  ];
  let data = "Bad Data";
  let itemsSelectable = [];
  let selectionGraph = false;
  try {
    if (
      props.dataName === "numMinutes" ||
      props.dataName === "numStreams" ||
      props.dataName === "percentTimes" ||
      props.dataName === "numTimesSkipped"
    ) {
      if (props.dataVariation === "all") {
        selectionGraph = false;
        data = formatAdvancedGraphData(props, []);
        //Num time skipped goes always down to this one
      } else {
        itemsSelectable = formatSelectableItems(props);
        selectionGraph = true;
        data = emptyData;
      }
    } else if (props.dataName === "percentTimePeriod") {
      selectionGraph = false;
      //Yearly -> Monthly
      if (props.bothFriendAndOwnData) {
        data = formatPercentTimePeriod("User", props.data[0]);
        data = data.concat(
          formatPercentTimePeriod(props.friendName, props.data[1])
        );
      } else {
        data = formatPercentTimePeriod(
          props.friendName !== undefined ? props.friendName : "User",
          props.data
        );
      }
    }
  } catch (e) {
    console.error(e);
  }

  return {
    data: formatForDifferentGraphs(props, data),
    itemsSelectable: itemsSelectable,
    selectionGraph: selectionGraph,
  };
}

export function formatAdvancedGraphData(props, itemsSelected) {
  const readVal =
    props.dataName === "numMinutes"
      ? "Number of Minutes"
      : props.dataName === "percentTimes"
      ? "Average Percentage of Streams"
      : props.dataName === "numStreams"
      ? "Number of Streams"
      : "Skips";
  let itemType = props.dataVariation;
  const years = props.bothFriendAndOwnData
    ? Array.from(
        new Set(props.data.map((item) => Object.keys(item.Yearly)).flat())
      ).sort(function (a, b) {
        return a - b;
      })
    : Object.keys(props.data.Yearly).sort(function (a, b) {
        return a - b;
      });
  const highestYear = Math.max(...years.map(Number));
  const dataSource = props.bothFriendAndOwnData
    ? props.timeRange === "year"
      ? [props.data[0].Yearly, props.data[1].Yearly]
      : [
          props.data[0].Yearly[highestYear].Monthly,
          props.data[1].Yearly[highestYear].Monthly,
        ]
    : props.timeRange === "year"
    ? [props.data.Yearly]
    : [props.data.Yearly[highestYear].Monthly];
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
  let dataOrder = ["Overall"];
  for (const year of years) {
    dataOrder.push(year);
    for (const month of monthsOrder) {
      dataOrder.push(month + " " + year);
    }
  }
  let dataOrders = [];
  for (const item of dataOrder) {
    dataOrders.push("User " + item);
    dataOrders.push(props.friendName + " " + item);
  }

  let params = {
    itemType: itemType,
    itemsSelected: itemsSelected,
    readVal: readVal,
    dataOrder: dataOrders,
    dataSource: dataSource,
  };

  let data;
  if (props.dataVariation === "all") {
    data = formatAllTimeGraphData(props, params);
  } else {
    data = formatSelectionGraphData(props, params);
  }

  return formatForDifferentGraphs(props, data);
}

function formatForDifferentGraphs(props, data) {
  switch (props.graphType) {
    case "Pie":
      let pieData = [];
      for (const item of data) {
        pieData.push(
          ...item.data.map((itemDataPoints) => {
            return {
              id: itemDataPoints.x + " - " + item.id,
              label: itemDataPoints.x + " - " + item.id,
              value: itemDataPoints.y,
            };
          })
        );
      }
      return pieData;
    case "VertBar":
    case "HortBar":
      let barData = [];
      for (const item of data) {
        barData.push(
          ...item.data.map((itemDataPoints) => {
            return {
              id: itemDataPoints.x + " - " + item.id,
              value: itemDataPoints.y,
            };
          })
        );
      }
      return barData;
    default:
      return data;
  }
}

function formatSelectionGraphData(props, params) {
  let itemsData = [];
  function formatXY(id, data, itemType, item, readVal) {
    if (data[itemType][item] !== undefined) {
      return {
        x: id,
        y: data[itemType][item][readVal],
      };
    } else {
      return {
        x: id,
        y: 0,
      };
    }
  }

  for (const item of params.itemsSelected) {
    let id = "";
    let data = [];
    if (props.dataVariation === "Tracks" || props.dataVariation === "Artists") {
      const tempData = props.bothFriendAndOwnData ? props.data : [props.data];
      tempData.forEach((userData) => {
        if (userData[params.itemType][item].Name !== undefined) {
          id = userData[params.itemType][item].Name;
        }
      });
    } else {
      id = item;
    }

    if (props.timeRange === "all") {
      const tempData = props.bothFriendAndOwnData ? props.data : [props.data];
      tempData.forEach((userData, index) => {
        if (index === 0) {
          data = [
            formatXY(
              props.bothFriendAndOwnData
                ? props.friendName + " Overall"
                : "User Overall",
              userData,
              params.itemType,
              item,
              params.readVal
            ),
          ];
        } else {
          data.push(
            formatXY(
              props.friendName + " All",
              props.data[1],
              params.itemType,
              item,
              params.readVal
            )
          );
        }
      });
    } else {
      params.dataSource.forEach((userData, index) => {
        if (index === 0) {
          data = Object.entries(userData)
            .map(([timePeriod, timeItems]) => {
              return formatXY(
                props.bothFriendAndOwnData
                  ? props.friendName + " " + timePeriod
                  : "User " + timePeriod,
                timeItems,
                params.itemType,
                item,
                params.readVal
              );
            })
            .sort((a, b) => {
              return (
                params.dataOrder.indexOf(a.x) - params.dataOrder.indexOf(b.x)
              );
            });
        } else {
          data.concat(
            Object.entries(userData)
              .map(([timePeriod, timeItems]) => {
                return formatXY(
                  props.friendName + " " + timePeriod,
                  timeItems,
                  params.itemType,
                  item,
                  params.readVal
                );
              })
              .sort((a, b) => {
                return (
                  params.dataOrder.indexOf(a.x) - params.dataOrder.indexOf(b.x)
                );
              })
          );
        }
      });
    }
    itemsData.push({ id: id, data: data });
  }
  return itemsData;
}

function formatAllTimeGraphData(props, params) {
  let data;
  if (props.bothFriendAndOwnData) {
    const itemName = [props.friendName, "User"];
    let tempDataArr = props.data.map((user, index) => {
      let tempUserData = [];
      //Overall data
      tempUserData.push({
        x: "Overall",
        y: props.data[index][params.readVal],
      });

      //Yearly & monthly
      for (const year of Object.keys(props.data[index].Yearly)) {
        tempUserData.push({
          x: year,
          y: props.data[index].Yearly[year][params.readVal],
        });

        //Monthly data
        for (const month of Object.keys(
          props.data[index].Yearly[year].Monthly
        )) {
          tempUserData.push({
            x: month + " " + year,
            y: props.data[index].Yearly[year].Monthly[month][params.readVal],
          });
        }
      }
      tempUserData.sort((a, b) => {
        return params.dataOrder.indexOf(a.x) - params.dataOrder.indexOf(b.x);
      });
      return tempUserData;
    });
    data = [
      { id: itemName[0], data: tempDataArr[0] },
      { id: itemName[1], data: tempDataArr[1] },
    ];
  } else {
    let tempDataArr = [];
    //Overall data
    const itemName = props.friendName !== undefined ? props.friendName : "User";
    tempDataArr.push({ x: "Overall", y: props.data[params.readVal] });

    //Yearly & monthly
    for (const year of Object.keys(props.data.Yearly)) {
      tempDataArr.push({
        x: year,
        y: props.data.Yearly[year][params.readVal],
      });

      //Monthly data
      for (const month of Object.keys(props.data.Yearly[year].Monthly)) {
        tempDataArr.push({
          x: month + " " + year,
          y: props.data.Yearly[year].Monthly[month][params.readVal],
        });
      }
    }
    tempDataArr.sort((a, b) => {
      return params.dataOrder.indexOf(a.x) - params.dataOrder.indexOf(b.x);
    });
    data = [{ id: itemName, data: tempDataArr }];
  }
  return data;
}

function formatPercentTimePeriod(
  name,
  data,
  overallData = true,
  yearData = true,
  monthData = true
) {
  const formatData = (subData) => [
    { x: "morning", y: subData["Time of Day Breakdown"][0] },
    { x: "afternoon", y: subData["Time of Day Breakdown"][1] },
    { x: "evening", y: subData["Time of Day Breakdown"][2] },
    { x: "night", y: subData["Time of Day Breakdown"][3] },
  ];

  let tempDataArr = [];
  if (overallData) {
    tempDataArr.push({
      id: name + " Overall",
      data: formatData(data),
    });
  } else {
    for (const year of Object.keys(data.Yearly)) {
      if (yearData) {
        tempDataArr.push({
          id: name + " " + year,
          data: formatData(data.Yearly[year]),
        });
      }
      if (monthData) {
        for (const month of Object.keys(data.Yearly[year].Monthly)) {
          tempDataArr.push({
            id: name + year + " " + month,
            data: formatData(data.Yearly[year].Monthly[month]),
          });
        }
      }
    }
  }
  return tempDataArr;
}

function formatSelectableItems(props) {
  const uniqueObjSet = new Set();
  let itemsSelectable = [];
  const validDataVariation = ["Tracks", "Artists", "Genres", "Eras"];
  if (!validDataVariation.includes(props.dataVariation)) {
    throw new Error("Bad DataVariation=" + props.dataVariation);
  }

  //Variables for sorting
  const readVal =
    props.dataName === "numMinutes"
      ? "Number of Minutes"
      : props.dataName === "percentTimes"
      ? "Average Percentage of Streams"
      : props.dataName === "numStreams"
      ? "Number of Streams"
      : "Skips";
  const years = props.bothFriendAndOwnData
    ? Array.from(
        new Set(props.data.map((item) => Object.keys(item.Yearly)).flat())
      ).sort(function (a, b) {
        return b - a;
      })
    : Object.keys(props.data.Yearly).sort(function (a, b) {
        return b - a;
      });
  const dataSource = props.bothFriendAndOwnData
    ? props.timeRange === "year" || props.timeRange === "all"
      ? props.data.map((item) => item)
      : props.data.map((item) => item.Yearly[years[0]])
    : props.timeRange === "year" || props.timeRange === "all"
    ? [props.data]
    : [props.data.Yearly[years[0]]];

  dataSource.forEach((userData) => {
    Object.entries(userData[props.dataVariation]).forEach((item) => {
      const obj = {
        name:
          props.dataVariation === "Tracks" || props.dataVariation === "Artists"
            ? item[1].Name
            : item[0],
        uri: item[0],
        value: item[1][readVal],
      };

      if (!uniqueObjSet.has(item[0])) {
        uniqueObjSet.add(item[0]);
        itemsSelectable.push(obj);
      }
    });
  });

  console.log(itemsSelectable);
  return itemsSelectable.sort(function (a, b) {
    return b.value - a.value;
  });
}
