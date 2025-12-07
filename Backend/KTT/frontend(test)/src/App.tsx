import { FormEvent, useMemo, useState } from "react";
import { AuthSection } from "./components/AuthSection";
import { ImageUploadSection } from "./components/ImageUploadSection";
import { SectionCard } from "./components/SectionCard";
import { useAsync } from "./hooks/useAsync";
import { api } from "./lib/api";
import { extractEmail, extractUserId } from "./lib/auth";
import type { AuthPayload, RecipeStep, RecipeSummary } from "./lib/types";

export default function App() {
  const [authPayload, setAuthPayload] = useState<AuthPayload | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [stepsMap, setStepsMap] = useState<Record<string, RecipeStep[]>>({});
  const [activeRecipe, setActiveRecipe] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const detectMutation = useAsync(api.detectRecipes);
  const stepsMutation = useAsync(api.generateRecipeSteps);
  const saveMutation = useAsync(api.saveRecipe);

  const authData = (authPayload?.auth as Record<string, unknown>) ?? null;
  const currentUserId = useMemo(() => extractUserId(authData), [authData]);
  const currentEmail = useMemo(() => extractEmail(authData), [authData]);

  const handleDetectRecipes = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = imageUrlInput.trim();
    if (!url) return;
    setStatusMessage("");
    try {
      const response = await detectMutation.execute(url);
      setIngredients(response.ingredients);
      setRecipes(response.recipes);
      setStepsMap({});
      if (!response.recipes.length) {
        setStatusMessage("No recipes were generated for this image.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateSteps = async (recipe: RecipeSummary) => {
    setActiveRecipe(recipe.title);
    try {
      const result = await stepsMutation.execute(recipe);
      if (result?.steps) {
        setStepsMap((prev) => ({ ...prev, [recipe.title]: result.steps }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActiveRecipe(null);
    }
  };

  const handleSaveRecipe = async (recipe: RecipeSummary) => {
    if (!currentUserId) {
      setStatusMessage("Sign in to save recipes.");
      return;
    }
    setPendingSave(recipe.title);
    try {
      await saveMutation.execute({
        user_id: currentUserId,
        recipe_data: {
          title: recipe.title,
          ingredients: recipe.ingredients,
          image_url: recipe.image_url,
          steps: stepsMap[recipe.title] ?? []
        }
      });
      setStatusMessage(`Saved ${recipe.title} to your cookbook.`);
    } catch (error) {
      console.error(error);
    } finally {
      setPendingSave(null);
    }
  };

  const uploadedHint = uploadedImageUrl ? `Last upload: ${uploadedImageUrl}` : "";

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">AI kitchen assistant</p>
          <h1>Turn pantry photos into dinner plans</h1>
          <p className="lede">
            Authenticate, upload pantry shots, detect what you have, and generate smart cooking
            steps backed by your Supabase-powered API.
          </p>
        </div>
        <div className="header-status">
          <span className="dot" />
          Backend base URL: {import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5002"}
        </div>
      </header>

      <div className="grid">
        <AuthSection
          onAuth={setAuthPayload}
          onSignOut={() => setAuthPayload(null)}
          currentUserId={currentUserId}
          currentEmail={currentEmail}
        />

        <ImageUploadSection
          onUploaded={(url) => {
            setUploadedImageUrl(url);
            setImageUrlInput(url);
          }}
        />

        <SectionCard
          title="Generate recipes"
          description="Detect ingredients from any accessible image URL and let the LLM craft dishes."
          footer={uploadedHint ? <span className="muted-text">{uploadedHint}</span> : null}
        >
          <form className="form" onSubmit={handleDetectRecipes}>
            <label className="form-field">
              <span>Image URL</span>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrlInput}
                onChange={(event) => setImageUrlInput(event.target.value)}
                required
                disabled={detectMutation.loading}
              />
            </label>
            {detectMutation.error ? <p className="error-text">{detectMutation.error}</p> : null}
            <button className="primary" type="submit" disabled={detectMutation.loading}>
              {detectMutation.loading ? "Detecting..." : "Detect ingredients"}
            </button>
          </form>

          {statusMessage ? <p className="status-text">{statusMessage}</p> : null}

          {ingredients.length ? (
            <div className="pill-group">
              {ingredients.map((item) => (
                <span key={item} className="pill">
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          {recipes.length ? (
            <div className="recipes-grid">
              {recipes.map((recipe) => {
                const steps = stepsMap[recipe.title] ?? [];
                const isGenerating = activeRecipe === recipe.title && stepsMutation.loading;
                const isSaving = pendingSave === recipe.title && saveMutation.loading;
                const canSave = Boolean(currentUserId && steps.length);
                return (
                  <article className="recipe-card" key={recipe.title}>
                    {recipe.image_url ? (
                      <img src={recipe.image_url} alt={recipe.title} className="recipe-card__image" loading="lazy" />
                    ) : null}
                    <h3>{recipe.title}</h3>
                    <p className="muted-text">{recipe.ingredients.join(", ")}</p>
                    <div className="recipe-actions">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => handleGenerateSteps(recipe)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? "Generating..." : steps.length ? "Refresh steps" : "Generate steps"}
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => handleSaveRecipe(recipe)}
                        disabled={!canSave || isSaving}
                        title={canSave ? "Save to Supabase" : "Generate steps and sign in to save"}
                      >
                        {isSaving ? "Saving..." : "Save recipe"}
                      </button>
                    </div>
                    {stepsMutation.error && activeRecipe === recipe.title ? (
                      <p className="error-text">{stepsMutation.error}</p>
                    ) : null}
                    {saveMutation.error && pendingSave === recipe.title ? (
                      <p className="error-text">{saveMutation.error}</p>
                    ) : null}
                    {steps.length ? (
                      <ol className="steps-list">
                        {steps.map((step) => (
                          <li key={step.step_number}>
                            <strong>Step {step.step_number}.</strong> {step.instruction}
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}
        </SectionCard>
      </div>
    </div>
  );
}
