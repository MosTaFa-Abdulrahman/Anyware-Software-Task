import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../requestMethod";

export const announcementSlice = createApi({
  reducerPath: "announcement",
  baseQuery: axiosBaseQuery({ baseUrl: "announcement" }),
  tagTypes: ["announcement"],
  endpoints: (builder) => ({
    createAnnouncement: builder.mutation({
      query: (announcementData) => ({
        url: "/create",
        method: "POST",
        data: announcementData,
      }),
      invalidatesTags: ["announcement"],
    }),
    getAllAnnouncements: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10 } = params;
        const queryParams = new URLSearchParams();

        if (page) queryParams.append("page", page.toString());
        if (limit) queryParams.append("limit", limit.toString());

        return {
          url: `/get/all?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["announcement"],
    }),
    getAnnouncementById: builder.query({
      query: (id) => ({
        url: `/get/${id}`,
        method: "GET",
      }),
      providesTags: ["announcement"],
    }),
    updateAnnouncement: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["announcement"],
    }),
    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["announcement"],
    }),
    getMyAnnouncements: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10 } = params;
        const queryParams = new URLSearchParams();

        if (page) queryParams.append("page", page.toString());
        if (limit) queryParams.append("limit", limit.toString());

        return {
          url: `/user/my-announcements?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["announcement"],
    }),
  }),
});

export const {
  useCreateAnnouncementMutation,
  useGetAllAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetMyAnnouncementsQuery,
} = announcementSlice;
