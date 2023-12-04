export function formatFollowerData(props) {
  const dataSource = props.bothFriendAndOwnData ? props.data : [props.data];
  if (props.graphType === "Calendar") {
    const dataArr = Object.keys(props.data).map((key) => ({
      value: props.data[key],
      day: key,
    }));
    let tempData = [];

    for (const dataPoint of dataArr) {
      const dayToFind = dataPoint.day.split(" ")[0];
      const dateDay = new Date(dayToFind);
      const index = tempData.findIndex((obj) => obj.day === dayToFind);
      if (props.timeFromTo[0] !== undefined) {
        if (new Date(props.timeFromTo[0]) > dateDay) {
          continue;
        }
      }
      if (props.timeFromTo[1] !== undefined) {
        if (new Date(props.timeFromTo[1]) < dateDay) {
          continue;
        }
      }

      //already exists data
      if (index === -1) {
        tempData.push({ value: dataPoint.value, day: dayToFind });
      } else {
        if (tempData[index].value < dataPoint.value) {
          tempData[index].value = dataPoint.value;
        }
      }
    }
    tempData.sort((a, b) => {
      // Assuming the "day" values are in the format "YYYY-MM-DD"
      return new Date(a.day) - new Date(b.day);
    });
    return tempData;
  }
  return dataSource.map((userData, index) => {
    let id;
    if (dataSource.length > 1) {
      if (index === 0) {
        id = "User Followers";
      } else {
        id = props.friendName + " Followers";
      }
    } else {
      id =
        props.friendName !== undefined
          ? props.friendName + " Followers"
          : "User Followers";
    }
    return {
      id: id,
      data: Object.keys(userData)
        .map((key) => {
          const dateDay = new Date(key.split(" ")[0]);
          if (props.timeFromTo[0] !== undefined) {
            if (new Date(props.timeFromTo[0]) > dateDay) {
              return null;
            }
          }
          if (props.timeFromTo[1] !== undefined) {
            if (new Date(props.timeFromTo[1]) < dateDay) {
              return null;
            }
          }
          return {
            x: key,
            y: userData[key],
          };
        })
        .filter((val) => val !== null),
    };
  });
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
        if (props.graphType === "VertBar" || props.graphType === "HortBar") {
          return {
            data: data.data,
            graphKeys: data.graphKeys,
            graphIndexBy: data.graphIndexBy,
          };
        } else {
          return {
            data: data,
            itemsSelectable: itemsSelectable,
            selectionGraph: selectionGraph,
          };
        }

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
        data = formatPercentTimePeriod("", props.data[0]);
        data = data.concat(
          formatPercentTimePeriod(props.friendName, props.data[1])
        );
      } else {
        data = formatPercentTimePeriod(
          props.friendName !== undefined ? props.friendName : "",
          props.data
        );
      }
    }
  } catch (e) {
    console.error(e);
  }

  const diffData = formatForDifferentGraphs(props, data);
  return {
    data: diffData.data,
    graphKeys: diffData.graphKeys,
    graphIndexBy: diffData.graphIndexBy,
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
      )
        .sort(function (a, b) {
          return a - b;
        })
        .filter((year) => props.data.Yearly[year] !== null)
    : Object.keys(props.data.Yearly)
        .sort(function (a, b) {
          return a - b;
        })
        .filter((year) => props.data.Yearly[year] !== null);
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
      dataOrder.push(month);
    }
  }
  let dataOrders = [];
  for (const item of dataOrder) {
    dataOrders.push(item);
    dataOrders.push("User " + item);
    if (props.friendName !== undefined) {
      dataOrders.push(props.friendName + " " + item);
    }
  }
  //console.log(dataOrders);

  let params = {
    itemType: itemType,
    itemsSelected: itemsSelected,
    readVal: readVal,
    dataOrder: dataOrders,
    dataSource: dataSource,
    highestYear: highestYear,
    years: years,
  };

  let data;
  if (props.dataVariation === "all") {
    data = formatAllTimeGraphData(props, params);
  } else {
    data = formatSelectionGraphData(props, params);
  }

  if (props.graphType === "VertBar" || props.graphType === "HortBar") {
    const diffData = formatForDifferentGraphs(props, data);
    return {
      data: diffData.data,
      graphKeys: diffData.graphKeys,
      graphIndexBy: diffData.graphIndexBy,
    };
  } else {
    return formatForDifferentGraphs(props, data).data;
  }
}

function formatForDifferentGraphs(props, data) {
  switch (props.graphType) {
    case "Pie":
      let pieData = [];
      //console.log(data);
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
      return { data: pieData };
    case "VertBar":
    case "HortBar":
      let barData = [];
      let keys = [];
      for (const item of data) {
        let itemPoints = {};
        for (const point of item.data) {
          itemPoints[point.x] = point.y;
          if (!keys.includes(point.x)) {
            keys.push(point.x);
          }
        }
        itemPoints.name = item.id;
        barData.push(itemPoints);
      }
      return { data: barData, graphKeys: keys, graphIndexBy: "name" };
    default:
      return { data: data };
  }
}

function formatSelectionGraphData(props, params) {
  let itemsData = [];
  function formatXY(id, data, itemType, item, readVal) {
    if (data === null) {
      return {
        x: id,
        y: 0,
      };
    }
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
        if (userData[params.itemType][item] === undefined) {
          return;
        }
        if (userData[params.itemType][item].Name !== undefined) {
          id = userData[params.itemType][item].Name;
        }
      });
      if (id === "") {
        continue;
      }
    } else {
      id = item;
    }

    if (props.timeRange === "all") {
      const tempData = props.bothFriendAndOwnData ? props.data : [props.data];
      tempData.forEach((userData, index) => {
        if (index === 0) {
          data = [
            formatXY(
              props.friendName !== undefined
                ? props.bothFriendAndOwnData
                  ? "User Overall"
                  : props.friendName + " Overall"
                : "Overall",
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
              const dateDay =
                props.timeRange === "year"
                  ? new Date(yearMonthToDate(timePeriod))
                  : new Date(yearMonthToDate(params.highestYear, timePeriod));
              if (props.timeFromTo[0] !== undefined) {
                if (new Date(props.timeFromTo[0]) > dateDay) {
                  return null;
                }
              }
              if (props.timeFromTo[1] !== undefined) {
                if (new Date(props.timeFromTo[1]) < dateDay) {
                  return null;
                }
              }
              return formatXY(
                props.bothFriendAndOwnData
                  ? props.friendName + " " + timePeriod
                  : props.friendName !== undefined
                  ? props.friendName + " " + timePeriod
                  : "" + timePeriod,
                timeItems,
                params.itemType,
                item,
                params.readVal
              );
            })
            .filter((item) => item !== null)
            .sort((a, b) => {
              return (
                params.dataOrder.indexOf(a.x) - params.dataOrder.indexOf(b.x)
              );
            });
        } else {
          data.concat(
            Object.entries(userData)
              .map(([timePeriod, timeItems]) => {
                const dateDay =
                  props.timeRange === "year"
                    ? new Date(yearMonthToDate(timePeriod))
                    : new Date(yearMonthToDate(params.highestYear, timePeriod));
                if (props.timeFromTo[0] !== undefined) {
                  if (new Date(props.timeFromTo[0]) > dateDay) {
                    return null;
                  }
                }
                if (props.timeFromTo[1] !== undefined) {
                  if (new Date(props.timeFromTo[1]) < dateDay) {
                    return null;
                  }
                }
                return formatXY(
                  props.friendName + " " + timePeriod,
                  timeItems,
                  params.itemType,
                  item,
                  params.readVal
                );
              })
              .filter((item) => item !== null)
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
  const newData = props.bothFriendAndOwnData ? props.data : [props.data];
  const itemName = ["User", props.friendName];
  let tempDataArr = newData.map((userData, index) => {
    let tempUserData = [];
    if (props.timeRange === "all") {
      //Overall data
      tempUserData.push({
        x: "Overall",
        y: userData[params.readVal],
      });
    }

    //Yearly & monthly
    for (const year of params.years) {
      let dateDay = new Date(yearMonthToDate(year));
      if (props.timeFromTo[0] !== undefined) {
        if (new Date(props.timeFromTo[0]) > dateDay) {
          continue;
        }
      }
      if (props.timeFromTo[1] !== undefined) {
        if (new Date(props.timeFromTo[1]) < dateDay) {
          continue;
        }
      }
      if (props.timeRange === "all" || props.timeRange === "year") {
        tempUserData.push({
          x: year,
          y: userData.Yearly[year][params.readVal],
        });
      }

      if (props.timeRange === "all" || props.timeRange === "month") {
        //Monthly data
        for (const month of Object.keys(userData.Yearly[year].Monthly)) {
          dateDay = new Date(yearMonthToDate(year, month));
          if (props.timeFromTo[0] !== undefined) {
            if (new Date(props.timeFromTo[0]) > dateDay) {
              continue;
            }
          }
          if (props.timeFromTo[1] !== undefined) {
            if (new Date(props.timeFromTo[1]) < dateDay) {
              continue;
            }
          }
          tempUserData.push({
            x: month + " " + year,
            y: userData.Yearly[year].Monthly[month][params.readVal],
          });
        }
      }
    }
    tempUserData.sort((a, b) => {
      return params.dataOrder.indexOf(a.x) - params.dataOrder.indexOf(b.x);
    });
    return tempUserData;
  });

  return tempDataArr.map((userData, index) => {
    return { id: itemName[index], data: userData };
  });
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
      )
        .sort(function (a, b) {
          return b - a;
        })
        .filter((year) => props.data.Yearly[year] !== null)
    : Object.keys(props.data.Yearly)
        .sort(function (a, b) {
          return b - a;
        })
        .filter((year) => props.data.Yearly[year] !== null);
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

  //console.log(itemsSelectable);
  return itemsSelectable.sort(function (a, b) {
    return b.value - a.value;
  });
}

function yearMonthToDate(year, month = "JANUARY") {
  const monthToNum = {
    JANUARY: "01",
    FEBRUARY: "02",
    MARCH: "03",
    APRIL: "04",
    MAY: "05",
    JUNE: "06",
    JULY: "07",
    AUGUST: "08",
    SEPTEMBER: "09",
    OCTOBER: "10",
    NOVEMBER: "11",
    DECEMBER: "12",
  };
  return new Date(year + "-" + monthToNum[month.toUpperCase()] + "-01");
}
