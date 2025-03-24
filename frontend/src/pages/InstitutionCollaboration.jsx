import React, { useEffect, useState } from "react";
import ChordDiagram from "./ChordDiagram";
import { useSelector, useDispatch } from "react-redux";
import {getInstitutionCollaboration} from '../features/institutionCollaboration/institutionslice'
import { getConcepts } from "../features/institutionCollaboration/institutionslice";
import { getYears } from "../features/institutionCollaboration/institutionslice";
import "../index.css"

import { processWorks,prepareChordData } from "../utils/utils";

// // Process works to count institutional collaborations
// const processWorks = (works) => {
//   const collaborationCounts = {};

//   works.forEach((work) => {
//     console.log("each work");
//     const institutions = new Set();
//     work.authorships.forEach((authorship) => {
//       authorship.institutions.forEach((institution) => {
//         institutions.add(institution.display_name);
//       });
//     });

//     // var count = 0;
//     // institutions.forEach((i)=>{
//     //     count++;
//     //     console.log("institution ",i+ " "+ count);
//     // })
//     const institutionList = Array.from(institutions);
//     for (let i = 0; i < institutionList.length; i++) {
//       for (let j = i + 1; j < institutionList.length; j++) {
//         const pair = [institutionList[i], institutionList[j]].sort().join("|");
//         collaborationCounts[pair] = (collaborationCounts[pair] || 0) + 1;
//       }
//     }
//   });


//   return collaborationCounts;
// };

// // Prepare data for the D3 chord diagram
// const prepareChordData = (collaborationCounts) => {
//   const institutions = new Set();
//   Object.keys(collaborationCounts).forEach((pair) => {
//     const [inst1, inst2] = pair.split("|");
//     institutions.add(inst1);
//     institutions.add(inst2);
//   });

//   const institutionList = Array.from(institutions);
//   const matrix = Array(institutionList.length)
//     .fill(0)
//     .map(() => Array(institutionList.length).fill(0));

//   Object.keys(collaborationCounts).forEach((pair) => {
//     const [inst1, inst2] = pair.split("|");
//     const index1 = institutionList.indexOf(inst1);
//     const index2 = institutionList.indexOf(inst2);
//     matrix[index1][index2] += collaborationCounts[pair];
//     matrix[index2][index1] += collaborationCounts[pair];
//   });

//   return { matrix, institutionList };
// };

const InstitutionCollaboration = () => {
  const dispatch = useDispatch();
  const { works,concepts,years, isLoading,isSuccess,isError,message } = useSelector((state) => state.institution);

  const [conceptData, setConceptData] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState("");

  const [yearData, setYearData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [Matrix, setMatrix] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  //*********************** Work ****************** //
  useEffect(() => {
    if(Matrix.length == 0 && institutions.length == 0 && works.results.length>0){
      const collaborationCounts = processWorks(works.results);
      const { matrix, institutionList } = prepareChordData(collaborationCounts);
      setMatrix(matrix);
      setInstitutions(institutionList);
    }
  }, [Matrix,institutions]);

  useEffect(() => {
    if(works.results.length>0 && !isLoading){
        console.log("work count ",works.results.length);
        // const collaborationCounts = processWorks(works.results);
        // const { matrix, institutionList } = prepareChordData(collaborationCounts);
        // setMatrix(matrix);
        // setInstitutions(institutionList);

        setMatrix([]);
        setInstitutions([]);
      }

  }, [works,isLoading]);
  //retrieve work based on selected concept.
  useEffect(() => {
    var cleanedConceptId = "";
    if(selectedConcept){
       cleanedConceptId = selectedConcept.match(/C\d+$/)?.[0];
    }else{
       cleanedConceptId = cleanedConceptId;
    }

    console.log("selectedConcept ",cleanedConceptId+" selectedYear "+selectedYear);
    dispatch(getInstitutionCollaboration({conceptId:cleanedConceptId,year:selectedYear}));
  }, [selectedConcept,selectedYear]);


  // retrieve all work as Default
  // useEffect(() => {
  //   dispatch(getInstitutionCollaboration(""));
  // }, []);

  //********************** Concepts ******************** //
  useEffect(() => {
    console.log("receive concepts response ",concepts);
    if(concepts.results.length>0){
      setConceptData(concepts.results.map((c) => ({ id: c.id, name: c.display_name })));
    }
  }, [concepts]);

  useEffect(() => {
    console.log("retrieve concepts");
    dispatch(getConcepts());
  }, [])

  //********************** Years ******************** //
  useEffect(() => {
    console.log("receive years response ",years.group_by);
    if(years.group_by.length>0){
      setYearData(years.group_by.map((y) => y.key));
    }
  }, [years]);

  useEffect(() => {
    console.log("retrieve years");
    dispatch(getYears());
  }, [])

  return (
    <div className="container">
      <h2>Institutional Collaboration Chord Diagram</h2>
      <div className="filters">
        <label className="filter-label">
          Filter by Concept:
          <select
           className="filter-select"
            value={selectedConcept}
            onChange={(e) => setSelectedConcept(e.target.value)}
          >
            <option value="">All</option>
            {conceptData.map((concept) => (
              <option key={concept.id} value={concept.id}>
                {concept.name}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-label">
          Filter by Publication Year:
          <select
           className="filter-select"
            value={selectedYear}
            onChange={(e) => {
              console.log("select year "+e.target.value)
              setSelectedYear(e.target.value)}}
          >
            <option value="">All</option>
            {yearData.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
      {/* <p>Showing Collaboration for <span>{selectedConcept}</span> in <span>{selectedYear}</span></p> */}
      <br></br>
      <br></br>
      <br></br>
      {Matrix.length > 0 && institutions.length > 0 ? (
        <ChordDiagram matrix={Matrix} institutions={institutions} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default InstitutionCollaboration;
