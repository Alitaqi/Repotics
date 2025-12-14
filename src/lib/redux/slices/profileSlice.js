import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // will hold {name, username, email, bio, ...}
  images: {
    bannerImage: null,
    profileImage: null,
  },
    isOwner: false,// idk gpt somewaht recomeneded this
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile(state, action) {
      state.user = action.payload;

      // sync images
      state.images.profileImage = action.payload.profilePicture || null;
      state.images.bannerImage = action.payload.bannerPicture || null;

      state.isOwner = action.payload.isOwner || false;
    },
    setBio(state, action) {
      if (state.user) state.user.bio = action.payload;
    },
    setBannerImage(state, action) {
      state.images.bannerImage = action.payload;
      if (state.user) {
        state.user.bannerPicture = action.payload;
      }
    },
    setProfileImage(state, action) {
      state.images.profileImage = action.payload;
      if (state.user) {
        state.user.profilePicture = action.payload;
      }
    },
    // Explicit replacement after Cloudinary deletion + new upload
    replaceBannerImage(state, action) {
      if (state.user) {
        state.user.bannerPicture = action.payload;
      }
      state.images.bannerImage = action.payload;
    },
    replaceProfileImage(state, action) {
      if (state.user) {
        state.user.profilePicture = action.payload;
      }
      state.images.profileImage = action.payload;
    },
    setUserField(state, action) {
      const { key, value } = action.payload;
      if (state.user && key in state.user) {
        state.user[key] = value;
      }
    },
    unfollow(state, action) {
      if (!state.user) return;
      const id = action.payload;
      state.user.following = state.user.following.filter((u) => u._id !== id);
      if (state.user.followingCount > 0) state.user.followingCount -= 1;
    },
    follow(state, action) {
      if (!state.user) return;
      const newUser = action.payload; // {_id, username, profilePicture}
      const exists = state.user.following.some((u) => u._id === newUser._id);
      if (!exists) {
        state.user.following.unshift(newUser);
        state.user.followingCount += 1;
      }
    },
    // ADD THESE NEW ACTIONS:
    setFollowStatus(state, action) {
      if (state.user) {
        state.user.isFollowing = action.payload;
      }
    },
    incrementFollowerCount(state) {
      if (state.user) {
        state.user.followersCount += 1;
      }
    },

    decrementFollowerCount(state) {
      if (state.user && state.user.followersCount > 0) {
        state.user.followersCount -= 1;
      }
    },
    updateFollower(state, action) {
      // For adding/removing specific follower objects if needed
      const { follower, action: operation } = action.payload;
      if (state.user && state.user.followers) {
        if (operation === 'add') {
          state.user.followers.push(follower);
        } else if (operation === 'remove') {
          state.user.followers = state.user.followers.filter(f => f._id !== follower._id);
        }
      }
    },
    updateFollowerFollowStatus (state, action) {
      const { followerId, isFollowing } = action.payload;
      const follower = state.user.followers.find(f => f._id === followerId);
      if (follower) follower.isFollowing = isFollowing;
    },
  },
});

export const {
  setProfile,
  setBio,
  setBannerImage,
  setProfileImage,
  replaceBannerImage,   // ✅ new
  replaceProfileImage,  // ✅ new
  setUserField,
  unfollow,
  follow,
  setFollowStatus,
  incrementFollowerCount,
  decrementFollowerCount,
  updateFollower,
  updateFollowerFollowStatus,
} = profileSlice.actions;

export default profileSlice.reducer;