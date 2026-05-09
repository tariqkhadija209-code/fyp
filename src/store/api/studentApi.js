import { apiSlice } from './apiSlice';

export const studentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudentFees: builder.query({
      query: (studentId) => `/student/fees/${studentId}`,
      providesTags: ['Fee'],
    }),
    getFeeStatus: builder.query({
      query: (studentId) => `/student/fee-status/${studentId}`,
      providesTags: ['Fee'],
    }),
    getFeeHistory: builder.query({
      query: (studentId) => `/student/fee-history/${studentId}`,
      providesTags: ['Fee'],
    }),
    getAttendanceStatus: builder.query({
      query: (studentId) => `/student/attendance-status/${studentId}`,
      providesTags: ['Attendance'],
    }),
    addComplaint: builder.mutation({
      query: (complaintData) => {
        const formData = new FormData();
        Object.keys(complaintData).forEach((key) => formData.append(key, complaintData[key]));
        return {
          url: '/student/add-complaint',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Complaint'],
    }),
    markAttendance: builder.mutation({
      query: (attendanceData) => {
        const formData = new FormData();
        Object.keys(attendanceData).forEach((key) => formData.append(key, attendanceData[key]));
        return {
          url: '/student/mark-attendance',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Attendance'],
    }),
    getRoomDetails: builder.query({
      query: (studentId) => `/student/room-details/${studentId}`,
      providesTags: ['Room'],
    }),
    suggestRoom: builder.query({
      query: (department) => `/student/suggest-room/${department}`,
    }),
    getNotifications: builder.query({
      query: () => '/student/notifications',
      providesTags: ['Notification'],
    }),
    createCheckoutSession: builder.mutation({
      query: (paymentData) => ({
        url: '/student/create-checkout-session',
        method: 'POST',
        body: paymentData,
      }),
    }),
  }),
});

export const {
  useGetStudentFeesQuery,
  useGetFeeStatusQuery,
  useGetFeeHistoryQuery,
  useGetAttendanceStatusQuery,
  useAddComplaintMutation,
  useMarkAttendanceMutation,
  useGetRoomDetailsQuery,
  useLazyGetRoomDetailsQuery,
  useSuggestRoomQuery,
  useGetNotificationsQuery,
  useCreateCheckoutSessionMutation,
} = studentApi;
