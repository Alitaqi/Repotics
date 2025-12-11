// src/lib/redux/slices/reportSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  draft: {
    images: [],           // cropped previews [{ url, name }]
    originalImages: [],   // raw originals [{ url, name }] (file stripped)
    incidentDescription: "", // text from step 1
    aiGeneratedSummary: "", // AI-generated summary
    crimeType: "",        // selected type
    date: "",
    time: "",
    locationText: "",     // readable string (search or my location)
    coordinates: { lat: null, lng: null },
    anonymous: false,
    agreed: false,
  },
  posts: [], // ✅ all posts fetched for feed/profile
  // ✅ Added: Post approval state
  postApproval: {
    isOpen: false,        // Whether approval modal is open
    isApproved: false,    // Whether post was approved
    isLoading: false,     // Loading state for approval
  },
};

const sanitizeImages = (images = []) =>
  images.map((img) => ({
    url: img.url || URL.createObjectURL(img.file), // allow raw File and create preview
    name: img.name || img.file?.name,
    // ❌ don't keep file in Redux
  }));

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    // --- DRAFT HANDLERS ---
    updateDraft(state, action) {
      const payload = { ...action.payload };

      if (payload.originalImages) {
        payload.originalImages = sanitizeImages(payload.originalImages);
      }
      if (payload.images) {
        payload.images = sanitizeImages(payload.images);
      }

      state.draft = { ...state.draft, ...payload };
    },
    
    resetReport(state) {
      state.draft = { ...initialState.draft };
      state.postApproval = { ...initialState.postApproval }; // Reset approval state too
    },
    
    hydrateFromStorage(state, action) {
      const payload = { ...action.payload };

      if (payload.originalImages) {
        payload.originalImages = sanitizeImages(payload.originalImages);
      }
      if (payload.images) {
        payload.images = sanitizeImages(payload.images);
      }

      state.draft = { ...state.draft, ...payload };
    },

    // --- POST APPROVAL HANDLERS ---
    setPostApprovalOpen(state, action) {
      state.postApproval.isOpen = action.payload;
    },
    
    setPostApproved(state, action) {
      state.postApproval.isApproved = action.payload;
    },
    
    setPostApprovalLoading(state, action) {
      state.postApproval.isLoading = action.payload;
    },
    
    resetPostApproval(state) {
      state.postApproval = { ...initialState.postApproval };
    },

    // --- POSTS HANDLERS ---
    setPosts(state, action) {
      state.posts = action.payload;
    },
    
    addPost(state, action) {
      state.posts.unshift(action.payload); // new post goes to top of feed
    },
    
    updatePost(state, action) {
      const updated = action.payload;
      state.posts = state.posts.map((p) =>
        p._id === updated._id ? updated : p
      );
    },
    
    deletePost(state, action) {
      const postId = action.payload;
      state.posts = state.posts.filter((p) => p._id !== postId);
    },
    
    // ✅ Custom action to prepare post for approval
    prepareForApproval(state) {
      // This ensures all data is properly formatted for the approval view
      // No state changes needed here, just a placeholder for future logic
    },
  },
});

// 👇 Custom safe dispatcher (to sanitize before updating draft)
export const safeUpdateDraft = (payload) => (dispatch) => {
  const sanitized = { ...payload };

  if (sanitized.originalImages) {
    sanitized.originalImages = sanitizeImages(sanitized.originalImages);
  }
  if (sanitized.images) {
    sanitized.images = sanitizeImages(sanitized.images);
  }

  dispatch(reportSlice.actions.updateDraft(sanitized));
};

export const {
  updateDraft,
  resetReport,
  hydrateFromStorage,
  setPosts,
  addPost,
  updatePost,
  deletePost,
  // Export new post approval actions
  setPostApprovalOpen,
  setPostApproved,
  setPostApprovalLoading,
  resetPostApproval,
  prepareForApproval,
} = reportSlice.actions;

export default reportSlice.reducer;