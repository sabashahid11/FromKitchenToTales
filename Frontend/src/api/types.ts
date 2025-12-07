export interface User {
  user_id: string;
  username: string;
  email: string;
  token?: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthUserMetadata {
  username?: string | null;
  full_name?: string | null;
  [key: string]: unknown;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string | null;
  user_metadata?: AuthUserMetadata | null;
  [key: string]: unknown;
}

export interface AuthApiResponse {
  message?: string;
  auth_response?: {
    session?: {
      access_token?: string;
      token_type?: string;
      refresh_token?: string | null;
      expires_in?: number;
      user?: AuthUser | null;
    };
    user?: AuthUser | null;
  };
  user_info?: {
    data?: Array<{
      id: string;
      email: string;
      username?: string | null;
      created_at?: string;
    }> | null;
  };
}

export interface SigninRequest {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  user_id: string;
  updates: {
    username?: string;
  };
}

export interface UploadImageRequest {
  base64_jpg: string;
}

export interface UploadImageResponse {
  path: string;
  message?: string;
}

export interface Recipe {
  id?: string | number;
  title: string;
  image_url: string;
  ingredients: string[];
}

export interface RecipesListRequest {
  url: string;
  diet_preferences?: string[];
}

// Diet Preferences Types
export type DietPreference = 'Vegetarian' | 'Vegan' | 'Halal' | 'Kosher' | 'Gluten-Free' | 'Dairy-Free';

export interface SaveDietPreferencesRequest {
  user_id: string;
  diet_preferences: string[];
}

export interface SaveDietPreferencesResponse {
  message: string;
  diet_preferences: string[];
}

export interface FetchDietPreferencesRequest {
  user_id: string;
}

export interface FetchDietPreferencesResponse {
  diet_preferences: string[];
}

export interface RecipesListResponse {
  recipes: Recipe[];
  ingredients?: string[];
}

export interface RecipeContentRequest {
  recipe: Recipe;
  user_id: string;
}

export interface RecipeStep {
  instruction: string;
  step_number?: number;
}

export interface RecipeContentResponse {
  steps: RecipeStep[];
}

export interface RecipeWithSteps extends Recipe {
  steps: string[];
}

export interface SaveRecipeRequest {
  user_id: string;
  recipe_data: Recipe;
}

export interface SaveRecipeResponse {
  message?: string;
  recipe_id?: string | number;
  response?: Array<{
    id?: string | number;
    title?: string;
    image_url?: string;
    ingredients?: string[];
    steps?: string[] | null;
    reviews?: number | null;
    created_at?: string;
    user_id?: string;
  }>;
}

export interface FetchRecipesRequest {
  user_id: string;
}

export interface GiveReviewRequest {
  recipe_id: string;
  reviews: number;
  user_id: string;
}
