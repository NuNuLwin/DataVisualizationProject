import { useState } from "react";
// components
import { BarChart } from "../components/BarChart/BarChart";
import { SunburstChart } from "../components/Sunburst/SunburstChart";
// css
import "./TopicTrend.css";

export const TopicTrend = () => {
  const [selectedTopic, setSelectedTopic] = useState();

  // events
  const handleSelectedTopic = (topic) => {
    console.log("selected topic ===> ", topic);
    setSelectedTopic(topic);
  };

  return (
    <div className="topic-trend-wrapper">
      <h2>
        <center>
          Top Research Topics Across Life/Physical/Social/Health Science
        </center>
      </h2>
      <SunburstChart
        width={window.innerWidth}
        height={window.innerHeight}
        onSelectedTopic={handleSelectedTopic}
      />
      {selectedTopic?.data?.name && (
        <>
          <h2>
            <center>
              Top Articles for Topic : {selectedTopic?.data?.name}
            </center>
          </h2>
          <BarChart
            width={window.innerWidth}
            height={window.innerHeight}
            selectedTopic={selectedTopic}
          />
        </>
      )}
    </div>
  );
};
