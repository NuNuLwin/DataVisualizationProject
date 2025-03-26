import { useState } from "react";
// components
import { BarChart } from "../components/ArticlesBarChart/BarChart";
import { SunburstChart } from "../components/TopicSunburst/SunburstChart";
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
    <div className="card topic-trend-wrapper">
      <h2>
        <center>
          Top Research Topics Across Life/Physical/Social/Health Science
        </center>
      </h2>
      <SunburstChart
        width={window.innerWidth}
        height={window.innerHeight}
        onSelectedTopic={handleSelectedTopic}
        selectedTopic={selectedTopic}
      />
      <h2>
        <center>Top Works for Topic : {selectedTopic?.data?.name}</center>
      </h2>
      {selectedTopic?.data?.name ? (
        <>
          <BarChart
            width={window.innerWidth - 200}
            height={window.innerHeight - 200}
            selectedTopic={selectedTopic}
          />
        </>
      ) : (
        <>
          <center>
            Please select one topic from the above Sunburst to show Top Works.
          </center>
        </>
      )}
    </div>
  );
};
