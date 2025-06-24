import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Mock data - should match the web backoffice data
let mockClients = [
  {
    id: 1,
    name: 'Youssef El Amrani',
    email: 'youssef.elamrani@example.com',
    phone: '+212612345678',
    points: 250,
    totalVisits: 12,
    dateCreated: '2024-01-15',
  },
  {
    id: 2,
    name: 'Fatima Zahra Benali',
    email: 'fatima.benali@example.com',
    phone: '+212623456789',
    points: 180,
    totalVisits: 8,
    dateCreated: '2024-02-20',
  },
  {
    id: 3,
    name: 'Omar Bouzid',
    email: 'omar.bouzid@example.com',
    phone: '+212634567890',
    points: 320,
    totalVisits: 15,
    dateCreated: '2024-01-10',
  },
];

export const clientsApi = createApi({
  reducerPath: 'clientsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
  }),
  tagTypes: ['Client', 'ClientsList'],
  endpoints: (builder) => ({
    getClientById: builder.query({
      queryFn: (id) => {
        const client = mockClients.find(c => c.id === parseInt(id));
        return client ? { data: client } : { error: 'Client not found' };
      },
      providesTags: (result, error, id) => [
        { type: 'Client', id },
        { type: 'ClientsList' }
      ],
    }),
    addPointsToClient: builder.mutation({
      queryFn: ({ id, points }) => {
        // Find the client index
        const idx = mockClients.findIndex(c => c.id === parseInt(id));
        if (idx !== -1) {
          // Clone the client object to avoid mutating frozen data
          const client = { ...mockClients[idx] };
          const oldPoints = client.points;
          client.points += points;
          client.totalVisits += 1;
          // Replace the client in the array with the updated one
          mockClients[idx] = client;
          return { 
            data: { 
              ...client, 
              pointsAdded: points,
              oldPoints 
            } 
          };
        }
        return { error: 'Client not found' };
      },
      // Invalidate both the single client and the clients list
      invalidatesTags: (result, error, { id }) => [
        { type: 'Client', id },
        { type: 'ClientsList' }
      ],
      // Update cache for getClients and getClientById
      async onQueryStarted({ id, points }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update getClients cache
          dispatch(
            clientsApi.util.updateQueryData('getClients', undefined, (draft) => {
              const client = draft.find(c => c.id === parseInt(id));
              if (client) {
                client.points = data.points;
                client.totalVisits = data.totalVisits;
              }
            })
          );
          // Update getClientById cache
          dispatch(
            clientsApi.util.updateQueryData('getClientById', id, (draft) => {
              if (draft) {
                draft.points = data.points;
                draft.totalVisits = data.totalVisits;
              }
            })
          );
        } catch {}
      },
    }),
    // Mock NFC/QR scan - returns random client
    scanClient: builder.mutation({
      queryFn: () => {
        const randomClient = mockClients[Math.floor(Math.random() * mockClients.length)];
        return { data: randomClient };
      },
    }),
    getClients: builder.query({
      queryFn: () => {
        return { data: mockClients };
      },
      providesTags: [{ type: 'ClientsList' }],
    }),
  }),
});

export const {
  useGetClientByIdQuery,
  useAddPointsToClientMutation,
  useScanClientMutation,
  useGetClientsQuery,
} = clientsApi;