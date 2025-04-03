import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCoAuthorship, getConcepts } from "../features/institutionCollaboration/institutionslice";
import { extractInstitutions, processCoAuthorData, } from "../utils/utils";
import CoAuthorshipNetworkGraph from './CoAuthorshipNetworkGraph'
import { getYears } from "../features/institutionCollaboration/institutionslice";
import axios from 'axios'
import { FaTimes } from "react-icons/fa"; 
import "../index.css"

 export const CoAuthorship = () => {

  const dispatch = useDispatch();
  const { coauthors,concepts,years, isLoadingCoAuthor,isSuccessCoAuthor,isErrorCoAuthor,messageCoAuthor } = useSelector((state) => state.institution);

  const [data, setData] = useState([]);

    const [conceptData, setConceptData] = useState([]);
    const [selectedConceptDisplayname, setSelectedConceptDisplayname] = useState("");
    const [selectedConcept, setSelectedConcept] = useState("");

    const [yearData, setYearData] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");

    const [searchInput, setSearchInput] = useState(""); // What's typed in the box
    const [displayValue, setDisplayValue] = useState(""); // What's displayed in the box
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [selectedInstitution, setSelectedInstitution] = useState("");
    const [selectedInstitutionsList, setSelectedInstitutionsList] = useState([]);

    const [showClearButton, setShowClearButton] = useState(false);

  useEffect(()=>{
    console.log("response Co Authorship ",coauthors);
    if(coauthors.results.length > 0  && !isLoadingCoAuthor){
        /// for institution selection
        // const institutions = extractInstitutions(coauthors.results);
        // console.log("extract institutions ",institutions);
        // setInstitutions(institutions);
        // setSelectedInstitution(institutions[0]);

        const coAuthorData = processCoAuthorData(coauthors.results);
        console.log("coAuthorData",coAuthorData);
        setData(coAuthorData);
    }

  },[coauthors])

  useEffect(()=>{
    console.log("retrieve Co Authorship concept ",selectedConcept+" year "+selectedYear+" institutionId "+selectedInstitution);
    if(selectedConcept === "" || selectedYear === ""){
      return;
    }
    dispatch(getCoAuthorship({conceptId:selectedConcept,institutionId:selectedInstitution,year:selectedYear}));
  },[selectedConcept,selectedInstitution,selectedYear])

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
    <div className="card coauthor-wrapper">
      <h3>Co-Authorship Network</h3>
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
        
      </div>

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
              
      </div>
      <br/>
      <div className="graph-container">
      {isLoadingCoAuthor ? (
        <p>Loading author data...</p>
      ) : data.length > 0 ? (
        <div >
          <CoAuthorshipNetworkGraph coAuthorData={data} />
        </div>
      ) : null}
      </div>

      {/* {
        isLoadingCoAuthor ? (
          <p>Getting Authors Data .... </p>
        ): ("")
      }
      {
        data.length > 0 ? (
            // <CoAuthorshipNetworkGraph />
            <CoAuthorshipNetworkGraph coAuthorData={data} />
            // <CoAuthorshipNetworkGraph1 coAuthorData={data} />
        ) :(
            ""
        )
      } */}
     
    </div>
  );

}
// export default CoAuthorship;