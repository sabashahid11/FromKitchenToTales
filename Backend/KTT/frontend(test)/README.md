# Object Detection Frontend

A functional React + Vite UI that talks to the Flask backend to authenticate, upload pantry photos, detect ingredients, and generate/save recipes.

## Prerequisites
- Node.js 18+
- Backend server running locally (default `http://localhost:5002`)

## Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment
Create `.env` (or `.env.local`) to override the API base URL if your backend listens elsewhere:
```
VITE_API_BASE_URL=https://api.example.com
```

## Features
- Email/password sign-in and sign-up flows backed by Supabase Auth
- File uploader that converts images to Base64 and stores them in Supabase Storage
- Recipe discovery form that calls `/recipes-list` and renders detected ingredients
- Step generation per recipe via `/recipes-content`
- Optional recipe saving to `/save-recipe` when authenticated

## Notes
- Saving requires a Supabase user; the UI extracts the `user.id` returned by the auth routes.
- The UI focuses on clarity and real-world flows rather than heavy styling. Adjust the CSS in `src/styles.css` as needed.
