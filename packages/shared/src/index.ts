/**
 * Shared types and API contracts for the Natours platform.
 *
 * Consumed by the API today and, after the NestJS migration, by the mobile
 * app — so the request/response shapes stay in sync across the monorepo.
 */

// ---------------------------------------------------------------------------
// API response envelope (matches the standardized server contract)
// ---------------------------------------------------------------------------

export type ResponseStatus = 'success' | 'fail' | 'error';

/** Success envelope. `results` is present only on collection endpoints. */
export interface SuccessResponse<T> {
  status: 'success';
  results?: number;
  data: T;
}

export interface ErrorResponse {
  status: 'fail' | 'error';
  message: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ---------------------------------------------------------------------------
// Domain models
// ---------------------------------------------------------------------------

export type TourDifficulty = 'easy' | 'medium' | 'difficult';

export type UserRole = 'user' | 'guide' | 'lead-guide' | 'admin';

/** GeoJSON point. Coordinates are [longitude, latitude]. */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  description?: string;
}

export interface TourLocation extends GeoPoint {
  day?: number;
}

export interface Tour {
  id: string;
  name: string;
  slug?: string;
  duration: number;
  maxGroupSize: number;
  difficulty: TourDifficulty;
  price: number;
  priceDiscount?: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  summary: string;
  description?: string;
  imageCover: string;
  images: string[];
  startDates: string[];
  startLocation?: GeoPoint;
  locations?: TourLocation[];
  guides?: Array<string | User>;
  secretTour?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  role: UserRole;
  active?: boolean;
}

export interface Review {
  id: string;
  review: string;
  rating: number;
  tour: string | Tour;
  user: string | User;
  createdAt: string;
}

export interface Booking {
  id: string;
  tour: string | Tour;
  user: string | User;
  price: number;
  paid: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Auth payloads
// ---------------------------------------------------------------------------

export interface AuthResponse {
  status: 'success';
  token: string;
  data: { user: User };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}
