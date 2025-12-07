# Generate Steps To Cook Recipe

## Endpoint
`POST /recipes-content`

## Request Body
Pass a recipe object produced by `/recipes-list`:
```json
{
  "recipe": {
    "title": "Grilled Veggie Pizza",
    "ingredients": ["pizza dough", "bell pepper", "mozzarella"],
    "image_url": "https://images.pexels.com/..."
  }
}
```
- `recipe` must be a JSON object containing at least `title` and `ingredients`. `image_url` is optional but forwarded to the LLM prompt context.

## Processing Flow
1. `generate_recipe_content(recipe)` prompts the LLM for structured steps using the recipe title and ingredients.
2. The helper expects an array of step objects (each with `step_number` and `instruction`) and wraps them with the original metadata.
3. The Flask route returns only the `steps` array from that helper output to keep the payload compact.

## Success Response (200)
```json
{
  "steps": [
    {"step_number": 1, "instruction": "Preheat the oven to 220°C."},
    {"step_number": 2, "instruction": "Stretch the dough and layer toppings."}
  ]
}
```

## Failure Modes
- Missing or malformed `recipe` object → HTTP 400 with `{"error": "Request body must include a 'recipe' object."}`.
- LLM/processing failures → HTTP 502 with `{"error": "Failed to generate recipe content", "details": "..."}`.
