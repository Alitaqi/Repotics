// api/reportApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const reportApi = createApi({
  reducerPath: "reportApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include", // send cookies
  }),
  endpoints: (builder) => ({
    createReport: builder.mutation({
      query: (formData) => ({
        url: "/posts",
        method: "POST",
        body: formData, // must be FormData
      }),
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
    }),
     // New endpoints for post operations
    updatePost: builder.mutation({
      query: ({ postId, description }) => ({
        url: `/posts/${postId}`,
        method: "PUT",
        body: { description },
      }),
      invalidatesTags: ['Post'],
    }),

    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Post'],
    }),

    upvotePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/upvote`,
        method: "POST",
      }),
      invalidatesTags: ['Post'],
    }),

    getPostById: builder.query({
      query: (postId) => `/posts/${postId}`,
    }),

    downvotePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/downvote`,
        method: "POST",
      }),
      invalidatesTags: ['Post'],
    }),
     // Comment endpoints
    addComment: builder.mutation({
      query: ({ postId, text }) => ({
        url: `/posts/${postId}/comments`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ['Post'],
    }),

    addReply: builder.mutation({
      query: ({ postId, commentId, text }) => ({
        url: `/posts/${postId}/comments/${commentId}/replies`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ['Post'],
    }),

    voteComment: builder.mutation({
      query: ({ postId, commentId, type }) => ({
        url: `/posts/${postId}/comments/${commentId}/vote`,
        method: "POST",
        body: { type },
      }),
      invalidatesTags: ['Post'],
    }),

    voteReply: builder.mutation({
      query: ({ postId, commentId, replyId, type }) => ({
        url: `/posts/${postId}/comments/${commentId}/replies/${replyId}/vote`,
        method: "POST",
        body: { type },
      }),
      invalidatesTags: ['Post'],
    }),

    deleteComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Post'],
    }),
    deleteReply: builder.mutation({
      query: ({ postId, commentId, replyId }) => ({
        url: `/posts/${postId}/comments/${commentId}/replies/${replyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Post'],
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
  useGetPostByIdQuery, } = reportApi;
