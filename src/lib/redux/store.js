// store.js
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice"; // import slice

// create the store
const store = configureStore({
  reducer: {
    counter: counterReducer, // add more slices later if needed


    
  
  },
});

export default store;
