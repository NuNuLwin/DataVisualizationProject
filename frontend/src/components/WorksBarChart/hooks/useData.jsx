import { useState, useEffect } from "react";
import { getCleanedDisplayName } from "../utils/chartUtils";

const fetchWorksByTopic = async (topicId, perPage) => {
  const url = `https://api.openalex.org/works?filter=primary_topic.id:${encodeURIComponent(
    topicId
  )}&sort=cited_by_count:desc&per_page=15`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const result = await response.json();
  return result.results.slice(0, perPage).map((r) => ({
    ...r,
    display_name: getCleanedDisplayName(r.display_name),
  }));
};

export const useData = (selectedTopic, perPage = 10) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const topicId = selectedTopic?.data?.id;

    if (topicId && perPage) {
      fetchWorksByTopic(topicId, perPage)
        .then(setData)
        .catch((error) => {
          console.error("Error fetching data from OpenAlex:", error);
          setData([]);
        });
    } else {
      setData([]);
    }
  }, [selectedTopic, perPage]);

  return data;
};
