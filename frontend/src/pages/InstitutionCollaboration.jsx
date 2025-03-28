import React, { useEffect, useState } from "react";
import ChordDiagram from "./ChordDiagram";
import { useSelector, useDispatch } from "react-redux";
import {getInstitutionCollaboration} from '../features/institutionCollaboration/institutionslice'
import { getConcepts } from "../features/institutionCollaboration/institutionslice";
import { getYears } from "../features/institutionCollaboration/institutionslice";
import "../index.css"

import { processWorks,prepareChordData,getCountryName } from "../utils/utils";


const InstitutionCollaboration = () => {
  const dispatch = useDispatch();
  const { works,concepts,years, isLoading,isSuccess,isError,message } = useSelector((state) => state.institution);

  const [conceptData, setConceptData] = useState([]);
  const [selectedConceptDisplayname, setSelectedConceptDisplayname] = useState("");
  const [selectedConcept, setSelectedConcept] = useState("");

  const [yearData, setYearData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [displayMessage,setDisplayMessage] = useState("");

  // const [selectedCountry, setSelectedCountry] = useState("All"); // New state
  // const [availableCountries, setAvailableCountries] = useState([]); // New state
  
  const [Matrix, setMatrix] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  //*********************** Work ****************** //
  useEffect(() => {
    if(Matrix.length == 0 && institutions.length == 0 && works.results.length>0){
      console.log("after works data retrieved, clean matrix data first and processWorks and prepare for cord data ");
      const  collaborationCounts  = processWorks(works.results);//const collaborationCounts = processWorks(works.results);//const {collaborationCounts,institutionCountryMap} = processWorks(works.results);

      //  // Extract unique countries for dropdown
      // const uniqueCountryCodes = [...new Set(Object.values(institutionCountryMap))];
      // const countries = uniqueCountryCodes
      // .map(code => ({
      //   code,
      //   name: getCountryName(code) // Convert code to readable name
      // }))
      // .sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical sort
      // setAvailableCountries(countries);
     
      //  // 3. Auto-select first country if none selected
      //  if (!selectedCountry && countries.length > 0) {
      //   setSelectedCountry(countries[0].code);

      // }

      // const { matrix, institutionList } = prepareChordData(
      //   collaborationCounts,
      //   institutionCountryMap,
      //   selectedCountry
      // ); 
      const { matrix, institutionList } = prepareChordData(collaborationCounts);//const { matrix, institutionList } = prepareChordData({ collaborationCounts, institutionAppearances }, 15);
      console.log("getData from prepareChordData ",matrix.length+" "+institutionList.length);
      if(matrix.length != 0 && institutionList.length != 0){
        setMatrix(matrix);
        setInstitutions(institutionList);
      }else{
        setDisplayMessage(
          <>
          No Collaborations found for : <br />
          Concept: <strong>{selectedConceptDisplayname}</strong> <br />
          Years: <strong>{selectedYear}</strong>
          </>
          // "No Collaborations found for \n Concept: "+selectedConceptDisplayname+" Years: "+selectedYear
        );
      }
    }
  }, [Matrix,institutions]);

  useEffect(() => {
    console.log("works data retrieved ");
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
    if (selectedConcept !== "" && selectedYear !== ""){
        var cleanedConceptId = "";
        if(selectedConcept){
          cleanedConceptId = selectedConcept.match(/C\d+$/)?.[0];
        }else{
          cleanedConceptId = cleanedConceptId;
        }
    
        console.log("selectedConcept ",cleanedConceptId+" selectedYear "+selectedYear);
        dispatch(getInstitutionCollaboration({conceptId:cleanedConceptId,year:selectedYear}));
    }
  }, [selectedConcept,selectedYear]);// this will run as first time.

  //********************** Concepts ******************** //
  useEffect(() => {
    console.log("receive concepts response ",concepts.results[0]);
    if(concepts.results.length>0){
      // add to concept data
      setConceptData(concepts.results.map((c) => ({ id: c.id, name: c.display_name })));

      // set default selected concept.
      const conceptId = concepts.results[0].id.match(/C\d+$/)?.[0];
      const conceptName = concepts.results[0].display_name;
      setSelectedConcept(conceptId);
      setSelectedConceptDisplayname(conceptName)
    }
  }, [concepts]);

  useEffect(() => {
    console.log("retrieve concepts");
    dispatch(getConcepts());
  }, [])

  //********************** Years ******************** //
  useEffect(() => {
    console.log("receive years response ",years.group_by[0]);
    if(years.group_by.length>0){
      const sortedYears = [...years.group_by]
      .filter(year => parseInt(year.key) >= 1998)  // Remove years less than 2000
      .sort((a, b) => parseInt(a.key) - parseInt(b.key)); // Sort in ascending order
      //.sort((a, b) => parseInt(b.key) - parseInt(a.key)); // Sort in descending order

        // Group sorted years into ranges (e.g., 2023-2020, 2022-2021, ...)
        const ranges = [];
        for (let i = 0; i < sortedYears.length; i += 2) {
          const yearStart = sortedYears[i].key; // Start of the range
          const yearEnd = sortedYears[i + 1]?.key || sortedYears[i].key; // End of the range (if there are fewer than 3 years left, use the start year)
          
          ranges.push(`${yearStart}-${yearEnd}`);
        };
        ranges.reverse();
        
        // add the year ranges data 
        setYearData(ranges);
        // Set Default selected year range.
        setSelectedYear(ranges[0]);
    }
  }, [years]);

  useEffect(() => {
    console.log("retrieve years");
    dispatch(getYears());
  }, [])

  return (
    <div className="container">
      <h3>Chord Diagram of Institutional Collaborations (≥2 Joint Publications)</h3>
      {/*  Research Collaboration Network: Institutions with 2+ Shared Publications*/}
      <div className="filters">
        <label className="filter-label">
          Filter by Concept:
          <select
           className="filter-select"
            value={selectedConcept}
            onChange={(e) =>{ 
              setSelectedConcept(e.target.value)
              // Find the display name of the selected concept
              const selectedConceptObj = conceptData.find((concept) => concept.id === e.target.value);
              setSelectedConceptDisplayname(selectedConceptObj ? selectedConceptObj.name : '');
            }}
          >
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
  
            {yearData.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        
      </div>
      <br></br>
      <br></br>
      <br></br>
      {Matrix.length > 0 && institutions.length > 0 ? (
        <ChordDiagram matrix={Matrix} institutions={institutions} />
      ) : (
         <p>{displayMessage === "" ? "Loading..." : displayMessage}</p>
        )
      }
    </div>
  );
};

export default InstitutionCollaboration;
