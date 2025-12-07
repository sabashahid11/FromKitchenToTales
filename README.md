# 🍳 From Kitchen to Tables (KTT)

An AI-powered recipe companion app that uses image recognition to detect food ingredients and generates intelligent recipe suggestions based on what you have available.

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Prerequisites](#-prerequisites)
5. [Quick Start](#-quick-start)
6. [Running the Project](#-running-the-project)
7. [Environment Variables](#-environment-variables)
8. [API Endpoints](#-api-endpoints)
9. [File Explanations](#-file-explanations)
10. [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- 📸 **Ingredient Detection**: Take a photo and AI detects food ingredients using OWL-ViT v2 model
- 🍽️ **Smart Recipe Generation**: LLM generates recipes based on detected ingredients
- 🥗 **Diet Preferences**: Support for Vegetarian, Vegan, Halal, Kosher, Gluten-Free, Dairy-Free
- 📖 **Step-by-Step Instructions**: Detailed cooking instructions for each recipe
- ⭐ **Recipe Reviews**: Rate and save your favorite recipes
- 📜 **Scan History**: Track your previous ingredient scans
- 🔐 **User Authentication**: Secure signup/signin with Supabase

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.11+ | Programming Language |
| Flask | Web Framework |
| Transformers | ML Model Loading |
| OWL-ViT v2 | Object Detection Model |
| LangChain + Ollama | LLM Integration |
| Supabase | Database & Auth |
| Pexels API | Recipe Images |

---

## 📁 Project Structure

```
Bobby/
├── Frontend/                 # React Frontend Application
│   ├── src/
│   │   ├── api/              # API client and endpoints
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React context (Auth)
│   │   ├── navigation/       # App navigation/routing
│   │   ├── screens/          # App screens/pages
│   │   └── constants/        # App constants
│   ├── .env                  # Environment variables
│   └── package.json          # Dependencies
│
├── Backend/KTT/              # Python Backend Application
│   ├── clients/              # External service clients
│   │   ├── ollamaClient.py   # LLM API client
│   │   ├── pexelsClient.py   # Image API client
│   │   └── supabaseClient.py # Database client
│   ├── functions/            # Core business logic
│   │   ├── authentication.py # User auth functions
│   │   ├── database.py       # Database operations
│   │   ├── detect_object.py  # AI ingredient detection
│   │   ├── generate_recipe.py# Recipe generation
│   │   └── storage.py        # File storage
│   ├── main.py               # Flask app entry point
│   ├── .env                  # Environment variables
│   └── pyproject.toml        # Python dependencies
│
├── ngrok.exe                 # Tunnel for public access
└── README.md                 # This file
```

---

## 📋 Prerequisites

Before running the project, ensure you have:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Python** (v3.11 or higher) - [Download](https://python.org/)
3. **uv** (Python package manager) - Install with:
   ```powershell
   pip install uv
   ```
4. **Git** - [Download](https://git-scm.com/)

---

## 🚀 Quick Start

### Step 1: Clone the Repository
```powershell
git clone https://github.com/sundesh-hub/ktt-backend.git
cd Bobby
```

### Step 2: Install Frontend Dependencies
```powershell
cd Frontend
npm install
```

### Step 3: Install Backend Dependencies
```powershell
cd ../Backend/KTT
uv sync
```

### Step 4: Start the Application
See [Running the Project](#-running-the-project) section below.

---

## 🏃 Running the Project

### 🌐 Frontend - ALREADY LIVE!

The frontend is **already deployed** and live at:

### ✅ https://from-kitchen-to-tables.netlify.app

**You don't need to do anything for the frontend - it's ready to use!**

---

### 🖥️ Backend - Run Locally + Ngrok

The backend needs to run on your computer. Follow these steps:

**Step 1: Open Terminal and Start Backend**
```powershell
cd Backend/KTT
uv run python main.py
```
Wait until you see: `Running on http://127.0.0.1:5002`

**Step 2: Open Another Terminal and Start Ngrok**
```powershell
.\ngrok.exe http 5002
```
You'll see a public URL like: `https://xxx.ngrok-free.app`

**Step 3: Update Frontend to Use Your Ngrok URL**

Since the frontend is on Netlify, you need to update it with your ngrok URL:
```powershell
cd Frontend
# Edit .env file - change VITE_API_BASE_URL to your ngrok URL
npm run build
netlify deploy --prod --dir=dist
```

**Step 4: Open the App**

Go to: **https://from-kitchen-to-tables.netlify.app** on any device!

---

### 💻 Alternative: Run Everything Locally (For Laptop Demo)

If you just want to demo on your laptop without internet:

**Terminal 1:**
```powershell
cd Backend/KTT
uv run python main.py
```

**Terminal 2:**
```powershell
cd Frontend
npm run dev
```

**Open:** http://localhost:5173

---

## 🔐 Environment Variables

### Backend (.env) - `Backend/KTT/.env`
```env
SUPABASE_URL=https://fbloldddommizdnsjpmu.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PEXELS_API_KEY=DMynuXJTy9IZTIbBFmLbJYQGwVaFsLMShmYVPcizlr1eM9qUQgtqM2lX
OLLAMA_API_KEY=ea35dfb0eb444037aa729ed2b41bc43e...
```

### Frontend (.env) - `Frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:5002
```
For public access, change to your ngrok URL:
```env
VITE_API_BASE_URL=https://your-ngrok-url.ngrok-free.app
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/signin` | Login user |
| POST | `/detect-objects` | Detect ingredients from image |
| POST | `/generate-recipe-list` | Generate recipes from ingredients |
| POST | `/generate-recipe-content` | Get detailed recipe steps |
| POST | `/save-recipe` | Save recipe to user's collection |
| POST | `/give-review` | Rate a recipe |
| POST | `/fetch-user-recipes` | Get user's saved recipes |
| POST | `/update-user` | Update user profile |
| POST | `/save-scan-history` | Save scan to history |
| POST | `/fetch-scan-history` | Get scan history |
| POST | `/delete-scan-history-item` | Delete single history item |
| POST | `/clear-scan-history` | Clear all history |
| POST | `/save-diet-preferences` | Save diet preferences |
| POST | `/fetch-diet-preferences` | Get diet preferences |

---

## 📄 File Explanations

### Backend Files

#### `main.py` - Flask Application Entry Point
- Creates Flask app with CORS enabled
- Defines all API routes/endpoints
- Handles HTTP requests and responses
- Runs on port 5002

#### `clients/supabaseClient.py` - Database Client
- Connects to Supabase (PostgreSQL database)
- Handles authentication tokens
- Manages database connections

#### `clients/ollamaClient.py` - LLM Client
- Connects to Ollama cloud API
- Sends prompts to AI model
- Receives generated recipe text

#### `clients/pexelsClient.py` - Image API Client
- Fetches recipe images from Pexels
- Returns high-quality food photos

#### `functions/authentication.py` - User Auth
- `signup()` - Creates new user account
- `signin()` - Authenticates existing user
- Returns JWT tokens for session management

#### `functions/database.py` - Database Operations
- `save_recipe()` - Saves recipe to database
- `give_review()` - Stores user ratings
- `fetch_user_recipes()` - Gets saved recipes
- `update_user()` - Updates user profile
- `save_scan_history()` - Logs ingredient scans
- `fetch_scan_history()` - Retrieves scan history
- `save_diet_preferences()` - Stores diet settings
- `fetch_diet_preferences()` - Gets diet settings

#### `functions/detect_object.py` - AI Ingredient Detection
- Uses **OWL-ViT v2** model (google/owlv2-base-patch16)
- Processes uploaded images
- Detects 170+ food ingredients
- Returns list of detected items with confidence scores

#### `functions/generate_recipe.py` - Recipe Generation
- `generate_recipe_list()` - Creates recipe suggestions from ingredients
- `generate_recipe_content()` - Generates detailed cooking steps
- Respects diet preferences (Halal, Vegan, etc.)
- Uses LLM for intelligent recipe creation

#### `functions/storage.py` - File Storage
- Uploads images to Supabase storage
- Returns public URLs for stored files

---

### Frontend Files

#### `src/main.tsx` - App Entry Point
- Renders root React component
- Sets up React DOM

#### `src/App.tsx` - Root Component
- Wraps app with AuthProvider
- Sets up navigation

#### `src/api/client.ts` - API Client
- Creates fetch wrapper for API calls
- Handles authentication headers
- Manages API errors

#### `src/api/endpoints.ts` - API Functions
- `authApi` - signin, signup functions
- `ingredientApi` - detect ingredients, generate recipes
- `recipeApi` - save, fetch, review recipes
- `historyApi` - scan history management
- `dietApi` - diet preferences

#### `src/api/types.ts` - TypeScript Types
- Defines all data interfaces
- Request/response types
- User, Recipe, Ingredient types

#### `src/context/AuthContext.tsx` - Authentication State
- Manages user session
- Provides login/logout functions
- Persists auth state in localStorage

#### `src/screens/` - App Screens

| File | Description |
|------|-------------|
| `WelcomeScreen.tsx` | Landing page with app intro |
| `SigninScreen.tsx` | User login form |
| `SignupScreen.tsx` | User registration form |
| `CaptureScreen.tsx` | Camera/upload for ingredient detection |
| `DetectedIngredientsScreen.tsx` | Shows detected ingredients |
| `RecipesListScreen.tsx` | Displays generated recipes |
| `RecipeDetailScreen.tsx` | Full recipe with steps |
| `ProfileScreen.tsx` | User profile & diet preferences |
| `SavedRecipesScreen.tsx` | User's saved recipes |
| `HistoryScreen.tsx` | Scan history |
| `SettingsScreen.tsx` | App settings |

#### `src/components/` - Reusable Components

| File | Description |
|------|-------------|
| `Button.tsx` | Styled button component |
| `Input.tsx` | Form input field |
| `LoadingSpinner.tsx` | Loading animation |
| `RecipeCard.tsx` | Recipe preview card |
| `StarRating.tsx` | 5-star rating component |
| `Toast.tsx` | Notification messages |

## 🔄 How the App Works (Flow)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

1. SIGNUP/SIGNIN
   User creates account → Stored in Supabase → JWT token returned
                                    ↓
2. SET DIET PREFERENCES (Optional)
   User selects: Halal, Vegan, Gluten-Free, etc.
   Saved to database for recipe filtering
                                    ↓
3. CAPTURE/UPLOAD IMAGE
   User takes photo of ingredients
                                    ↓
4. AI DETECTION
   Image → OWL-ViT v2 Model → Detects ingredients
   Example: [tomato, onion, chicken, rice]
                                    ↓
5. RECIPE GENERATION
   Ingredients + Diet Preferences → LLM (Ollama)
   LLM generates 3-5 recipe suggestions
                                    ↓
6. VIEW RECIPES
   User sees recipe cards with images (from Pexels)
   Can click to see full recipe details
                                    ↓
7. COOK & RATE
   User follows step-by-step instructions
   Can save recipe and give star rating
```

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Make sure you're in the right directory
cd Backend/KTT

# Install dependencies
uv sync

# Try running again
uv run python main.py
```

### Frontend won't start
```powershell
# Make sure you're in the right directory
cd Frontend

# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Start again
npm run dev
```

### "Failed to fetch" error
- Make sure backend is running on port 5002
- Check Frontend/.env has correct API URL
- If using ngrok, ensure tunnel is active

### Ngrok URL changed
If ngrok gives a new URL:
1. Update `Frontend/.env` with new URL
2. Rebuild: `npm run build`
3. Redeploy: `netlify deploy --prod --dir=dist`

### Model loading is slow
- First run downloads ~1GB OWL-ViT model
- Subsequent runs are faster (cached)
- Ensure good internet connection

---

## 🌐 Live Demo

### Frontend (Already Live!) ✅
**https://from-kitchen-to-tables.netlify.app**

### Backend
Run these commands to make backend accessible:
```powershell
cd Backend/KTT
uv run python main.py

# In another terminal:
.\ngrok.exe http 5002
```
Then update the frontend with your ngrok URL (see Running the Project section).

---

## 📧 Support

For issues or questions, contact the development team.

---

## 📜 License

This project is for educational purposes.

---

Made with ❤️ by the KTT Development Team
