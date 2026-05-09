import { apiSlice } from './apiSlice';

export const wardenApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWardenStats: builder.query({
      query: () => '/warden/stats',
    }),
    getWardenAttendance: builder.query({
      query: () => '/warden/attendance',
      providesTags: ['Attendance'],
    }),
    getMenu: builder.query({
      query: () => '/warden/menu',
      providesTags: ['Menu'],
    }),
    sendNotification: builder.mutation({
      query: (notificationData) => {
        const formData = new FormData();
        Object.keys(notificationData).forEach((key) => formData.append(key, notificationData[key]));
        return {
          url: '/warden/send-notification',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Notification'],
    }),
    updateMess: builder.mutation({
      query: (messData) => {
        const formData = new FormData();
        Object.keys(messData).forEach((key) => formData.append(key, messData[key]));
        return {
          url: '/warden/update-mess',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Menu'],
    }),
  }),
});

export const {
  useGetWardenStatsQuery,
  useGetWardenAttendanceQuery,
  useGetMenuQuery,
  useSendNotificationMutation,
  useUpdateMessMutation,
} = wardenApi;
