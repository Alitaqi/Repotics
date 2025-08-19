import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  draft: {
    images: [],          // cropped previews [{ url, name }]
  originalImages: [],  // raw originals [{ url, name, file }]
    description: "",     // text from step 1
    crimeType: "",       // selected type
    date: "",
    time: "",
    locationText: "",    // readable string (search or my location)
    anonymous: false,
    agreed: false,
  },
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    updateDraft(state, action) {
      state.draft = { ...state.draft, ...action.payload };
    },
    resetReport(state) {
      state.draft = initialState.draft;
    },
    hydrateFromStorage(state, action) {
      state.draft = { ...state.draft, ...action.payload };
    },
  },
});

export const { updateDraft, resetReport, hydrateFromStorage } = reportSlice.actions;
export default reportSlice.reducer;