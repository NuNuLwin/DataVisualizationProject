import { useState, useEffect } from "react";

export const useData = (selectedTopic, perPage = 10) => {
  const [data, setData] = useState(null);

  console.log("selectedTopic..", selectedTopic?.data?.id);
  console.log("perPage..", perPage);

  const formatText = (text) => {
    if (!text) return text;

    // Check if text is all caps
    if (text === text.toUpperCase()) {
      return text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    return text;
  };

  useEffect(() => {
    // Fetch data only if a topic is selected
    if (selectedTopic?.data?.id && perPage) {
      const fetchData = async () => {
        const url = `https://api.openalex.org/works?filter=primary_topic.id:${encodeURIComponent(
          selectedTopic.data.id
        )}&sort=cited_by_count:desc&per_page=${perPage}`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const result = await response.json();
          console.log("result..", result);

          // Remove HTML tags and format text
          const cleanedResults = result.results.map((r) => ({
            ...r,
            display_name: formatText(
              r.display_name
                ? r.display_name.replace(/<\/?[^>]+(>|$)/g, "")
                : "Untitled"
            ),
          }));

          setData(cleanedResults);
        } catch (error) {
          console.error("Error fetching data from OpenAlex:", error);
          setData([]);
        }
      };

      fetchData();
    } else {
      setData([]);
    }
  }, [selectedTopic, perPage]);

  return data;
};
