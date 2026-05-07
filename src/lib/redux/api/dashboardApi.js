import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/dashboard`;

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getCrimeReportsByMonth: builder.query({
      query: () => "/crime-reports-by-month",
    }),
    getCrimeByTimeOfDay: builder.query({
      query: () => "/crime-by-time-of-day",
    }),
    getTopCrimeTypesLast30Days: builder.query({
      query: () => "/top-crime-types",
    }),
    getMissingPersonsByAgeGroup: builder.query({
      query: () => "/missing-by-age",
    }),
    getMissingPersonsByGenderTrend: builder.query({
      query: () => "/missing-by-gender-trend",
    }),
    getMissingPersonsByStatus: builder.query({
      query: () => "/missing-by-status",
    }),
    getTopCrimeCities: builder.query({
      query: () => "/top-crime-cities",
    }),
    getDashboardKPIs: builder.query({
      query: () => "/kpis",
    }),
    getCrimeReports: builder.query({
      query: ({ search = "", status = "", crimeType = "", date = "", page = 1, limit = 10 } = {}) => ({
        url: "/crime-reports",
        params: { search, status, crimeType, date, page, limit },
      }),
    }),
    getPostById: builder.query({
      query: (id) => `/post/${id}`,
    }),
    updatePostStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/posts/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
    }),
    getCrimeStats: builder.query({
      query: () => "/stats",
    }),
    getMissingPersons: builder.query({
      query: ({ search = "", status = "", gender = "", date = "", page = 1, limit = 10 } = {}) => ({
        url: "/missing-persons",
        params: { search, status, gender, date, page, limit },
      }),
      providesTags: ["MissingPersons"],
    }),
    updateMissingPersonStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/missing-persons/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["MissingPersons"],
    }),
    getMissingPersonById: builder.query({
      query: (id) => `/missing-persons/${id}`,
    }),
    getMissingPersonStats: builder.query({
      query: () => "/missing-persons/stats",
    }),
  }),
});

export const { useGetCrimeReportsByMonthQuery, useGetCrimeByTimeOfDayQuery, useGetTopCrimeTypesLast30DaysQuery, useGetMissingPersonsByAgeGroupQuery, useGetMissingPersonsByGenderTrendQuery, useGetMissingPersonsByStatusQuery,
useGetTopCrimeCitiesQuery, useGetDashboardKPIsQuery, useGetCrimeReportsQuery, useGetPostByIdQuery, useUpdatePostStatusMutation, useGetCrimeStatsQuery, useGetMissingPersonsQuery, useUpdateMissingPersonStatusMutation, useGetMissingPersonByIdQuery, useGetMissingPersonStatsQuery, 
} = dashboardApi;