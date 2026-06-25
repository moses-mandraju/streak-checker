# Streak Checker

A modern React + Vite habit streak tracker with Google Authentication, Firebase Firestore, Tailwind CSS, shadcn-style components, Zustand state, React Router, date-fns, Lucide icons, and React Hot Toast.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and add your Firebase web app values.
   - Add `VITE_FIREBASE_VAPID_KEY` from Firebase Cloud Messaging settings for browser push.

3. Enable Google sign-in in Firebase Authentication.

4. Run the app:

```bash
npm run dev
```

## Firebase Data Shape

```text
users
  userId
    habits
      habitId
        title
        emoji
        currentStreak
        longestStreak
        createdDate
        lastCompletedDate
        completionHistory
```

## Checks

```bash
npm run lint
npm run build
```
