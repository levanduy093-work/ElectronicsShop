# ElectronicsShop Mobile App

React Native app for the ElectronicsShop ecosystem. Includes storefront, AI chat, cart/checkout, orders, and profile.

## Tech Stack
- React Native 0.83
- React Navigation
- TanStack Query
- Firebase Auth (Google)
- Socket.IO client
- NativeWind

## Requirements
- Node.js >= 20
- Android Studio / Xcode
- Watchman (macOS)
- CocoaPods (iOS)

## Environment
Create `.env` in this folder:

```env
API_BASE_URL=https://your-backend-host
API_DEVICE_HOST=http://10.0.2.2:3000
APP_LINK_DOMAIN=electronicsshop.app
APP_LINK_SCHEME=electronicsshop
```

Notes:
- `API_DEVICE_HOST` is used for Android emulator.
- If you run backend locally, set `API_BASE_URL` to your LAN IP for real devices.

## Install
```bash
npm install
```

## Run
```bash
# Android
npm run android

# iOS
npm run ios
```

## Key Scripts
- `npm run android`
- `npm run ios`
- `npm run lint`
- `npm run test`

## Project Structure (High Level)
- `src/screens` main screens
- `src/components` UI components
- `src/navigation` navigation setup (custom tab bar)
- `src/context` app + AI chat state providers
- `src/services` API + sockets
- `src/utils` helpers (cache, file download, mappers)
- `src/theme` theming

## Features
- Home, catalog, product detail
- Cart + checkout
- Orders + order detail
- Profile + settings
- AI Chat (text + image)
- Wishlist
- Push notifications

## Notes
- Android file download uses `DownloadManager` + native module.
- AI Chat history is persisted locally and synced when logged in.

## Troubleshooting
- Metro 500 error after native changes: rebuild Android app.
- Android emulator network: use `10.0.2.2` for localhost.

## Architecture & Data Flow
See platform overview:
- `/Users/levanduy/Nam4/HK2/Mobile/ElectroAI/README.md`

