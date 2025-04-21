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
import { CoAuthorship } from "./CoAuthorship";

export const InstitutionCollaboration = () => {
  const dispatch = useDispatch();
  const { works,concepts,years, countries, isLoading,isSuccess,isError,message } = useSelector((state) => state.institution);

  const [conceptData, setConceptData] = useState([]);
  const [selectedConceptDisplayname, setSelectedConceptDisplayname] = useState("");
  const [selectedConcept, setSelectedConcept] = useState("");
  const [selectedConceptId, setSelectedConceptId] = useState("");

  const [yearData, setYearData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [searchInput, setSearchInput] = useState(""); 
  const [displayValue, setDisplayValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [selectedInstitutionsList, setSelectedInstitutionsList] = useState([]);
  const [showClearButton, setShowClearButton] = useState(false);
 
  const isSettingSelection = useRef(false);

  const [displayMessage,setDisplayMessage] = useState("");

  const [Matrix, setMatrix] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  const [sourceInstitutionId, setSourceInstitutionId] = useState("");
  const [targetInstitutionId, setTargetInstitutionId] = useState("");
  const [sourceInstitutionName, setSourceInstitutionName] = useState("");
  const [targetInstitutionName, setTargetInstitutionName] = useState("");
  const [showCoauthorGraph, setShowCoauthrGraph] = useState(false);
  //*********************** Work ****************** //
  useEffect(() => {
    if(Matrix.length == 0 && institutions.length == 0 && works.results.length>0){
      console.log("after works data retrieved, clean matrix data first and processWorks and prepare for cord data ");
      const  collaborationCounts  = processWorks(works.results);

      const { matrix, institutionList } = prepareChordData(collaborationCounts,works.results);

      if(matrix.length != 0 && institutionList.length != 0){
        setMatrix(matrix);
        setInstitutions(institutionList);
        setDisplayMessage("");
      }else{
        setDisplayMessage(
          <>
          No Institutional Collaborations found for field: <strong>{selectedConceptDisplayname}</strong>
          ,Years: <strong>{selectedYear}</strong>.
          </>
        );
      }
    }
  }, [Matrix,institutions]);

  useEffect(() => {
    if(works.results.length>0 && !isLoading){
        setMatrix([]);
        setInstitutions([]);
      }

  }, [works,isLoading]);
 
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
        setSelectedConceptId(cleanedConceptId);
        dispatch(getInstitutionCollaboration({conceptId:cleanedConceptId,year:selectedYear,institutionId:selectedInstitution}));
    }
  }, [selectedConcept,selectedYear,selectedInstitution]);

  //********************** Concepts ******************** //
  useEffect(() => {
    if(concepts.results.length>0){
      setConceptData(concepts.results.map((c) => ({ id: c.id, name: c.display_name })));
      const conceptId = concepts.results[0].id.match(/C\d+$/)?.[0];
      const conceptName = concepts.results[0].display_name;
      setSelectedConcept(conceptId);
      setSelectedConceptDisplayname(conceptName);
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
      .filter(year => parseInt(year.key) >= 1998)
      .sort((a, b) => parseInt(a.key) - parseInt(b.key));

        const ranges = [];
        for (let i = 0; i < sortedYears.length; i += 2) {
          const yearStart = sortedYears[i].key;
          const yearEnd = sortedYears[i + 1]?.key || sortedYears[i].key;
          
          ranges.push(`${yearStart}-${yearEnd}`);
        };
        ranges.reverse();
        
        setYearData(ranges);
        setSelectedYear(ranges[0]);
    }
  }, [years]);

  useEffect(() => {
    console.log("retrieve years");
    dispatch(getYears());
  }, [])

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
          search: searchInput,
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
    setDisplayValue(institution.display_name);
    setShowClearButton(true); 
    setSearchResults([]);
  };

    // Add this new function to handle clearing
    const handleClearSearch = () => {
      setSearchInput("");
      setDisplayValue("");
      setSelectedInstitution("");
      setShowClearButton(false);
      setSearchResults([]);
      
    };

    const handleRemoveInstitution = (institutionId) => {
      setSelectedInstitutionsList(prev => prev.filter(item => item.id !== institutionId));
    
      if (selectedInstitution?.id === institutionId) {
        setSelectedInstitution(null);
      }
    };

  // Debounce search
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchInput.trim()) {
        searchInstitutions();
      }else{
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchInput]);


  const handleChordClick = (data) => {
    console.log("handleChordClick:", data.sourceInstitutionId+" "+data.targetInstitutionId);
    setSourceInstitutionId(data.sourceInstitutionId);
    setTargetInstitutionId(data.targetInstitutionId);
    setSourceInstitutionName(data.sourceInstitutionName);
    setTargetInstitutionName(data.targetInstitutionName);
    setShowCoauthrGraph(true);
  };

  return (
    <div>
      <div className="card institution-wrapper">
      <h3>Chord Diagram of Institutional Collaborations (≥2 Joint Publications)</h3>
      <div className="filters">
        <label className="filter-label">
          Filter by Field:
          <select
           className="filter-select"
            value={selectedConcept}
            onChange={(e) =>{ 
              setSelectedConcept(e.target.value)
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

      {/* New Search and Selection Section */}
      <div className="search-section">
        <h4>Search Institutions</h4>
        <div className="search-input-container">
          <input
              type="text"
              placeholder="Search institutions by name..."
              value={displayValue || searchInput}
              onChange={(e) => {
                console.log("search institution ",e.target.value)
                setSearchInput(e.target.value);
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
      </div>


      <br></br>
      <br></br>
      <br></br>
      <div className="graph-container">

        {isLoading ? (
              <p>Loading institution data...</p>
        ) : Matrix.length > 0 && institutions.length > 0 ? (
          <div >
            <ChordDiagram matrix={Matrix} institutions={institutions}  onChordClick={handleChordClick} />
          </div>
        ) :   <p>{displayMessage}</p>}

      </div>

  
    </div>
      <div className="coauthor-wrapper">
        { showCoauthorGraph ? (
          <CoAuthorship
                field = {selectedConceptId}
                year = {selectedYear}
                sourceInstitutionId= {sourceInstitutionId}
                targetInstitutionId = {targetInstitutionId}
                sourceInstitutionName = {sourceInstitutionName}
                targetInstitutionName = {targetInstitutionName}
            />
        ) : (
          ""
        )
        }
      </div>

    </div>
  );
};
