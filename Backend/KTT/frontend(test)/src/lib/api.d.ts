import type { AuthPayload, RecipeContentResponse, RecipeListResponse, RecipeSummary, SaveRecipePayload, UploadResponse } from "./types";
export declare const api: {
    signin(email: string, password: string): Promise<AuthPayload>;
    signup(username: string, email: string, password: string): Promise<AuthPayload>;
    uploadImage(base64: string): Promise<UploadResponse>;
    detectRecipes(url: string): Promise<RecipeListResponse>;
    generateRecipeSteps(recipe: RecipeSummary): Promise<RecipeContentResponse>;
    saveRecipe(payload: SaveRecipePayload): Promise<{
        message: string;
    }>;
    giveReview(recipe_id: string, review: number): Promise<{
        message: string;
    }>;
};
export declare function fileToBase64(file: File): Promise<string>;
export type { RecipeSummary, RecipeStep } from "./types";
