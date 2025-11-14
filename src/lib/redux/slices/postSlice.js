// src/store/postSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    votePost: (state, action) => {
      const { postId, type, prevVote } = action.payload;
      const post = state.posts.find((p) => p.id === postId);
      if (!post) return;

      // remove old vote
      if (prevVote === "upvote") post.upvotes--;
      if (prevVote === "downvote") post.downvotes--;

      // apply new vote
      if (type === "upvote") post.upvotes++;
      if (type === "downvote") post.downvotes++;
    },
    addComment: (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.posts.find((p) => p.id === postId);
      if (!post) return;
      post.comments.push({
        id: Date.now(),
        ...comment,
      });
    },
  },
});

export const { setPosts, votePost, addComment } = postSlice.actions;
export default postSlice.reducer;