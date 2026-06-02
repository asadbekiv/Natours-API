import type { Review } from '@natours/shared';
import { api } from './client';

export async function fetchMyReviews(): Promise<Review[]> {
  const res = await api.get<{ data: Review[] }>('/reviews/my-reviews');
  return res.data.data;
}

/** Shared TanStack Query key so the cache is the same across screens. */
export const myReviewsKey = ['my-reviews'] as const;

/** Turn a list of my-reviews into a Set of tour-ids you've already reviewed. */
export function reviewedTourIdSet(reviews: Review[] | undefined): Set<string> {
  const set = new Set<string>();
  for (const r of reviews ?? []) {
    if (typeof r.tour === 'string') {
      set.add(r.tour);
    } else if (r.tour && typeof r.tour === 'object') {
      const t = r.tour as Record<string, unknown>;
      const id = (t.id as string | undefined) ?? (t._id as string | undefined);
      if (id) set.add(id);
    }
  }
  return set;
}
