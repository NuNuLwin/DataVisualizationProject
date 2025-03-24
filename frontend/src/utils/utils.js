// Process works to count institutional collaborations
export const processWorks = (works) => {
    const collaborationCounts = {};
  
    works.forEach((work) => {
      console.log("each work");
      const institutions = new Set();
      work.authorships.forEach((authorship) => {
        authorship.institutions.forEach((institution) => {
          institutions.add(institution.display_name);
        });
      });
  
      // var count = 0;
      // institutions.forEach((i)=>{
      //     count++;
      //     console.log("institution ",i+ " "+ count);
      // })
      const institutionList = Array.from(institutions);
      for (let i = 0; i < institutionList.length; i++) {
        for (let j = i + 1; j < institutionList.length; j++) {
          const pair = [institutionList[i], institutionList[j]].sort().join("|");
          collaborationCounts[pair] = (collaborationCounts[pair] || 0) + 1;
        }
      }
    });
  
  
    return collaborationCounts;
  };
  
  // Prepare data for the D3 chord diagram
 export const prepareChordData = (collaborationCounts) => {
    const institutions = new Set();
    Object.keys(collaborationCounts).forEach((pair) => {
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
      matrix[index1][index2] += collaborationCounts[pair];
      matrix[index2][index1] += collaborationCounts[pair];
    });
  
    return { matrix, institutionList };
  };
