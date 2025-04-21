import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import institutionService from '../institutionCollaboration/institutionservice'

const initialState = {
    concepts:{
        results:[]
    },
    years:{
        group_by:[]
    },
    countries:{
        results:[]
    },
    works:{
        results:[]
    },
    coauthors:{
        results:[]
    },
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
    isErrorCoAuthor: false,
    isSuccessCoAuthor: false,
    isLoadingCoAuthor: false,
    messageCoAuthor: ''
}

export const getInstitutionCollaboration = createAsyncThunk('institutionCollaboration/getInstitutionCollaboration',async ({conceptId,year,institutionId},thunkAPI) =>{
    try {
        return await institutionService.getInstitutionCollaboration(conceptId,year,institutionId)
    } catch (error) {
        const message = error?.response?.data?.message || "";
      return thunkAPI.rejectWithValue(message)
    }
})

export const getConcepts = createAsyncThunk('institutionCollaboration/getConcepts',async (thunkAPI) =>{
    try {
        return await institutionService.getConcepts()
    } catch (error) {
        const message = error?.response?.data?.message || "";
      return thunkAPI.rejectWithValue(message)
    }
})

export const getYears = createAsyncThunk('institutionCollaboration/getYears',async (thunkAPI) =>{
    try {
        return await institutionService.getYears()
    } catch (error) {
        const message = error?.response?.data?.message || "";
      return thunkAPI.rejectWithValue(message)
    }
})

export const getCoAuthorship = createAsyncThunk('institutionCollaboration/getCoAuthorship',async ({conceptId,sourceinstitutionId,targetinstitutionId,year},thunkAPI) =>{
    try {
          // Create an array of promises for 3 pages
        const pagePromises = [
            institutionService.getCoAuthorship(conceptId,sourceinstitutionId,targetinstitutionId,year, 1),
            institutionService.getCoAuthorship(conceptId,sourceinstitutionId,targetinstitutionId,year, 2),
        ];

         // Wait for all requests to complete
        const results = await Promise.all(pagePromises);
        // Combine all results
        const combinedData = {
            results: results.flatMap(result => result.results),
            meta: results[0].meta 
        };
        return combinedData;
    } catch (error) {
        const message = error?.response?.data?.message || "";
      return thunkAPI.rejectWithValue(message)
    }
})

export const getCountries = createAsyncThunk('institutionCollaboration/getCountries',async (thunkAPI) =>{
    console.log("");
    try {
        return await institutionService.getCountries()
    } catch (error) {
        const message = error?.response?.data?.message || "";
      return thunkAPI.rejectWithValue(message)
    }
})

export const institutionSlice = createSlice({
    name: 'institution',
    initialState,
    reducers:{
        reset: (state) => initialState
    },
    extraReducers: (builder) =>{
        builder
        .addCase(getCountries.fulfilled,(state,action) => {
            state.countries = action.payload
        })
        .addCase(getYears.fulfilled,(state,action) => {
            state.years = action.payload
        })
        .addCase(getConcepts.fulfilled,(state,action) => {
            state.concepts = action.payload
        })
        .addCase(getInstitutionCollaboration.pending, (state) =>{
            state.isLoading = true
        })
        .addCase(getInstitutionCollaboration.fulfilled,(state,action) => {
            state.isLoading = false
            state.isSuccess = true
            state.works = action.payload
        })
        .addCase(getInstitutionCollaboration.rejected,(state,action) => {
            state.isLoading = false
            state.isError = true
            state.message = action.payload
        })
        .addCase(getCoAuthorship.pending, (state) =>{
            state.isLoadingCoAuthor = true
        })
        .addCase(getCoAuthorship.fulfilled,(state,action) => {
            state.isLoadingCoAuthor = false
            state.isSuccessCoAuthor = true
            state.coauthors = action.payload
        })
        .addCase(getCoAuthorship.rejected,(state,action) => {
            state.isLoadingCoAuthor = false
            state.isErrorCoAuthor = true
            state.messageCoAuthor = action.payload
        })
    }
})


export const {reset} = institutionSlice.actions
export default institutionSlice.reducer