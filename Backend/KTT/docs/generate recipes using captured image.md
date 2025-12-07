# Generate Recipes Using Captured Image

## Endpoint
`POST /recipes-list`

## Request Body
```json
{
  "url": "https://example.com/my-food-photo.jpg"
}
```
- `url` must be a non-empty string. HTTPS URLs are downloaded; anything else is treated as a local path (an optional `file://` prefix is stripped).

## Processing Flow
1. `detect_objects(url)` runs OWLv2 object detection with default food labels (`burger`, `pizza`, `salad`, etc.) and returns the unique matches.
2. If no ingredients are detected, the API responds immediately with empty `ingredients` and `recipes` arrays.
3. Otherwise `generate_recipe_list(ingredients)` asks the LLM for five recipes, enriches each with a Pexels image (when the LLM supplies a `keyword`), and removes that `keyword` before returning the list.

## Success Response (200)
```json
{
  "ingredients": ["pizza", "salad"],
  "recipes": [
    {
      "title": "Grilled Veggie Pizza",
      "ingredients": ["pizza dough", "bell pepper", "mozzarella"],
      "image_url": "https://images.pexels.com/..."
    },
    {
      "title": "Garden Salad",
      "ingredients": ["lettuce", "tomato", "vinaigrette"],
      "image_url": "https://images.pexels.com/..."
    }
  ]
}
```

## Failure Modes
- Missing/blank `url` → HTTP 400 with a descriptive `error`.
- Detection errors (download issues, model failures) → HTTP 500 with `{"error": "Failed to detect ingredients", "details": "..."}`.
- Recipe generation/image fetch failures → HTTP 502 with `{"error": "Failed to generate recipes"}`.
