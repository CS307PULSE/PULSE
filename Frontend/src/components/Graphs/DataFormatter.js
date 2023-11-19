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

export function formatAdvancedData(props) {
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
  let itemsSelected = [];
  let selectionGraph = false;
  if (props.data === undefined || props.data === null) {
    data = "Bad Data";
    return { data: data };
  } else if (props.data === "Empty") {
    data = "Advanced Data Failed to Load";
    return { data: data };
  }
  try {
    const tempData = props.bothFriendAndOwnData ? props.data[0] : props.data;
    if (
      props.dataName === "numMinutes" ||
      props.dataName === "numStreams" ||
      props.dataName === "percentTimes"
    ) {
      switch (props.dataVariation) {
        case "songs":
          setItemsSelectable(
            Object.keys(tempData.Tracks).map((key) => ({
              name: tempData.Tracks[key].Name,
              uri: key,
            }))
          );
          setSelectionGraph(true);
          break;
        case "artists":
          setItemsSelectable(
            Object.keys(tempData.Artists).map((key) => ({
              name: tempData.Artists[key].Name,
              uri: key,
            }))
          );
          setSelectionGraph(true);
          break;
        case "genres":
          setItemsSelectable(
            Object.keys(tempData.Genres).map((key) => ({
              name: key,
              uri: key,
            }))
          );
          setSelectionGraph(true);
          break;
        case "eras":
          setItemsSelectable(
            Object.keys(tempData.Eras).map((key) => ({
              name: key,
              uri: key,
            }))
          );
          setSelectionGraph(true);
          break;
        case "all":
          setSelectionGraph(false);
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
                new Set([
                  Object.keys(props.data[0].Yearly),
                  Object.keys(props.data[1].Yearly),
                ])
              )
            : Object.keys(props.data.Yearly);
          years.sort(function (a, b) {
            return a - b;
          });
          const dataSource = props.bothFriendAndOwnData
            ? [props.data[0], props.data[1]]
            : props.data;
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
              for (const month of Object.keys(
                props.data.Yearly[year].Monthly
              )) {
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
        default:
          throw new Error("Bad DataVariation=" + props.dataVariation);
      }

      setData([
        {
          id: "",
          data: [
            {
              x: "",
              y: 0,
            },
          ],
        },
      ]);
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
      itemsSelectable = Object.keys(tempData.Tracks).map((key) => ({
        name: tempData.Tracks[key].Name,
        uri: key,
      }));
      selectionGraph = true;
      data = emptyData;
    }
  } catch (e) {
    console.error(e);
  }
  return {
    data: data,
    itemsSelectable: itemsSelectable,
    itemsSelected: itemsSelected,
    selectionGraph: selectionGraph,
  };
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
