import type { Booking } from '@natours/shared';
import { api } from './client';

export async function fetchMyBookings(): Promise<Booking[]> {
  const res = await api.get<{ data: Booking[] }>('/bookings/my-tours');
  return res.data.data;
}

/** Shared TanStack Query key so the cache is the same across screens. */
export const myBookingsKey = ['my-bookings'] as const;
