import { ResponsiveCalendar } from "@nivo/calendar";
import graphThemes from "./Graphs.js";
import { useEffect, useState } from "react";
import { formatFollowerData } from "./DataFormatter.js";

export const CalendarGraph = (props) => {
  const [data, setData] = useState();
  const [fromTo, setFromTo] = useState(["2015-03-01", "2016-07-12"]);

  useEffect(() => {
    if (props.data === undefined || props.data === null) {
      setData("Bad Data");
      return;
    }
    try {
      if (props.dataName === "followers") {
        let tempData = formatFollowerData(props);
        setFromTo([tempData[0].day, tempData[tempData.length - 1].day]);
        setData(tempData);
      } else {
        setData(props.data);
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
    console.log(data);
    return (
      <div className="GraphSVG">
        <ResponsiveCalendar
          theme={graphThemes}
          data={data}
          from={fromTo[0]}
          to={fromTo[1]}
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
      </div>
    );
  } catch (e) {
    console.error(e);
    return <p>Your data is empty!</p>;
  }
};

export default CalendarGraph;
