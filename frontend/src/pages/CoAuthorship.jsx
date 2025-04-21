import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCoAuthorship, getConcepts } from "../features/institutionCollaboration/institutionslice";
import { extractInstitutions, processCoAuthorData, } from "../utils/utils";
import CoAuthorshipNetworkGraph from './CoAuthorshipNetworkGraph'
import { getYears } from "../features/institutionCollaboration/institutionslice";
import axios from 'axios'
import { FaTimes } from "react-icons/fa"; 
import "../index.css"

 export const CoAuthorship = ({
  field,
  year,
  sourceInstitutionId,
  targetInstitutionId,
  sourceInstitutionName,
  targetInstitutionName
 }) => {

  const dispatch = useDispatch();
  const { coauthors,concepts,years, isLoadingCoAuthor,isSuccessCoAuthor,isErrorCoAuthor,messageCoAuthor } = useSelector((state) => state.institution);

  const [data, setData] = useState([]);

  useEffect(()=>{
    if(coauthors.results.length > 0  && !isLoadingCoAuthor){
        const coAuthorData = processCoAuthorData(coauthors.results);
        setData(coAuthorData);
    }

  },[coauthors])

  useEffect(()=>{
    dispatch(getCoAuthorship({conceptId:field,sourceinstitutionId:sourceInstitutionId,targetinstitutionId:targetInstitutionId,year:year}));
  },[sourceInstitutionId,targetInstitutionId])

  return (

    <div className="coauthor-wrapper">
      <div >
      <h3>Co-Authorship Network Graph between {sourceInstitutionName} and {targetInstitutionName} </h3>
   
      <div className="graph-container">
      {isLoadingCoAuthor ? (
        <p>Loading author data...</p>
      ) : data.length > 0 ? (
        <div >
          <CoAuthorshipNetworkGraph coAuthorData={data} />
        </div>
      ) : null}
      </div>
     </div>
    </div>
  );

}
