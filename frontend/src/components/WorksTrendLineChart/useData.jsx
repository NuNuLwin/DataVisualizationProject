import { useState, useEffect } from "react";

export const useData = (
  selectedField,
  selectedAuthor = null,
  selectedInstitution = null,
  perPage = 10
) => {
  const [data, setData] = useState(null);
  const [allAuthors, setAllAuthors] = useState([]);
  const [allInstitutions, setAllInstitutions] = useState([]);

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

  // https://api.openalex.org/works?filter=authorships.author.id%3Aa5000387389,primary_topic.field.id%3A20
  useEffect(() => {
    // Fetch data only if a topic is selected
    if (selectedField?.id) {
      console.log(" selectedField.id..", selectedField.id);
      const fetchData = async () => {
        // const url = `https://api.openalex.org/works?filter=primary_topic.field.id:${encodeURIComponent(
        //   selectedField.id
        // )}&sort=cited_by_count:desc&per_page=${perPage}`;

        let url = `https://api.openalex.org/works?filter=primary_topic.field.id:${encodeURIComponent(
          selectedField.id
        )}`;

        if (selectedAuthor) {
          url += `,authorships.author.id:${selectedAuthor.split("/").pop()}`;
        }

        if (selectedInstitution) {
          url += `,authorships.institutions.id:${selectedInstitution
            .split("/")
            .pop()}`;
        }

        url += `&sort=cited_by_count:desc&per_page=${perPage}`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const result = await response.json();
          // console.log("result..", result);

          // Extract unique authors from the results
          if (selectedAuthor === null) {
            const authorsMap = new Map();
            result.results.forEach((work) => {
              work.authorships.forEach((authorship) => {
                if (authorship.author) {
                  const authorId = authorship.author.id.split("/").pop();
                  if (!authorsMap.has(authorId)) {
                    authorsMap.set(authorId, {
                      id: authorId,
                      display_name: authorship.author.display_name,
                    });
                  }
                }
              });
            });

            setAllAuthors(Array.from(authorsMap.values()));
          }

          // Extract unique institutions from the results
          if (selectedInstitution === null) {
            const institutionMap = new Map();
            result.results.forEach((work) => {
              work.authorships.forEach((authorship) => {
                authorship.institutions.forEach((institution) => {
                  const institutionId = institution.id.split("/").pop();
                  if (!institutionMap.has(institutionId)) {
                    institutionMap.set(institutionId, {
                      id: institutionId,
                      display_name: institution.display_name,
                      country_code: institution.country_code,
                    });
                  }
                });
              });
            });

            setAllInstitutions(Array.from(institutionMap.values()));
          }

          // Remove HTML tags and format text
          const cleanedResults = [];
          result.results.map((r) => {
            r.counts_by_year.map((cby) => {
              let articleName = r.display_name || "Untitled";
              if (r.publication_year) {
                articleName += ` (${r.publication_year})`;
              }
              let obj = {
                ...r,
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
  }, [selectedField, selectedAuthor, selectedInstitution, perPage]);

  return { data, allAuthors, allInstitutions };
};
