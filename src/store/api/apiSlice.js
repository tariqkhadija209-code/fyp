import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../components/constant';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // Add authentication headers here if needed
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.access_token) {
        headers.set('authorization', `Bearer ${user.access_token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Attendance', 'Complaint', 'Fee', 'Room', 'Menu', 'Notification'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/profile',
      providesTags: ['User'],
    }),
  }),
});

export const { useGetProfileQuery } = apiSlice;

export default apiSlice;
