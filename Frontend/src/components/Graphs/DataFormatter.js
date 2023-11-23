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
      props.dataName === "percentTimes"
    ) {
      if (props.dataVariation === "all") {
        selectionGraph = false;
        const readVal =
          props.dataName === "numMinutes"
            ? "Number of Minutes"
            : props.dataName === "percentTimes"
            ? "Average Percentage of Streams"
            : props.dataName === "numStreams"
            ? "Number of Streams"
            : "Number of Streams";
        let years = props.bothFriendAndOwnData
          ? Array.from(
              new Set(props.data.map((item) => Object.keys(item.Yearly)).flat())
            )
          : Object.keys(props.data.Yearly);
        years.sort(function (a, b) {
          return a - b;
        });
        let months = [
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
        let DataOrder = ["Overall"];
        for (const year of years) {
          DataOrder.push(year);
          for (const month of months) {
            DataOrder.push(month + " " + year);
          }
        }

        if (props.bothFriendAndOwnData) {
          const itemName = [props.friendName, "User"];
          let tempDataArr = [];
          props.data.map((user, index) => {
            let tempUserData = [];
            //Overall data
            tempUserData.push({
              x: "Overall",
              y: props.data[index][readVal],
            });

            //Yearly & monthly
            for (const year of Object.keys(props.data[index].Yearly)) {
              tempUserData.push({
                x: year,
                y: props.data[index].Yearly[year][readVal],
              });

              //Monthly data
              for (const month of Object.keys(
                props.data[index].Yearly[year].Monthly
              )) {
                tempUserData.push({
                  x: month + " " + year,
                  y: props.data[index].Yearly[year].Monthly[month][readVal],
                });
              }
            }
            tempUserData.sort((a, b) => {
              return DataOrder.indexOf(a.x) - DataOrder.indexOf(b.x);
            });
            tempDataArr.push(tempUserData);
          });
          setData([
            { id: itemName[0], data: tempDataArr[0] },
            { id: itemName[1], data: tempDataArr[1] },
          ]);
        } else {
          let tempDataArr = [];
          //Overall data
          const itemName =
            props.friendName !== undefined ? props.friendName : "User";
          tempDataArr.push({ x: "Overall", y: props.data[readVal] });

          //Yearly & monthly
          for (const year of Object.keys(props.data.Yearly)) {
            tempDataArr.push({
              x: year,
              y: props.data.Yearly[year][readVal],
            });

            //Monthly data
            for (const month of Object.keys(props.data.Yearly[year].Monthly)) {
              tempDataArr.push({
                x: month + " " + year,
                y: props.data.Yearly[year].Monthly[month][readVal],
              });
            }
          }
          tempDataArr.sort((a, b) => {
            return DataOrder.indexOf(a.x) - DataOrder.indexOf(b.x);
          });
          setData([{ id: itemName, data: tempDataArr }]);
        }
        return;
      } else {
        itemsSelectable = formatSelectableItems(
          props.data,
          props.bothFriendAndOwnData,
          props.dataVariation
        );
        selectionGraph = true;
      }
      data = emptyData;
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
    } else if (props.dataName === "numTimesSkipped") {
      itemsSelectable = formatSelectableItems(
        props.data,
        props.bothFriendAndOwnData,
        props.dataVariation
      );
      selectionGraph = true;
      data = emptyData;
    }
  } catch (e) {
    console.error(e);
  }

  return {
    data: data,
    itemsSelectable: itemsSelectable,
    selectionGraph: selectionGraph,
  };
}

export function formatSelectionGraphData(props, itemsSelected) {
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
  let dataOrder = ["Overall"];
  for (const year of years) {
    dataOrder.push(year);
    for (const month of monthsOrder) {
      dataOrder.push(month + " " + year);
    }
  }
  let dataOrders = [];
  for (item of dataOrder) {
    dataOrders.push("User " + item);
    dataOrders.push(props.friendName + " " + item);
  }

  let params = {
    itemType: itemType,
    itemsSelected: itemsSelected,
    readVal: readVal,
    dataOrder: dataOrders,
  };

  return formatSelectionGraphDataLine(props, params);
}

function formatSelectionGraphDataLine(props, params) {
  const formatXYData = (id, data, itemType, item, readVal) => {
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
  };

  let itemsData = [];

  for (item of params.itemsSelected) {
    let id = "";
    let data = [];
    if (props.dataVariation === "Tracks" || props.dataVariation === "Artists") {
      if (props.bothFriendAndOwnData) {
        if ((id = props.data[0][itemType][item] !== undefined)) {
          id = props.data[0][itemType][item].Name;
        } else {
          id = props.data[1][itemType][item].Name;
        }
      }
    } else {
      id = item;
    }

    if (props.timeRange === "all") {
      if (props.bothFriendAndOwnData) {
        data = [
          formatXYData(
            "User All",
            props.data[0],
            params.itemType,
            item,
            params.readVal
          ),
          formatXYData(
            props.friendName + " All",
            props.data[1],
            params.itemType,
            item,
            params.readVal
          ),
        ];
      } else {
        data = [
          formatXYData(
            props.friendName !== undefined
              ? props.friendName + "All"
              : "User All",
            props.data,
            params.itemType,
            item,
            params.readVal
          ),
        ];
      }
    } else {
      if (props.bothFriendAndOwnData) {
        data = Object.entries(dataSource[0])
          .map(([timePeriod, timeItems]) => {
            return formatXYData(
              "User " + timePeriod,
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
          .concat(
            Object.entries(dataSource[1])
              .map(([timePeriod, timeItems]) => {
                return formatXYData(
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
      } else {
        data = Object.entries(dataSource)
          .map(([timePeriod, timeItems]) => {
            return formatXYData(
              +timePeriod,
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
      }
    }
    itemsData.push({ id: id, data: data });
  }
  return itemsData;
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
        for (const month of Object.keys(props.data[1].Yearly[year].Monthly)) {
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

function formatSelectableItems(data, bothFriendAndOwnData, dataVariation) {
  const uniqueObjSet = new Set();
  const itemsSelectable = [];
  const validDataVariation = ["Tracks", "Artists", "Genres", "Eras"];

  if (!validDataVariation.includes(dataVariation)) {
    throw new Error("Bad DataVariation=" + props.dataVariation);
  }

  if (bothFriendAndOwnData) {
    tempData.forEach((userData) => {
      Object.keys(userData[dataVariation]).forEach((key) => {
        const obj = {
          name:
            dataVariation === "Tracks" || dataVariation === "Artists"
              ? userData[dataVariation][key].Name
              : key,
          uri: key,
        };

        if (!uniqueObjSet.has(key)) {
          uniqueObjSet.add(key);
          itemsSelectable.push(obj);
        }
      });
    });
  } else {
    itemsSelectable = Object.keys(tempData[dataVariation]).map((key) => ({
      name:
        dataVariation === "Tracks" || dataVariation === "Artists"
          ? tempData[dataVariation][key].Name
          : key,
      uri: key,
    }));
  }

  return itemsSelectable;
}
