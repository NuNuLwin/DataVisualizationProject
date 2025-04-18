import { useState, useEffect } from "react";

const extractAuthors = (results) => {
  const authorsMap = new Map();
  results.forEach((work) => {
    work.authorships?.forEach((authorship) => {
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
  return Array.from(authorsMap.values());
};

const extractInstitutions = (results) => {
  const institutionMap = new Map();
  results.forEach((work) => {
    work.authorships?.forEach((authorship) => {
      authorship.institutions?.forEach((institution) => {
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
  return Array.from(institutionMap.values());
};

const cleanResults = (results) => {
  const cleaned = [];

  results.forEach((r) => {
    r.counts_by_year.forEach((cby) => {
      let articleName = r.display_name || "Untitled";
      if (r.publication_year) {
        articleName += ` (${r.publication_year})`;
      }
      cleaned.push({
        ...r,
        name: articleName.replace(/<\/?[^>]+(>|$)/g, " "),
        year: cby.year,
        cited_by_count: cby.cited_by_count,
        oa_status: r.open_access.oa_status,
      });
    });
  });

  return cleaned;
};

const fetchWorks = async (
  selectedField,
  selectedAuthor,
  selectedInstitution,
  perPage
) => {
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

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
};

const sortByName = (items) => {
  return [...items].sort((a, b) =>
    (a.display_name || "").localeCompare(b.display_name || "")
  );
};

export const useData = (
  selectedField,
  selectedAuthor = null,
  selectedInstitution = null,
  perPage = 10
) => {
  const [data, setData] = useState(null);
  const [allAuthors, setAllAuthors] = useState([]);
  const [allInstitutions, setAllInstitutions] = useState([]);

  useEffect(() => {
    console.log(`Selected Field ID: ${selectedField?.id}`);

    if (!selectedField?.id) {
      setData([]);
      return;
    }

    const fetchData = async () => {
      try {
        const result = await fetchWorks(
          selectedField,
          selectedAuthor,
          selectedInstitution,
          perPage
        );
        if (selectedAuthor === null) {
          setAllAuthors(sortByName(extractAuthors(result.results)));
        }
        if (selectedInstitution === null) {
          setAllInstitutions(sortByName(extractInstitutions(result.results)));
        }
        setData(cleanResults(result.results));
      } catch (error) {
        console.error("Error fetching data from OpenAlex:", error);
        setData([]);
      }
    };

    fetchData();
  }, [selectedField, selectedAuthor, selectedInstitution, perPage]);

  return { data, allAuthors, allInstitutions };
};
