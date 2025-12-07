const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5002";
async function request(path, init) {
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
    return data;
}
export const api = {
    signin(email, password) {
        return request("/signin", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
    },
    signup(username, email, password) {
        return request("/signup", {
            method: "POST",
            body: JSON.stringify({ username, email, password })
        });
    },
    uploadImage(base64) {
        return request("/upload-image", {
            method: "POST",
            body: JSON.stringify({ base64_jpg: base64 })
        });
    },
    detectRecipes(url) {
        return request("/recipes-list", {
            method: "POST",
            body: JSON.stringify({ url })
        });
    },
    generateRecipeSteps(recipe) {
        return request("/recipes-content", {
            method: "POST",
            body: JSON.stringify({ recipe })
        });
    },
    saveRecipe(payload) {
        return request("/save-recipe", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },
    giveReview(recipe_id, review) {
        return request("/give-review", {
            method: "POST",
            body: JSON.stringify({ recipe_id, review })
        });
    }
};
export async function fileToBase64(file) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < uint8Array.length; i += 1) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}
