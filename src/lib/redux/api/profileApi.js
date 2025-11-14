// store/api/profileApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl,
    credentials: "include",
   }), 
  tagTypes: ['Profile'], // Add this for cache invalidation
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: (username) => `/users/profile/${username}`,
      providesTags: (result, error, username) => 
        result ? [{ type: 'Profile', id: username }] : [],
    }),
    // NEW ENDPOINTS:
    checkFollowStatus: builder.query({
      query: (username) => `/users/profile/${username}/follow-status`,
      providesTags: (result, error, username) => 
        result ? [{ type: 'Profile', id: `${username}-follow` }] : [],
    }),
    followUser: builder.mutation({
      query: (username) => ({
        url: `/users/profile/${username}/follow`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, username) => [
        { type: 'Profile', id: username },
        { type: 'Profile', id: `${username}-follow` }
      ],
    }),
    unfollowUser: builder.mutation({
      query: (username) => ({
        url: `/users/profile/${username}/unfollow`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, username) => [
        { type: 'Profile', id: username },
        { type: 'Profile', id: `${username}-follow` }
      ],
    }),
    unfollowOtherUser: builder.mutation({
      query: (username) => ({
        url: `/users/unfollow-user/${username}`,
        method: 'POST',
      }),
      // eslint-disable-next-line no-unused-vars
      invalidatesTags: (result, error, username) => [
        { type: 'Profile', id: 'me' } 
      ],
    }),
   // 🔹 NEW: Update Profile Picture
    updateProfilePicture: builder.mutation({
      query: (formData) => ({
        url: `/users/profile/update-profile-picture`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Profile' }],
    }),

    // 🔹 NEW: Update Banner Picture
    updateBannerPicture: builder.mutation({
      query: (formData) => ({
        url: `/users/profile/update-banner-picture`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Profile' }],
    }),

    // 🔹 NEW: Update Bio
    updateBio: builder.mutation({
      query: (bio) => ({
        url: `/users/profile/update-bio`,
        method: 'PUT',
        body: { bio }, // 
      }),
      invalidatesTags: [{ type: 'Profile' }],
    }),
    updateName: builder.mutation({
      query: (name) => ({
        url: "/users/profile/update-name",
        method: "PUT",
        body: { name },
      }),
    }),
    updateLocation: builder.mutation({
      query: ({location, coordinates}) => ({
        url: "/users/profile/update-location",
        method: "PUT",
        body: { location, coordinates },
      }),
    }),
    updatePassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: "/users/profile/update-password",
        method: "PUT",
        body: { currentPassword, newPassword },
      }),
    }),
  }),
});

export const { 
  useGetProfileQuery, 
  useCheckFollowStatusQuery, 
  useFollowUserMutation, 
  useUnfollowUserMutation,
  useUnfollowOtherUserMutation,
  useUpdateProfilePictureMutation,
  useUpdateBannerPictureMutation,
  useUpdateBioMutation,
  useUpdateNameMutation,
  useUpdateLocationMutation,
  useUpdatePasswordMutation
} = profileApi;