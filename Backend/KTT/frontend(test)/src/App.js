import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { AuthSection } from "./components/AuthSection";
import { ImageUploadSection } from "./components/ImageUploadSection";
import { SectionCard } from "./components/SectionCard";
import { useAsync } from "./hooks/useAsync";
import { api } from "./lib/api";
import { extractEmail, extractUserId } from "./lib/auth";
export default function App() {
    const [authPayload, setAuthPayload] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState("");
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [ingredients, setIngredients] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [stepsMap, setStepsMap] = useState({});
    const [activeRecipe, setActiveRecipe] = useState(null);
    const [pendingSave, setPendingSave] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");
    const detectMutation = useAsync(api.detectRecipes);
    const stepsMutation = useAsync(api.generateRecipeSteps);
    const saveMutation = useAsync(api.saveRecipe);
    const authData = authPayload?.auth ?? null;
    const currentUserId = useMemo(() => extractUserId(authData), [authData]);
    const currentEmail = useMemo(() => extractEmail(authData), [authData]);
    const handleDetectRecipes = async (event) => {
        event.preventDefault();
        const url = imageUrlInput.trim();
        if (!url)
            return;
        setStatusMessage("");
        try {
            const response = await detectMutation.execute(url);
            setIngredients(response.ingredients);
            setRecipes(response.recipes);
            setStepsMap({});
            if (!response.recipes.length) {
                setStatusMessage("No recipes were generated for this image.");
            }
        }
        catch (error) {
            console.error(error);
        }
    };
    const handleGenerateSteps = async (recipe) => {
        setActiveRecipe(recipe.title);
        try {
            const result = await stepsMutation.execute(recipe);
            if (result?.steps) {
                setStepsMap((prev) => ({ ...prev, [recipe.title]: result.steps }));
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setActiveRecipe(null);
        }
    };
    const handleSaveRecipe = async (recipe) => {
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
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setPendingSave(null);
        }
    };
    const uploadedHint = uploadedImageUrl ? `Last upload: ${uploadedImageUrl}` : "";
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("header", { className: "app-header", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "AI kitchen assistant" }), _jsx("h1", { children: "Turn pantry photos into dinner plans" }), _jsx("p", { className: "lede", children: "Authenticate, upload pantry shots, detect what you have, and generate smart cooking steps backed by your Supabase-powered API." })] }), _jsxs("div", { className: "header-status", children: [_jsx("span", { className: "dot" }), "Backend base URL: ", import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5002"] })] }), _jsxs("div", { className: "grid", children: [_jsx(AuthSection, { onAuth: setAuthPayload, onSignOut: () => setAuthPayload(null), currentUserId: currentUserId, currentEmail: currentEmail }), _jsx(ImageUploadSection, { onUploaded: (url) => {
                            setUploadedImageUrl(url);
                            setImageUrlInput(url);
                        } }), _jsxs(SectionCard, { title: "Generate recipes", description: "Detect ingredients from any accessible image URL and let the LLM craft dishes.", footer: uploadedHint ? _jsx("span", { className: "muted-text", children: uploadedHint }) : null, children: [_jsxs("form", { className: "form", onSubmit: handleDetectRecipes, children: [_jsxs("label", { className: "form-field", children: [_jsx("span", { children: "Image URL" }), _jsx("input", { type: "url", placeholder: "https://...", value: imageUrlInput, onChange: (event) => setImageUrlInput(event.target.value), required: true, disabled: detectMutation.loading })] }), detectMutation.error ? _jsx("p", { className: "error-text", children: detectMutation.error }) : null, _jsx("button", { className: "primary", type: "submit", disabled: detectMutation.loading, children: detectMutation.loading ? "Detecting..." : "Detect ingredients" })] }), statusMessage ? _jsx("p", { className: "status-text", children: statusMessage }) : null, ingredients.length ? (_jsx("div", { className: "pill-group", children: ingredients.map((item) => (_jsx("span", { className: "pill", children: item }, item))) })) : null, recipes.length ? (_jsx("div", { className: "recipes-grid", children: recipes.map((recipe) => {
                                    const steps = stepsMap[recipe.title] ?? [];
                                    const isGenerating = activeRecipe === recipe.title && stepsMutation.loading;
                                    const isSaving = pendingSave === recipe.title && saveMutation.loading;
                                    const canSave = Boolean(currentUserId && steps.length);
                                    return (_jsxs("article", { className: "recipe-card", children: [recipe.image_url ? (_jsx("img", { src: recipe.image_url, alt: recipe.title, className: "recipe-card__image", loading: "lazy" })) : null, _jsx("h3", { children: recipe.title }), _jsx("p", { className: "muted-text", children: recipe.ingredients.join(", ") }), _jsxs("div", { className: "recipe-actions", children: [_jsx("button", { type: "button", className: "secondary", onClick: () => handleGenerateSteps(recipe), disabled: isGenerating, children: isGenerating ? "Generating..." : steps.length ? "Refresh steps" : "Generate steps" }), _jsx("button", { type: "button", className: "ghost", onClick: () => handleSaveRecipe(recipe), disabled: !canSave || isSaving, title: canSave ? "Save to Supabase" : "Generate steps and sign in to save", children: isSaving ? "Saving..." : "Save recipe" })] }), stepsMutation.error && activeRecipe === recipe.title ? (_jsx("p", { className: "error-text", children: stepsMutation.error })) : null, saveMutation.error && pendingSave === recipe.title ? (_jsx("p", { className: "error-text", children: saveMutation.error })) : null, steps.length ? (_jsx("ol", { className: "steps-list", children: steps.map((step) => (_jsxs("li", { children: [_jsxs("strong", { children: ["Step ", step.step_number, "."] }), " ", step.instruction] }, step.step_number))) })) : null] }, recipe.title));
                                }) })) : null] })] })] }));
}
