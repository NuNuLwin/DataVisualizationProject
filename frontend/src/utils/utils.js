
// Process works to count institutional collaborations
export const processWorks = (works) => {
    const collaborationCounts = {};
    //const institutionAppearances = {};

    // ***** loop for each work to pair institution and count collaboration
    works.forEach((work) => {
      console.log("each work");
      const institutions = new Set();
      work.authorships.forEach((authorship) => {
        authorship.institutions.forEach((institution) => {
                //1.Extract unique institution for each work
                institutions.add(institution.display_name);
        });
      });
  
    //   var count = 0;
    //   institutions.forEach((i)=>{
    //       count++;
    //       console.log("institution ",i+ " "+ count);
    //   })

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
  
  
    // Object.entries(collaborationCounts).forEach(([pair, count]) => {
    //     const [institution1, institution2] = pair.split('|');
    //     console.log(`before ${institution1} and ${institution2} collaborated ${count} times`);
    // });

    // // Filter out pairs with collaboration count ≤ 2 (at least collaborated 2 research paper)
    // const filteredCollaborationCounts = Object.fromEntries(
    //     Object.entries(collaborationCounts).filter(([pair, count]) => count >= 2)
    // );

      // Filter pairs with count > 2 and sort by count (descending)
    const filteredCollaborationCounts = Object.entries(collaborationCounts)
    .filter(([_, count]) => count > 2)           // Keep only pairs with count > 2
    .sort((a, b) => b[1] - a[1])                // Sort by count (highest first)
    .slice(0, 10)                               // Take top 10
    .reduce((acc, [pair, count]) => {           // Convert back to object
        acc[pair] = count;
        return acc;
    }, {});

    Object.entries(filteredCollaborationCounts).forEach(([pair, count]) => {
        const [institution1, institution2] = pair.split('|');
        console.log(`after ${institution1} and ${institution2} collaborated ${count} times`);
    });

    return filteredCollaborationCounts;//collaborationCounts;//;//;//return {collaborationCounts,institutionAppearances}//{collaborationCounts,institutionCountryMap};
  };
  

 export const prepareChordData = (collaborationCounts) => {//({ collaborationCounts, institutionAppearances }, topN = 15) => {////, institutionCountryMap, countryFilter
    // Early return if collaborationCounts is empty or invalid
    console.log("prepareChordData");
    // if (!collaborationCounts || Object.keys(collaborationCounts).length === 0) {
    //     return { matrix: [], institutionList: [] };
    // }
    
    //         // Step 1: Count occurrences of each unique pair
    //     const pairFrequency = {};

    //     Object.keys(collaborationCounts).forEach(pair => {
    //         // Normalize pair (ensure consistent order, e.g., "A|B" instead of "B|A")
    //         const [institutionA, institutionB] = pair.split('|').sort();
    //         const normalizedPair = `${institutionA}|${institutionB}`;
    //         //console.log(" normalizedPair ",normalizedPair);
    //         // Count each unique pair once
    //         pairFrequency[normalizedPair] = (pairFrequency[normalizedPair] || 0) + 1;
    //     });

    //     // Step 1: Sort collaboration pairs by count (descending)
    //     const sortedPairs = Object.entries(pairFrequency)
    //     .sort((a, b) => b[1] - a[1]); // Sort by count (descending)


    // // Step 2: Take top 10 pairs
    // const top10Pairs = sortedPairs.slice(0, 10);

    //     // Step 4: Log results
    //     console.log("🏆 Top 10 Most Frequent Institution Pairs 🏆");
    //     top10Pairs.forEach(([pair, count], index) => {
    //         const [institutionA, institutionB] = pair.split('|');
    //         console.log(`${index + 1}. ${institutionA} ↔ ${institutionB}: ${count} collaborations`);
        // });

        


//    // Step 1: Sum collaboration counts per institution
//     const institutionCollaborations = {};

//     Object.entries(collaborationCounts).forEach(([pair, count]) => {
//         const [institutionA, institutionB] = pair.split('|');
        
//         // Add count to both institutions in the pair
//         institutionCollaborations[institutionA] = 
//             (institutionCollaborations[institutionA] || 0) + count;
//         institutionCollaborations[institutionB] = 
//             (institutionCollaborations[institutionB] || 0) + count;
//     });

//     const sortedInstitutions = Object.entries(institutionCollaborations)
//     .map(([institution, totalCollaborations]) => ({
//         institution,
//         totalCollaborations,
//     }))
//     .sort((a, b) => b.totalCollaborations - a.totalCollaborations)

//     const top10Institutions = sortedInstitutions
//     .filter(entry => entry.totalCollaborations <= 10)
//     .slice(0, 10);

//     // console.log("Top 10 Most Collaborative Institutions:");
//     // top10Institutions.forEach((entry, index) => {
//     //     console.log(
//     //         `${index + 1}. ${entry.institution}: ${entry.totalCollaborations} collaborations`
//     //     );
//     // });

//     // Step 2: Filter collaborationCounts to keep only pairs involving top 10 institutions
//     const filteredCollaborations = Object.entries(collaborationCounts)
//         .filter(([pair]) => {
//             const [institutionA, institutionB] = pair.split('|');
//             // return (
//             //     top10Institutions.includes(institutionA) ||
//             //     top10Institutions.includes(institutionB)
//             // );
//             return top10Institutions.some(
//                 (entry) => entry.institution === institutionA || entry.institution === institutionB
//             );
//         })
//         .reduce((acc, [pair, count]) => {
//             acc[pair] = count; // Rebuild the object
//             return acc;
//         }, {});



//   const filteredCollabs = Object.entries(collaborationCounts)
//     .filter(([_, count]) => count >= 2) // Minimum 3 papers
//     // .sort((a, b) => b[1] - a[1]) // Sort descending
//     // .slice(0, 10); // Top 10

//     Object.entries(filteredCollabs).forEach(([pair, count]) => {
//         const [institution1, institution2] = pair.split('|');
//         console.log(`filteredCollabs ${institution1} and ${institution2} collaborated ${count} times`);
//     });



    /// this is processing the institution data for chord diagram, in which institution data get from collaborationCounts.
    // it will be (Uni x, Uni Y) :1 , (Uni X, Uni Z): 1, (Uni X, Uni Y) :1. Count collabration will do in this step for Chord data.
    const institutions = new Set();
    Object.keys(collaborationCounts).forEach((pair) => {//filteredCollaborations
      const [inst1, inst2] = pair.split("|");
      institutions.add(inst1);
      institutions.add(inst2);
    });
  
    const institutionList = Array.from(institutions);
    const matrix = Array(institutionList.length)
      .fill(0)
      .map(() => Array(institutionList.length).fill(0));
  
    Object.keys(collaborationCounts).forEach((pair) => {
      const [inst1, inst2] = pair.split("|");
      const index1 = institutionList.indexOf(inst1);
      const index2 = institutionList.indexOf(inst2);

      if (index1 !== -1 && index2 !== -1) {
        matrix[index1][index2] += collaborationCounts[pair];
        matrix[index2][index1] += collaborationCounts[pair];
      }
    });
  
    return { matrix, institutionList };
  };

//   export const getCountryName = (code) => {
//     const countryMap = {
//         // North America
//     US: "United States",
//     CA: "Canada",
//     MX: "Mexico",
    
//     // Europe
//     GB: "United Kingdom",
//     DE: "Germany",
//     FR: "France",
//     IT: "Italy",
//     ES: "Spain",
//     NL: "Netherlands",
//     CH: "Switzerland",
//     SE: "Sweden",
//     FI: "Finland",
//     NO: "Norway",
//     DK: "Denmark",
//     BE: "Belgium",
//     AT: "Austria",
//     IE: "Ireland",
//     PT: "Portugal",
//     GR: "Greece",
//     RU: "Russia",
    
//     // Asia
//     CN: "China",
//     JP: "Japan",
//     KR: "South Korea",
//     SG: "Singapore",
//     IN: "India",
//     TW: "Taiwan",
//     HK: "Hong Kong",
//     IL: "Israel",
//     SA: "Saudi Arabia",
//     AE: "United Arab Emirates",
    
//     // Oceania
//     AU: "Australia",
//     NZ: "New Zealand",
    
//     // South America
//     BR: "Brazil",
//     AR: "Argentina",
//     CL: "Chile",
//     CO: "Colombia",
    
//     // Africa
//     ZA: "South Africa",
//     EG: "Egypt",
//     KE: "Kenya",
//     NG: "Nigeria",
    
//     // Common country codes in academic publishing
//     HU: "Hungary",
//     PL: "Poland",
//     CZ: "Czech Republic",
//     TR: "Turkey",
//     TH: "Thailand",
//     MY: "Malaysia",
//     ID: "Indonesia",
//     PH: "Philippines",
//     VN: "Vietnam",
    
//     // Additional European countries
//     UA: "Ukraine",
//     RO: "Romania",
//     SK: "Slovakia",
//     HR: "Croatia",
//     SI: "Slovenia",
//     EE: "Estonia",
//     LV: "Latvia",
//     LT: "Lithuania",
//     IS: "Iceland",
//     LU: "Luxembourg",
//     MT: "Malta",
//     CY: "Cyprus",
    
//     // Additional Asian countries
//     PK: "Pakistan",
//     BD: "Bangladesh",
//     IR: "Iran",
//     IQ: "Iraq",
//     JO: "Jordan",
//     LB: "Lebanon",
//     OM: "Oman",
//     QA: "Qatar",
//     KW: "Kuwait",
//     BH: "Bahrain",
//     };
//     return countryMap[code] || code;
//   };
