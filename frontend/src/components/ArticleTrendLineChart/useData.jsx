import { useState, useEffect } from "react";

export const useData = (selectedField, perPage = 10) => {
  const [data, setData] = useState(null);

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
    if (selectedField?.id) {
      const fetchData = async () => {
        const url = `https://api.openalex.org/works?filter=primary_topic.field.id:${encodeURIComponent(
          selectedField.id
        )}&sort=cited_by_count:desc&per_page=${perPage}`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const result = await response.json();
          // console.log("result..", result);

          // Remove HTML tags and format text
          const cleanedResults = [];
          result.results.map((r) => {
            r.counts_by_year.map((cby) => {
              let articleName = r.display_name || "Untitled";
              if (r.publication_year) {
                articleName += ` (${r.publication_year})`;
              }
              let obj = {
                name: articleName.replace(/<\/?[^>]+(>|$)/g, " "),
                year: cby.year,
                cited_by_count: cby.cited_by_count,
                oa_status: r.open_access.oa_status,
              };
              cleanedResults.push(obj);
            });
          });

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
  }, [selectedField, perPage]);

  return data;
};
