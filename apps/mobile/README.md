# @natours/mobile

Natours mobile app (Phase 4): React Native + Expo + TypeScript.

Consumes `@natours/shared` types and the NestJS API in `apps/api-nest` over
the network.

## Status

| Slice | Status |
|---|---|
| Project scaffold (Expo 52, expo-router, Paper, TanStack Query) | ✅ |
| Refresh-token-aware axios client (`expo-secure-store`) | ✅ |
| AuthProvider (signup / login / logout, session rehydrate on boot) | ✅ |
| Login / Signup screens | ✅ |
| Tour list (cursor infinite scroll) | ✅ |
| Tour detail | ✅ |
| Profile (`/me`) with sign-out | ✅ |
| Photo upload (expo-image-picker) | ⬜ |
| Tour detail map (react-native-maps) | ⬜ |
| My bookings + Stripe RN checkout | ⬜ |
| Push notifications (expo-notifications) | ⬜ |
| Sentry + NetInfo + error boundary | ⬜ |
| EAS Build → Play Store | ⬜ |

## Run

From the repo root (workspaces hoist deps):

```bash
npm install
```

Then in `apps/mobile`:

```bash
cp .env.example .env             # set EXPO_PUBLIC_API_URL to your LAN IP
npm run start --workspace=@natours/mobile
```

Scan the QR code with **Expo Go** on your phone. The mobile device cannot
reach `localhost` — it needs your computer's **LAN IP** (e.g.
`http://192.168.1.10:4000/api/v1`).

## Design

Brand colors match the Natours web CSS (`#55c57a` primary). UI components
come from **React Native Paper** (Material 3). Iterate visually on a real
device — paste any errors from Metro and we'll fix.
