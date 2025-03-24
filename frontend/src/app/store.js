import { configureStore } from "@reduxjs/toolkit";
import institutionReducer from '../features/institutionCollaboration/institutionslice'

export const store = configureStore({
  reducer: {
    institution:institutionReducer
  },
});
