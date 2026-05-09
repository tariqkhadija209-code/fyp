import { apiSlice } from './apiSlice';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query({
      query: () => '/admin/stats',
    }),
    getRooms: builder.query({
      query: () => '/admin/rooms',
      providesTags: ['Room'],
    }),
    allocateRoomAI: builder.mutation({
      query: (studentId) => ({
        url: `/admin/allocate-room-ai/${studentId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Room', 'User'],
    }),
    addRoom: builder.mutation({
      query: (roomData) => {
        const formData = new FormData();
        Object.keys(roomData).forEach((key) => formData.append(key, roomData[key]));
        return {
          url: '/admin/add-room',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Room'],
    }),
    getPendingStudents: builder.query({
      query: () => '/admin/pending-students',
      providesTags: ['User'],
    }),
    getAdminComplaints: builder.query({
      query: () => '/admin/complaints',
      providesTags: ['Complaint'],
    }),
    resolveComplaint: builder.mutation({
      query: (complaintId) => ({
        url: `/admin/resolve-complaint/${complaintId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Complaint'],
    }),
    generateFees: builder.mutation({
      query: (feeData) => {
        const formData = new FormData();
        Object.keys(feeData).forEach((key) => formData.append(key, feeData[key]));
        return {
          url: '/admin/generate-fees',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Fee'],
    }),
    getAllFees: builder.query({
      query: () => '/admin/get-all-fees',
      providesTags: ['Fee'],
    }),
    getFeesSummary: builder.query({
      query: () => '/admin/fees-summary',
      providesTags: ['Fee'],
    }),
    approveFee: builder.mutation({
      query: (feeId) => ({
        url: `/admin/approve-fee/${feeId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Fee'],
    }),
    allocateRoomManual: builder.mutation({
      query: ({ studentId, roomId }) => ({
        url: `/admin/allocate-room`,
        method: 'POST',
        params: { student_id: studentId, room_id: roomId },
      }),
      invalidatesTags: ['Room', 'User'],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetRoomsQuery,
  useAllocateRoomAIMutation,
  useAddRoomMutation,
  useGetPendingStudentsQuery,
  useGetAdminComplaintsQuery,
  useResolveComplaintMutation,
  useGenerateFeesMutation,
  useGetAllFeesQuery,
  useGetFeesSummaryQuery,
  useApproveFeeMutation,
  useAllocateRoomManualMutation,
} = adminApi;
