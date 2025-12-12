import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/missing-persons`;

export const missingPersonsApi = createApi({
  reducerPath: 'missingPersonsApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    prepareHeaders: (headers) => {
      // Cookies will be sent automatically with credentials: 'include'
      // Note: Don't set Content-Type for FormData - browser will set it automatically with boundary
      return headers;
    },
  }),
  tagTypes: ['MissingPerson'],
  endpoints: (builder) => ({
    getMissingPersons: builder.query({
      query: () => '/', 
      providesTags: ['MissingPerson'],
      transformResponse: (response) => response.data,
    }),
    
    // Get single missing person by ID
    getMissingPersonById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'MissingPerson', id }],
      transformResponse: (response) => response.data, 
    }),
    
    // Create new missing person report
    createMissingPerson: builder.mutation({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
        // ✅ FormData will be sent as-is, browser handles Content-Type
      }),
      invalidatesTags: ['MissingPerson'],
    }),
    
    // Update missing person (if needed)
    updateMissingPerson: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'MissingPerson', id }],
    }),
    
    // Delete missing person (if needed)
    deleteMissingPerson: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MissingPerson'],
    }),
    
    // ==================== COMMENTS & REPLIES ====================
    
    // Add comment to missing person
    addComment: builder.mutation({
      query: ({ id, text }) => ({
        url: `/${id}/comments`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'MissingPerson', id }],
    }),
    
    // Add reply to comment
    addReply: builder.mutation({
      query: ({ id, commentId, text }) => ({
        url: `/${id}/comments/${commentId}/replies`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'MissingPerson', id }],
    }),
    
    // Vote on comment
    voteComment: builder.mutation({
      query: ({ id, commentId, type }) => ({
        url: `/${id}/comments/${commentId}/vote`,
        method: 'POST',
        body: { type },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'MissingPerson', id }],
    }),
    
    // Vote on reply
    voteReply: builder.mutation({
      query: ({ id, commentId, replyId, type }) => ({
        url: `/${id}/comments/${commentId}/replies/${replyId}/vote`,
        method: 'POST',
        body: { type },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'MissingPerson', id }],
    }),
    
    // Delete comment
    deleteComment: builder.mutation({
      query: ({ id, commentId }) => ({
        url: `/${id}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'MissingPerson', id }],
    }),
    
    // Delete reply
    deleteReply: builder.mutation({
      query: ({ id, commentId, replyId }) => ({
        url: `/${id}/comments/${commentId}/replies/${replyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'MissingPerson', id }],
    }),
    
    // ==================== VOTING ====================
    
    // Upvote missing person
    upvoteMissingPerson: builder.mutation({
      query: (id) => ({
        url: `/${id}/upvote`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'MissingPerson', id }],
    }),
    
    // Downvote missing person
    downvoteMissingPerson: builder.mutation({
      query: (id) => ({
        url: `/${id}/downvote`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'MissingPerson', id }],
    }),
  }),
});

export const {
  useGetMissingPersonsQuery,
  useGetMissingPersonByIdQuery,
  useCreateMissingPersonMutation,
  useUpdateMissingPersonMutation,
  useDeleteMissingPersonMutation,
  useAddCommentMutation,
  useAddReplyMutation,
  useVoteCommentMutation,
  useVoteReplyMutation,
  useDeleteCommentMutation,
  useDeleteReplyMutation,
  useUpvoteMissingPersonMutation,
  useDownvoteMissingPersonMutation,
} = missingPersonsApi;