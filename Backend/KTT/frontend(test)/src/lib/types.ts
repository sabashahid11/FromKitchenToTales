export interface AuthPayload {
  message: string;
  auth?: Record<string, unknown> | null;
}

export interface RecipeSummary {
  title: string;
  ingredients: string[];
  image_url?: string | null;
}

export interface RecipeListResponse {
  ingredients: string[];
  recipes: RecipeSummary[];
}

export interface RecipeStep {
  step_number: number;
  instruction: string;
}

export interface RecipeContentResponse {
  steps: RecipeStep[];
}

export interface UploadResponse {
  message: string;
  path: string;
}

export interface SaveRecipePayload {
  user_id: string;
  recipe_data: {
    title: string;
    ingredients: string[];
    image_url?: string | null;
    steps?: RecipeStep[];
  };
}

export interface ReviewPayload {
  recipe_id: string;
  review: number;
}
