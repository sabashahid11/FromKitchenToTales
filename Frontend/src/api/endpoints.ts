import { apiClient, ApiError } from './client';
import type {
  User,
  SignupRequest,
  SigninRequest,
  UpdateUserRequest,
  UploadImageRequest,
  UploadImageResponse,
  RecipesListRequest,
  RecipesListResponse,
  RecipeContentRequest,
  RecipeContentResponse,
  RecipeWithSteps,
  SaveRecipeRequest,
  SaveRecipeResponse,
  FetchRecipesRequest,
  Recipe,
  GiveReviewRequest,
  AuthApiResponse,
  AuthUserMetadata,
  SaveDietPreferencesRequest,
  SaveDietPreferencesResponse,
  FetchDietPreferencesRequest,
  FetchDietPreferencesResponse,
} from './types';

const FALLBACK_STEP_MESSAGE = 'Instructions are not available for this recipe yet.';

function normalizeRecipeSteps(
  steps?: RecipeContentResponse['steps']
): string[] {
  if (!Array.isArray(steps) || steps.length === 0) {
    return [FALLBACK_STEP_MESSAGE];
  }

  const cleanedSteps = steps
    .map((step) => {
      if (!step || typeof step.instruction !== 'string') {
        return null;
      }
      return step.instruction.trim();
    })
    .filter((instruction): instruction is string => Boolean(instruction));

  return cleanedSteps.length > 0 ? cleanedSteps : [FALLBACK_STEP_MESSAGE];
}

type ResolvedAuthProfile = {
  id: string;
  email: string;
  username?: string | null;
  user_metadata?: AuthUserMetadata | null;
};

function findAuthProfile(response: AuthApiResponse): ResolvedAuthProfile | null {
  const profileRecord = response.user_info?.data?.find(
    (candidate): candidate is { id: string; email: string; username?: string | null } =>
      Boolean(candidate?.id && candidate?.email)
  );

  if (profileRecord) {
    return {
      id: profileRecord.id,
      email: profileRecord.email,
      username: profileRecord.username,
    };
  }

  // Handle both 'auth_response' and 'auth' keys from the backend
  const authData = response.auth_response || (response as unknown as { auth?: typeof response.auth_response }).auth;

  const authCandidates = [
    authData?.user,
    authData?.session?.user,
  ];

  for (const candidate of authCandidates) {
    if (candidate?.id && candidate.email) {
      return candidate as ResolvedAuthProfile;
    }
  }

  return null;
}

function mapAuthResponseToUser(response: AuthApiResponse): User {
  const profile = findAuthProfile(response);

  // Handle both 'auth_response' and 'auth' keys from the backend
  const authData = response.auth_response || (response as unknown as { auth?: typeof response.auth_response }).auth;
  const token = authData?.session?.access_token;

  if (!profile) {
    throw new ApiError('Invalid authentication response received');
  }

  const metadataUsername = profile.user_metadata?.username ?? undefined;

  return {
    user_id: profile.id,
    username: profile.username ?? metadataUsername ?? profile.email,
    email: profile.email,
    token: token ?? undefined,
  };
}

export const authApi = {
  signup: async (data: SignupRequest) => {
    const response = await apiClient.post<AuthApiResponse>('/signup', data);
    return mapAuthResponseToUser(response);
  },

  signin: async (data: SigninRequest) => {
    const response = await apiClient.post<AuthApiResponse>('/signin', data);
    return mapAuthResponseToUser(response);
  },

  updateUser: (data: UpdateUserRequest) => apiClient.post<User>('/update-user', data),
};

export const imageApi = {
  uploadImage: (data: UploadImageRequest) =>
    apiClient.post<UploadImageResponse>('/upload-image', data),
};

export const recipeApi = {
  getRecipesList: (data: RecipesListRequest) =>
    apiClient.post<RecipesListResponse>('/recipes-list', data),

  getRecipeContent: async (
    data: RecipeContentRequest
  ): Promise<RecipeWithSteps> => {
    const response = await apiClient.post<RecipeContentResponse>(
      '/recipes-content',
      data
    );

    return {
      ...data.recipe,
      steps: normalizeRecipeSteps(response.steps),
    };
  },

  saveRecipe: (data: SaveRecipeRequest) =>
    apiClient.post<SaveRecipeResponse>('/save-recipe', data),

  fetchRecipes: (data: FetchRecipesRequest) =>
    apiClient.post<{ recipes: Recipe[] }>('/fetch-recipes', data),

  giveReview: (data: GiveReviewRequest) =>
    apiClient.post<{ message: string }>('/give-review', data),
};

// History API types
export interface HistoryItem {
  id: string;
  user_id: string;
  ingredients: string[];
  recipes_count: number;
  created_at: string;
}

export interface SaveHistoryRequest {
  user_id: string;
  ingredients: string[];
  recipes_count: number;
}

export interface FetchHistoryRequest {
  user_id: string;
}

export interface DeleteHistoryItemRequest {
  user_id: string;
  history_id: string;
}

export interface ClearHistoryRequest {
  user_id: string;
}

export const historyApi = {
  saveHistory: (data: SaveHistoryRequest) =>
    apiClient.post<{ message: string; response: HistoryItem[] }>('/save-history', data),

  fetchHistory: (data: FetchHistoryRequest) =>
    apiClient.post<{ history: HistoryItem[] }>('/fetch-history', data),

  deleteHistoryItem: (data: DeleteHistoryItemRequest) =>
    apiClient.post<{ message: string }>('/delete-history-item', data),

  clearHistory: (data: ClearHistoryRequest) =>
    apiClient.post<{ message: string }>('/clear-history', data),
};

export const dietApi = {
  saveDietPreferences: (data: SaveDietPreferencesRequest) =>
    apiClient.post<SaveDietPreferencesResponse>('/save-diet-preferences', data),

  fetchDietPreferences: (data: FetchDietPreferencesRequest) =>
    apiClient.post<FetchDietPreferencesResponse>('/fetch-diet-preferences', data),
};
