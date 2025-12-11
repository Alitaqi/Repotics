// missingPersonSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  isEditMode: false,
  editId: null,
  draft: {
    photos: [],
    name: "",
    age: "",
    gender: "",
    height: "",
    build: "",
    distinguishingMarks: "",
    lastSeenDate: "",
    lastSeenTime: "",
    lastSeenLocation: "",
    clothing: "",
    medical: "",
    details: "",
    status: "Missing",
    agreed: false,
    removedPhotos: [], // Track photos to remove during edit
  },
};

const missingPersonSlice = createSlice({
  name: "missingPerson",
  initialState,
  reducers: {
    openModal: (s) => { 
      s.isOpen = true; 
      s.isEditMode = false;
      s.editId = null;
    },
    closeModal: (s) => { 
      s.isOpen = false; 
      s.isEditMode = false;
      s.editId = null;
    },
    updateDraft: (s, action) => {
      s.draft = { ...s.draft, ...action.payload };
    },
    clearDraft: (s) => {
      s.draft = initialState.draft;
    },
    // New action for edit mode
    openEditModal: (s, action) => {
      s.isOpen = true;
      s.isEditMode = true;
      s.editId = action.payload.id;
      // Populate draft with existing data
      s.draft = { ...initialState.draft, ...action.payload.data };
    },
  },
});

export const { 
  openModal, 
  closeModal, 
  updateDraft, 
  clearDraft,
  openEditModal 
} = missingPersonSlice.actions;

export default missingPersonSlice.reducer;