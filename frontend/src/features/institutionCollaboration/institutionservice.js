import axios from 'axios'

const API_URL = 'https://api.openalex.org/';

const getInstitutionCollaboration = async(conceptId,year,institutionId)=>{
  var url = "";
    if (institutionId){
      url = `${API_URL}works?filter=concepts.id:${conceptId},institutions.id:${institutionId},publication_year:${year}&per_page=200`;
    }else{
      url = `${API_URL}works?filter=concepts.id:${conceptId},publication_year:${year}&per_page=200`;
    }

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

const getCoAuthorship = async(conceptId,sourceinstitutionId,targetinstitutionId,year, page = 1)=>{
  var url = "";
  url = API_URL+`works?filter=concepts.id:${conceptId},institutions.id:${sourceinstitutionId}|${targetinstitutionId},publication_year:${year}&per-page=200&page=${page}`;
  const response = await axios.get(url);
  return response.data;
}

const getCountries = async() => {
  var url = API_URL+`countries`;
  const response = await axios.get(url);
  return response.data;
}

const institutionService = {
    getInstitutionCollaboration,
    getConcepts,
    getYears,
    getCoAuthorship,
    getCountries
}

export default institutionService