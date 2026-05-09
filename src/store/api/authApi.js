import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    signup: builder.mutation({
      query: (userData) => {
        const formData = new FormData();
        Object.keys(userData).forEach((key) => {
          formData.append(key, userData[key]);
        });
        return {
          url: '/signup',
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation } = authApi;
