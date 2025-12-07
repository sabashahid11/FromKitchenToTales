import type {
  AuthPayload,
  RecipeContentResponse,
  RecipeListResponse,
  RecipeSummary,
  RecipeStep,
  SaveRecipePayload,
  UploadResponse
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5002";

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init.headers
    },
    ...init
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = data?.error ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  signin(email: string, password: string) {
    return request<AuthPayload>("/signin", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  signup(username: string, email: string, password: string) {
    return request<AuthPayload>("/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password })
    });
  },
  uploadImage(base64: string) {
    return request<UploadResponse>("/upload-image", {
      method: "POST",
      body: JSON.stringify({ base64_jpg: base64 })
    });
  },
  detectRecipes(url: string) {
    return request<RecipeListResponse>("/recipes-list", {
      method: "POST",
      body: JSON.stringify({ url })
    });
  },
  generateRecipeSteps(recipe: RecipeSummary) {
    return request<RecipeContentResponse>("/recipes-content", {
      method: "POST",
      body: JSON.stringify({ recipe })
    });
  },
  saveRecipe(payload: SaveRecipePayload) {
    return request<{ message: string }>("/save-recipe", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  giveReview(recipe_id: string, review: number) {
    return request<{ message: string }>("/give-review", {
      method: "POST",
      body: JSON.stringify({ recipe_id, review })
    });
  }
};

export async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i += 1) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

export type { RecipeSummary, RecipeStep } from "./types";
