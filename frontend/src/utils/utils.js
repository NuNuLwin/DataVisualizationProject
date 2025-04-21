export const processWorks = (works) => {
    const collaborationCounts = {};
    // ***** loop for each work to pair institution and count collaboration
    works.forEach((work) => {
      console.log("each work");
      const institutions = new Set();
      work.authorships.forEach((authorship) => {
        authorship.institutions.forEach((institution) => {
                //1.Extract unique institution for each work
                institutions.add(institution.id);
        });
      });

      // Generate Institution pair for each work. And store in 'collaborationCounts' global variable.
      // if another same instituion pair is found, increase 1 to original count as 2.
      const institutionList = Array.from(institutions);
      for (let i = 0; i < institutionList.length; i++) {
        for (let j = i + 1; j < institutionList.length; j++) {
          const pair = [institutionList[i], institutionList[j]].sort().join("|");
          collaborationCounts[pair] = (collaborationCounts[pair] || 0) + 1;
        }
      }
    });
  

      // Filter pairs with count > 2 and sort by count (descending)
    const filteredCollaborationCounts = Object.entries(collaborationCounts)
    .filter(([_, count]) => count > 2)           // Keep only pairs with count > 2
    .sort((a, b) => b[1] - a[1])                // Sort by count (highest first)
    .slice(0, 30)                               // Take top 10
    .reduce((acc, [pair, count]) => {           // Convert back to object
        acc[pair] = count;
        return acc;
    }, {});

    Object.entries(filteredCollaborationCounts).forEach(([pair, count]) => {
        const [institution1, institution2] = pair.split('|');
        console.log(`after ${institution1} and ${institution2} collaborated ${count} times`);
    });

    return filteredCollaborationCounts;
  };

export const prepareChordData = (collaborationCounts, works) => {
  console.log("prepareChordData");

  // Step 1: Build a lookup table { [id]: { id, name } }
  const institutionLookup = {};
  works.forEach((work) => {
      work.authorships.forEach((authorship) => {
          authorship.institutions.forEach((institution) => {
              if (institution.id && !institutionLookup[institution.id]) {
                  institutionLookup[institution.id] = {
                      id: institution.id,
                      name: institution.display_name,
                  };
              }
          });
      });
  });

  // Step 2: Extract unique institutions from collaborationCounts
  const institutions = new Set();
  Object.keys(collaborationCounts).forEach((pair) => {
      const [id1, id2] = pair.split("|");
      institutions.add(id1);
      institutions.add(id2);
  });

  // Step 3: Map IDs to { id, name } objects
  const institutionList = Array.from(institutions).map((id) => institutionLookup[id]);

  // Step 4: Build the matrix (same as before)
  const matrix = Array(institutionList.length)
      .fill(0)
      .map(() => Array(institutionList.length).fill(0));

  Object.keys(collaborationCounts).forEach((pair) => {
      const [id1, id2] = pair.split("|");
      const index1 = institutionList.findIndex((inst) => inst.id === id1);
      const index2 = institutionList.findIndex((inst) => inst.id === id2);

      if (index1 !== -1 && index2 !== -1) {
          matrix[index1][index2] += collaborationCounts[pair];
          matrix[index2][index1] += collaborationCounts[pair];
      }
  });

  return { matrix, institutionList };
};

export const processCoAuthorData = (works) => {
  const authors = new Map(); 

  // First pass: count publications and collect co-authors
  works.forEach(work => {
     // For works with >10 authors, we'll process only the first 10 authors
     const authorshipsToProcess = work.authorships.length > 14 
     ? work.authorships.slice(0, 14) 
     : work.authorships;

     authorshipsToProcess.forEach(a => {
      if (!authors.has(a.author.id)) {
        authors.set(a.author.id, {
          name: a.author.display_name,
          coAuthors: new Set(),
          publicationCount: 0,
          institutions: a.institutions?.map(i => i.display_name) || ['Unknown'],
          papers: [] // Array to store paper information
        });
      }
      // Increment publication count
      const authorData = authors.get(a.author.id);
      authorData.publicationCount++;
       // Add paper information (title and ID)
       authorData.papers.push({
        title: work.title || 'Untitled',
      });

      // Add co-authors (excluding self)
      authorshipsToProcess
        .filter(x => x.author.id !== a.author.id)
        .forEach(x => authors.get(a.author.id).coAuthors.add(x.author.id));
    });
  });

  // Convert to array and filter
  const filteredAuthors = Array.from(authors.entries())
    .filter(([id, data]) => data.publicationCount >= 2 ) // At least 2 publications
    .sort((a, b) => b[1].publicationCount - a[1].publicationCount) // Sort by publication count

  // Now we need to filter *coAuthors to only include those in our top 10
  const topAuthorIds = new Set(filteredAuthors.map(([id]) => id));
  
  return filteredAuthors.map(([id, data]) => ({
    id,
    name: data.name,
    coAuthors: Array.from(data.coAuthors).filter(coId => topAuthorIds.has(coId)),
    publicationCount: data.publicationCount,
    institutions: data.institutions,
    papers: data.papers
  }));
};

  // Extract unique institutions
  export const extractInstitutions = (works) => {
    const institutionSet = new Set();
    works.forEach(work => {
      work.authorships.forEach(a => {
        a.institutions?.forEach(inst => {
          if (inst.display_name) institutionSet.add(inst.display_name);
        });
      });
    });
   return [...Array.from(institutionSet).sort()];
  };
