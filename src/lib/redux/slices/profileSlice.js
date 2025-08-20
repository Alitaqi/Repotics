// src/lib/redux/slices/profileSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    name: "John Doe",
    username: "johndoe",
    verified: true,
    location: "Gotham City",
    birthdate: "Born March 30, 2000",
    posts: 42,
    followers: 123,
    following: 87,
    bio: "Vigilante by night. Billionaire by day.",
    badges: ["Batman", "Vigilante", "Detective"],
    followingUsers: [
      { id: 1, name: "Bruce Wayne", avatar: "https://i.pravatar.cc/50?u=1" },
      { id: 2, name: "Clark Kent", avatar: "https://i.pravatar.cc/50?u=2" },
      { id: 3, name: "Diana Prince", avatar: "https://i.pravatar.cc/50?u=3" },
      { id: 4, name: "Barry Allen", avatar: "https://i.pravatar.cc/50?u=4" },
      { id: 5, name: "Arthur Curry", avatar: "https://i.pravatar.cc/50?u=5" },
      { id: 6, name: "Hal Jordan", avatar: "https://i.pravatar.cc/50?u=6" },
      { id: 7, name: "Oliver Queen", avatar: "https://i.pravatar.cc/50?u=7" },
      { id: 8, name: "Selina Kyle", avatar: "https://i.pravatar.cc/50?u=8" },
      { id: 9, name: "Harley Quinn", avatar: "https://i.pravatar.cc/50?u=9" },
    ],
  },
  images: {
    bannerImage: "\\src\\assets\\images\\c6.png",
    profileImage: "https://i.pravatar.cc/150?u=me",
  },
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setBio(state, action) {
      state.user.bio = action.payload;
    },
    setBannerImage(state, action) {
      state.images.bannerImage = action.payload;
    },
    setProfileImage(state, action) {
      state.images.profileImage = action.payload;
    },
    // Optional: update counters, user fields, etc.
    setUserField(state, action) {
      const { key, value } = action.payload;
      if (key in state.user) state.user[key] = value;
    },
    // Optional: unfollow/follow logic
    unfollow(state, action) {
      const id = action.payload;
      state.user.followingUsers = state.user.followingUsers.filter(u => u.id !== id);
      if (state.user.following > 0) state.user.following -= 1;
    },
    follow(state, action) {
      const newUser = action.payload; // {id, name, avatar}
      const exists = state.user.followingUsers.some(u => u.id === newUser.id);
      if (!exists) {
        state.user.followingUsers.unshift(newUser);
        state.user.following += 1;
      }
    },
  },
});

export const {
  setBio,
  setBannerImage,
  setProfileImage,
  setUserField,
  unfollow,
  follow,
} = profileSlice.actions;

export default profileSlice.reducer;
