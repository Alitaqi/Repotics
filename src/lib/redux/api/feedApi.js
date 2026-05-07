// api/feedApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/posts`;

export const feedApi = createApi({
  reducerPath: "feedApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getPersonalizedFeed: builder.query({
      query: ({ cursor, limit = 10 }) =>
        `/feed?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`,
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems) => {
        if (newItems?.feed) {
          currentCache.feed = [...(currentCache.feed || []), ...newItems.feed];
          currentCache.nextCursor = newItems.nextCursor;
          currentCache.hasMore = newItems.hasMore;
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.cursor !== previousArg?.cursor;
      },
    }),
    searchFeed: builder.query({
      query: ({ q, includePosts = true, includeUsers = true, page = 1, limit = 10 }) => ({
        url: "/searchbar/search",
        params: { q, includePosts, includeUsers, page, limit },
      }),
    }),
    //for right sidebar in feed
    getTrendingCrimes: builder.query({
      query: () => "/trending/trending-crimes",
    }),
  }),
});

export const { useGetPersonalizedFeedQuery, useSearchFeedQuery, useGetTrendingCrimesQuery,  } = feedApi;
