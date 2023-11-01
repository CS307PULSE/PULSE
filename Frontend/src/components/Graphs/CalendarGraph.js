import { ResponsiveCalendar } from "@nivo/calendar";
import graphThemes from "./Graphs.js";
import { useEffect, useState } from "react";

export const CalendarGraph = (props) => {
  const [data, setData] = useState();
  const fixFollowerData = () => {
    const dataArr = Object.keys(props.data).map((key) => ({
      value: props.data[key],
      day: key,
    }));
    let tempData = [];

    for (const dataPoint of dataArr) {
      const dayToFind = dataPoint.day.split(" ")[0];
      const index = tempData.findIndex((obj) => obj.day === dayToFind);
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
  };

  useEffect(() => {
    if (props.data === undefined || props.data === null) {
      setData("Bad Data");
      return;
    }
    try {
      if (props.dataName === "followers") {
        setData(fixFollowerData());
      }
    } catch (e) {
      console.error(e);
      setData("Bad Data");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) {
    return <>Still generating graph</>;
  } else if (data === "Bad Data") {
    return <p>Your data is empty!</p>;
  }

  try {
    console.log(props.graphTheme);
    return (
      <ResponsiveCalendar
        theme={graphThemes}
        data={data}
        from={data[0].day}
        to={data[data.length - 1].day}
        emptyColor="#eeeeee"
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        yearSpacing={40}
        monthBorderColor="#ffffff"
        dayBorderWidth={2}
        dayBorderColor="#ffffff"
        legends={[
          {
            anchor: "bottom-right",
            direction: "row",
            translateY: 36,
            itemCount: 4,
            itemWidth: 42,
            itemHeight: 36,
            itemsSpacing: 14,
            itemDirection: "right-to-left",
          },
        ]}
      />
    );
  } catch (e) {
    console.error(e);
    return <p>Your data is empty!</p>;
  }
};

export default CalendarGraph;
