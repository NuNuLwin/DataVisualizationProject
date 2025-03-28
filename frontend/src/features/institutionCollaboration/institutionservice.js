import axios from 'axios'

const API_URL = 'https://api.openalex.org/';
//const API_URL = 'https://api.openalex.org/works?filter=concepts.id:C121332964&per_page=40';
//const API_CONCEPT_URL = 'https://api.openalex.org/concepts';

const getInstitutionCollaboration = async(conceptId,year)=>{
  console.log("institutionService  conceptId ",conceptId+" year "+year);
  var url = "";
  if ((!conceptId || conceptId.trim() === "") && (!year|| year.trim() === "")) {
     url = `${API_URL}works?per-page=200`; 
  }
  else if(conceptId && (!year|| year.trim() === "") ){
    url = `${API_URL}works?filter=concepts.id:${conceptId}&per_page=100`;
  }
  else if((!conceptId || conceptId.trim() === "") && year){
    url = `${API_URL}works?filter=publication_year:${year}&per_page=100`;
  }
  else if(conceptId && year){
    url = `${API_URL}works?filter=concepts.id:${conceptId},publication_year:${year}&per_page=200`;
  }
  console.log("institutionService work url based on param ",url);
  const response = await axios.get(url);
  return response.data;
}

const getConcepts = async()=>{
  const response = await axios.get(API_URL+'concepts');
return response.data;
}

const getYears = async()=>{
  const response = await axios.get(API_URL+'works?group_by=publication_year');
return response.data;
}

const institutionService = {
    getInstitutionCollaboration,
    getConcepts,
    getYears
}

export default institutionService