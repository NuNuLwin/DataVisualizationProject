import { useState, useRef } from "react";
import { BarChart } from "../components/WorksBarChart/BarChart";
import { SunburstChart } from "../components/TopicSunburst/SunburstChart";
import "./TopicTrend.css";

const DROPDOWN_WIDTH = 400;
const REDUCED_MARGIN_TOP_BAR_CHART = 150;

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

      <div className="domain-selector-sunburst">
        <SunburstChart
          key={selectedDomain}
          width={window.innerWidth - DROPDOWN_WIDTH}
          height={window.innerHeight - 50}
          onSelectedTopic={handleSelectedTopic}
          selectedTopic={selectedTopic}
          selectedDomain={selectedDomain}
        />
        <div
          className="domain-selector"
          style={{
            width: DROPDOWN_WIDTH - 150,
            marginLeft: (DROPDOWN_WIDTH / 2.5) * -1,
          }}
        >
          <h4>Domain Type</h4>
          <select
            className="form-select"
            value={selectedDomain}
            onChange={(e) => handleDomainChange(e.target.value)}
            aria-label="Select research domain"
            style={{
              width: DROPDOWN_WIDTH - 150,
            }}
          >
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={
          {
            // marginTop: REDUCED_MARGIN_TOP_BAR_CHART * -1,
          }
        }
      >
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
    </div>
  );
};
