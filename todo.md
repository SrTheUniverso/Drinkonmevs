# DrinkOnMe - Project TODO

## Phase 1: Setup & Design
- [x] Initialize Expo project with TypeScript
- [x] Create design.md with mobile UI specifications
- [x] Generate custom app logo and update app.config.ts
- [x] Configure theme colors in constants/theme.ts

## Phase 2: Authentication & Navigation
- [x] Implement login screen with email/password form
- [x] Implement signup screen with form validation
- [x] Set up JWT token storage in AsyncStorage
- [x] Create auth context/hook for state management
- [x] Configure tab navigation (Home, Profile)
- [x] Add logout functionality (in profile screen)

## Phase 3: Home Screen (Lista de Bares)
- [x] Create bar list screen with FlatList
- [x] Implement API call to GET /bares
- [x] Design bar card component with image, name, address
- [x] Add pull-to-refresh functionality
- [x] Implement navigation to bar details on card tap
- [x] Add loading and error states

## Phase 4: Bar Details Screen
- [x] Create bar details screen with full bar information
- [x] Implement API call to GET /bares/:id
- [x] Display drinks available at the bar
- [x] Implement "Resgatar Drink" button
- [x] Add POST request to /resgatar/:barId
- [x] Handle resgate validation (7-day cooldown)
- [x] Show success/error feedback with haptic feedback
- [x] Display next available resgate date if unavailable

## Phase 5: Profile Screen (Histórico)
- [x] Create profile screen with user info
- [x] Display user statistics (total resgates, last resgate date)
- [x] Implement API call to GET /resgates/me
- [x] Create resgate history list with FlatList
- [x] Add pull-to-refresh for history
- [x] Show empty state when no resgates
- [x] Add logout button

## Phase 6: Polish & Testing
- [x] Test all user flows end-to-end
- [x] Verify dark mode support across all screens
- [x] Test API error handling and edge cases
- [x] Optimize performance (memoization, lazy loading)
- [x] Add loading spinners and skeleton screens
- [x] Test on iOS and Android simulators
- [x] Verify safe area handling on notched devices

## Phase 7: Final Deployment
- [x] Create final checkpoint
- [x] Prepare for publishing to app stores


## Phase 8: Map Integration (Google Maps/Mapbox)
- [x] Install map dependencies (react-native-maps or expo-maps)
- [x] Configure location permissions (iOS/Android)
- [x] Implement GPS location tracking
- [x] Create map screen with bar markers
- [x] Calculate distance from user location to bars
- [x] Add map to bar details screen
- [x] Style map markers with custom icons
- [x] Test map functionality on iOS and Android


## Phase 9: Favorites Feature
- [x] Create useFavorites hook for managing favorites
- [x] Implement AsyncStorage for local favorites persistence
- [x] Create Favorites screen (new tab)
- [x] Add favorite button to Home screen
- [x] Add favorite button to Bar Details screen
- [x] Show favorite indicator on bar cards
- [x] Implement favorite/unfavorite toggle
- [x] Test favorites functionality


## Phase 10: Push Notifications System
- [x] Install notification dependencies (expo-notifications)
- [x] Create useNotifications hook for managing permissions
- [x] Implement local notification service
- [x] Create Notification Settings screen
- [x] Add notification preferences to user settings
- [x] Integrate notifications with favorite bars
- [x] Send notifications when new drinks are available
- [x] Handle notification taps and deep linking
- [x] Test notifications on iOS and Android

