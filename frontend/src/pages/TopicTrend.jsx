import { useState } from "react";
import { BarChart } from "../components/ArticlesBarChart/BarChart";
import { SunburstChart } from "../components/TopicSunburst/SunburstChart";
import "./TopicTrend.css";

export const TopicTrend = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState("Health Sciences");

  const domains = [
    "Physical Sciences",
    "Life Sciences",
    "Health Sciences",
    "Social Sciences",
  ];

  const handleSelectedTopic = (topic) => {
    setSelectedTopic(topic);
  };

  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    setSelectedTopic(null);
  };

  return (
    <div className="card topic-trend-wrapper">
      <h2 className="text-center">
        Top 5 Topics by Works Count in {selectedDomain}
      </h2>

      <div className="domain-selector">
        <select
          className="form-select"
          value={selectedDomain}
          onChange={(e) => handleDomainChange(e.target.value)}
          aria-label="Select research domain"
        >
          {domains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
      </div>

      <SunburstChart
        key={selectedDomain}
        width={window.innerWidth}
        height={window.innerHeight}
        onSelectedTopic={handleSelectedTopic}
        selectedTopic={selectedTopic}
        selectedDomain={selectedDomain}
      />

      <h2 className="text-center">
        {selectedTopic?.data?.name
          ? `Top Works for Topic: ${selectedTopic.data.name}`
          : "Please select a topic from the Sunburst chart"}
      </h2>

      {selectedTopic?.data?.name && (
        <BarChart
          width={window.innerWidth - 200}
          height={window.innerHeight - 200}
          selectedTopic={selectedTopic}
        />
      )}
    </div>
  );
};
