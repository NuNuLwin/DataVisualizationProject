import React, { useEffect, useState, useRef } from "react";
import ChordDiagram from "./ChordDiagram";
import { useSelector, useDispatch } from "react-redux";
import {getCountries, getInstitutionCollaboration} from '../features/institutionCollaboration/institutionslice'
import { getConcepts } from "../features/institutionCollaboration/institutionslice";
import { getYears } from "../features/institutionCollaboration/institutionslice";
import "../index.css"
import axios from 'axios'
import { FaTimes } from "react-icons/fa"; 

import { processWorks,prepareChordData,getCountryName } from "../utils/utils";


export const InstitutionCollaboration = () => {
  const dispatch = useDispatch();
  const { works,concepts,years, countries, isLoading,isSuccess,isError,message } = useSelector((state) => state.institution);

  const [conceptData, setConceptData] = useState([]);
  const [selectedConceptDisplayname, setSelectedConceptDisplayname] = useState("");
  const [selectedConcept, setSelectedConcept] = useState("");

  const [yearData, setYearData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  // const [CountryData, setCountryData] = useState([]);
  // const [selectedCountryCode, setSelectedCountryCode] = useState("");
  // const [selectedCountryName, setSelectedCountryName] = useState("");

    // New states for institution search
   // const [searchTerm, setSearchTerm] = useState("");
   const [searchInput, setSearchInput] = useState(""); // What's typed in the box
   const [displayValue, setDisplayValue] = useState(""); // What's displayed in the box
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [selectedInstitution, setSelectedInstitution] = useState("");
    const [selectedInstitutionsList, setSelectedInstitutionsList] = useState([]);
    const [showClearButton, setShowClearButton] = useState(false);
  // Add this ref to track if we're setting a selection
  const isSettingSelection = useRef(false);

  const [displayMessage,setDisplayMessage] = useState("");

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
        setDisplayMessage("");
      }else{
        setDisplayMessage(
          <>
          No Institutional Collaborations found for Concept: <strong>{selectedConceptDisplayname}</strong>
          ,Years: <strong>{selectedYear}</strong>.
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
    if(selectedConcept === "" || selectedYear === ""){
      return;
    }
    if (selectedConcept !== "" || selectedYear !== "" || selectedInstitution !== ""){
        var cleanedConceptId = "";
        if(selectedConcept){
          cleanedConceptId = selectedConcept.match(/C\d+$/)?.[0];
        }else{
          cleanedConceptId = cleanedConceptId;
        }
    
        console.log("selectedConcept ",cleanedConceptId+" selectedYear "+selectedYear);
        dispatch(getInstitutionCollaboration({conceptId:cleanedConceptId,year:selectedYear,institutionId:selectedInstitution}));
    }
  }, [selectedConcept,selectedYear,selectedInstitution]);// this will run as first time.

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

  //  //********************** Countries ******************** //
  //  useEffect(() => {
  //   console.log("receive countries response ",countries.results[0]);
  //   if(countries.results.length>0){
  //     // add to country data
  //     setCountryData(countries.results.map((c) => ({ code: c.country_code, name: c.display_name })));

  //     // set default selected coutry
  //     setSelectedCountryCode(countries.results[0].country_code);
  //     setSelectedCountryName(countries.results[0].display_name)
  //   }
  // }, [countries]);

  // useEffect(() => {
  //   console.log("retrieve concepts");
  //   dispatch(getCountries());
  // }, [])

   // ****** Function to search institutions
   const searchInstitutions = async () => {
    if (!searchInput.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await axios.get('https://api.openalex.org/institutions', {
        params: {
          search: searchInput,//searchTerm,
          per_page: 10
        }
      });

      setSearchResults(response.data.results);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

   // Function to select an institution
   const handleSelectInstitution = (institution) => {
    setSelectedInstitution(institution.id);
    setDisplayValue(institution.display_name);//setSearchTerm(institution.display_name);// Show selected institution in search box
    setShowClearButton(true); // Show the clear button
    setSearchResults([]); // Clear search results
    // isSettingSelection.current = false;
  };

    // Add this new function to handle clearing
    const handleClearSearch = () => {
      setSearchInput("");//setSearchTerm("");
      setDisplayValue("");
      setSelectedInstitution("");
      setShowClearButton(false);
      setSearchResults([]);
      
    };

    // Function to remove an institution from the selected list
    const handleRemoveInstitution = (institutionId) => {
      setSelectedInstitutionsList(prev => prev.filter(item => item.id !== institutionId));
      
      // Clear selected institution if it's the one being removed
      if (selectedInstitution?.id === institutionId) {
        setSelectedInstitution(null);
      }
    };

  // Debounce search
  useEffect(() => {
   // if (isSettingSelection.current) return; // Skip search when setting selection

    const timerId = setTimeout(() => {
      if (searchInput.trim()) {
        searchInstitutions();
      }else{
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchInput]);//searchTerm


  return (
    <div className="container">
      <h3>Chord Diagram of Institutional Collaborations (≥2 Joint Publications)</h3>
      {/*  Research Collaboration Network: Institutions with 2+ Shared Publications*/}
      <div className="filters">
        <label className="filter-label">
          Filter by Field:
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
        <br></br>

      </div>

      {/* <div className="filters">
        <label className="filter-label">
            Filter by Country:
            <select
            className="filter-select"
              value={selectedCountryCode}
              onChange={(e) =>{ 
                setSelectedCountryCode(e.target.value)
              }}
            >
              {CountryData.map((country) => (
                <option key={country.country_code} value={country.country_code}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
      </div> */}

 {/* New Search and Selection Section */}
      <div className="search-section">
        <h4>Search Institutions</h4>
        <div className="search-input-container">
          <input
              type="text"
              placeholder="Search institutions by name..."
              value={displayValue || searchInput}//{searchTerm}
              onChange={(e) => {
                console.log("search institution ",e.target.value)
                setSearchInput(e.target.value);//setSearchTerm(e.target.value);
                setDisplayValue(e.target.value);
                setShowClearButton(e.target.value.length > 0);
                if (!e.target.value) {
                  setSelectedInstitution(null);
                }
              }}
              className="search-input"
            />
          {(displayValue || searchInput) && showClearButton && (
            <button 
              onClick={handleClearSearch}
              className="clear-button"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {isSearching && <p>Searching...</p>}
        {searchError && <p className="error">Error: {searchError}</p>}
        
        {searchResults.length > 0 && (
          <div className="search-results">
            <h5>Search Results:</h5>
            <ul>
              {searchResults.map(institution => (
                <li key={institution.id}>
                  <div className="institution-result">
                    <strong>{institution.display_name}</strong>
                    {institution.country_code && ` (${institution.country_code})`}
                    {institution.works_count && ` - ${institution.works_count.toLocaleString()} works`}
                    <button 
                      onClick={() => handleSelectInstitution(institution)}
                      className="select-button"
                    >
                      Select
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* {selectedInstitution && (
          <div className="selected-institution">
            <h5>Currently Selected:</h5>
            <div className="institution-card">
              <h4>{selectedInstitution.display_name}</h4>
              <p>ID: {selectedInstitution.id.split('/').pop()}</p>
              {selectedInstitution.country_code && <p>Country: {selectedInstitution.country_code}</p>}
              {selectedInstitution.works_count && <p>Works: {selectedInstitution.works_count.toLocaleString()}</p>}
            </div>
          </div>
        )}
        
        {selectedInstitutionsList.length > 0 && (
          <div className="selected-list">
            <h5>Selected Institutions:</h5>
            <ul>
              {selectedInstitutionsList.map(institution => (
                <li key={institution.id}>
                  <div className="selected-item">
                    <span>{institution.display_name}</span>
                    <button 
                      onClick={() => handleRemoveInstitution(institution.id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )} */}
      </div>


      <br></br>
      <br></br>
      <br></br>
      <div className="graph-container">
        {/* {Matrix.length > 0 && institutions.length > 0 ? (
          <ChordDiagram matrix={Matrix} institutions={institutions} />
        ) : (
          <p>{displayMessage === "" ? "Loading..." : displayMessage}</p>
          )
        } */}

        {isLoading ? (
              <p>Loading institution data...</p>
        ) : Matrix.length > 0 && institutions.length > 0 ? (
          <div >
            <ChordDiagram matrix={Matrix} institutions={institutions} />
          </div>
        ) :   <p>{displayMessage}</p>}

      </div>
    </div>
  );
};

// export default InstitutionCollaboration;
