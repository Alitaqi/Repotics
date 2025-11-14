// api/feedApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["Heatmap"],
  endpoints: () => ({}),
});

export const heatmapApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHeatmapData: builder.query({
      query: ({ city, type, startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (city) params.append("city", city);
        if (type) params.append("type", type);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        return `crimes/heatmap?${params.toString()}`;
      },
      providesTags: ["Heatmap"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetHeatmapDataQuery } = heatmapApi;
