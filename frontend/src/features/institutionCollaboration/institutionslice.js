import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import institutionService from '../institutionCollaboration/institutionservice'

const initialState = {
    concepts:{
        results:[]
    },
    years:{
        group_by:[]
    },
    works:{
        results:[]
    },
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
}

export const getInstitutionCollaboration = createAsyncThunk('institutionCollaboration/getInstitutionCollaboration',async ({conceptId,year},thunkAPI) =>{
    console.log("institutionSlice conceptId ",conceptId+" year "+year);
    try {
        return await institutionService.getInstitutionCollaboration(conceptId,year)
    } catch (error) {
        const message = error?.response?.data?.message || "";
      return thunkAPI.rejectWithValue(message)
    }
})

export const getConcepts = createAsyncThunk('institutionCollaboration/getConcepts',async (thunkAPI) =>{
    console.log("");
    try {
        return await institutionService.getConcepts()
    } catch (error) {
        const message = error?.response?.data?.message || "";
      return thunkAPI.rejectWithValue(message)
    }
})

export const getYears = createAsyncThunk('institutionCollaboration/getYears',async (thunkAPI) =>{
    console.log("");
    try {
        return await institutionService.getYears()
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
    }
})


export const {reset} = institutionSlice.actions
export default institutionSlice.reducer