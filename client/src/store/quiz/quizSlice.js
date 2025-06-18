import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../requestMethod";

export const quizSlice = createApi({
  reducerPath: "quiz",
  baseQuery: axiosBaseQuery({ baseUrl: "quiz" }),
  tagTypes: ["quiz", "userQuizzes", "quizStats"],
  endpoints: (builder) => ({
    createQuiz: builder.mutation({
      query: (quizData) => ({
        url: "/create",
        method: "POST",
        data: quizData,
      }),
      invalidatesTags: ["quiz", "userQuizzes"],
    }),
    getAllQuizzes: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10 } = params;
        const queryParams = new URLSearchParams();

        if (page) queryParams.append("page", page.toString());
        if (limit) queryParams.append("limit", limit.toString());

        return {
          url: `/get/all/quizzes?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["quiz"],
    }),
    getQuizById: builder.query({
      query: (id) => ({
        url: `/get/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "quiz", id }],
    }),
    getQuizzesByUserId: builder.query({
      query: ({ userId, page = 1, limit = 10 }) => ({
        url: `/get/user/${userId}?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: (result, error, { userId }) => [
        { type: "userQuizzes", id: userId },
      ],
    }),
    updateQuiz: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "quiz",
        "userQuizzes",
        { type: "quiz", id },
      ],
    }),
    deleteQuiz: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        "quiz",
        "userQuizzes",
        { type: "quiz", id },
      ],
    }),
    submitQuiz: builder.mutation({
      query: ({ quizId, answers }) => ({
        url: "/submit",
        method: "POST",
        data: { quizId, answers },
      }),
      invalidatesTags: ["userQuizzes"],
    }),
  }),
});

export const {
  useCreateQuizMutation,
  useGetAllQuizzesQuery,
  useGetQuizByIdQuery,
  useGetQuizzesByUserIdQuery,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useSubmitQuizMutation,
} = quizSlice;
