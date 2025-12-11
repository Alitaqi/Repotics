// src/lib/redux/slices/missingPersonViewSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  persons: [], // Empty now, will be populated from backend
  selectedPerson: null,
};

const missingPersonViewSlice = createSlice({
  name: "missingPersonView",
  initialState,
  reducers: {
    setSelectedPerson(state, action) {
      state.selectedPerson = action.payload;
    },
    // Remove addPerson action since we're using RTK Query
  },
});

export const { setSelectedPerson } = missingPersonViewSlice.actions;
export default missingPersonViewSlice.reducer;