// api/reportApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const reportApi = createApi({
  reducerPath: "reportApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include", // send cookies
  }),
  tagTypes: ['Posts', 'Post'], 
  endpoints: (builder) => ({
    createReport: builder.mutation({
      query: (formData) => ({
        url: "/posts",
        method: "POST",
        body: formData, // must be FormData
      }),
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),
    
    // New: location search
    searchLocations: builder.query({
      query: (search) => `/location/search?q=${encodeURIComponent(search)}`,
    }),

    // New: reverse geocode
    reverseGeocode: builder.query({
      query: ({ lat, lon }) => `/location/reverse?lat=${lat}&lon=${lon}`,
    }),

    getUserPosts: builder.query({
      query: (username) => `/posts/user/${username}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Post', id: _id })),
              { type: 'Posts', id: 'LIST' },
            ]
          : [{ type: 'Posts', id: 'LIST' }],
    }),
    
    // New endpoints for post operations
    updatePost: builder.mutation({
      query: ({ postId, description }) => ({
        url: `/posts/${postId}`,
        method: "PUT",
        body: { description },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
      ],
    }),

    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
        { type: 'Posts', id: 'LIST' },
      ],
    }),

    upvotePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/upvote`,
        method: "POST",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
      ],
      // Optional: optimistic update for instant feedback
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        // You can add optimistic updates here if needed
        try {
          await queryFulfilled;
        } catch {}
      },
    }),

    getPostById: builder.query({
      query: (postId) => `/posts/${postId}`,
      providesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),

    downvotePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/downvote`,
        method: "POST",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
      ],
    }),
    
    // Comment endpoints
    addComment: builder.mutation({
      query: ({ postId, text }) => ({
        url: `/posts/${postId}/comments`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
      ],
    }),

    addReply: builder.mutation({
      query: ({ postId, commentId, text }) => ({
        url: `/posts/${postId}/comments/${commentId}/replies`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
      ],
    }),

    voteComment: builder.mutation({
      query: ({ postId, commentId, type }) => ({
        url: `/posts/${postId}/comments/${commentId}/vote`,
        method: "POST",
        body: { type },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
      ],
    }),

    voteReply: builder.mutation({
      query: ({ postId, commentId, replyId, type }) => ({
        url: `/posts/${postId}/comments/${commentId}/replies/${replyId}/vote`,
        method: "POST",
        body: { type },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
      ],
    }),

    deleteComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
      ],
    }),
    
    deleteReply: builder.mutation({
      query: ({ postId, commentId, replyId }) => ({
        url: `/posts/${postId}/comments/${commentId}/replies/${replyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
      ],
    }),
    
    finalizeReport: builder.mutation({
      query: ({ postId, description }) => ({
        url: `/posts/${postId}/finalize`,
        method: "POST",
        body: { description },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
      ],
    }),
  }),
});

export const {   
  useCreateReportMutation, 
  useSearchLocationsQuery, 
  useLazySearchLocationsQuery,
  useReverseGeocodeQuery,
  useLazyReverseGeocodeQuery,
  useGetUserPostsQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
  useUpvotePostMutation,
  useDownvotePostMutation,
  useAddCommentMutation,
  useAddReplyMutation,
  useVoteCommentMutation,
  useVoteReplyMutation,
  useDeleteCommentMutation,
  useDeleteReplyMutation,
  useGetPostByIdQuery,
  useFinalizeReportMutation,
} = reportApi;