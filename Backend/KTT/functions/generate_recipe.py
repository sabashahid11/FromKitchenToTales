import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import json
from clients.ollamaClient import llm
from clients.pexelsClient import fetch_image_from_pexels


def _extract_json_payload(raw_text: str):
    raw_text = raw_text.lstrip()
    bracket_index = raw_text.find('[')
    brace_index = raw_text.find('{')
    start_positions = [idx for idx in (bracket_index, brace_index) if idx != -1]
    if not start_positions:
        raise ValueError("No JSON payload found in LLM response.")
    start = min(start_positions)
    decoder = json.JSONDecoder()
    payload, _ = decoder.raw_decode(raw_text[start:])
    return payload


def generate_recipe_list(ingredients, diet_preferences=None):
    list_item_schema = {
        "title": "string",
        "ingredients": "list[string]",
        "keyword": "string"
    }

    # Build diet restriction string
    diet_restriction = ""
    if diet_preferences and len(diet_preferences) > 0:
        diet_restriction = f" All recipes MUST be {', '.join(diet_preferences)}. Do NOT include any recipes that violate these dietary restrictions."

    system_prompt = (
        "You are a world-class chef and recipe creator. "
        "Generate creative and diverse recipes based on the provided ingredients."
        f"{diet_restriction}"
    )
    example_response = [
        {
            "title": "Spaghetti Aglio e Olio",
            "ingredients": [
                "spaghetti",
                "garlic",
                "olive oil",
                "red pepper flakes",
                "parsley"
            ],
            "keyword": "spaghetti aglio e olio"
        },
        {
            "title": "Caprese Salad",
            "ingredients": [
                "tomatoes",
                "mozzarella cheese",
                "basil leaves",
                "olive oil",
                "balsamic vinegar"
            ],
            "keyword": "caprese salad"
        }
    ]

    diet_note = ""
    if diet_preferences and len(diet_preferences) > 0:
        diet_note = f" IMPORTANT: Only generate recipes that are strictly {', '.join(diet_preferences)}."

    prompt = f"Generate list of 5 recipe using the following ingredients: {', '.join(ingredients)} in JSON format with fields 'title', 'ingredients', and 'keyword' , following this schema: {list_item_schema}.{diet_note} Respond with only the JSON object."
    
    list_string = llm.invoke([
        ("system", system_prompt),
        ("human", "Generate 5 creative recipes using the ingredients provided."),
        ("assistant", json.dumps(example_response, indent=2)),
        ("human", prompt)
    ])
    response_text = getattr(list_string, "content", str(list_string))
    try:
        recipe_list = _extract_json_payload(response_text)
    except (ValueError, json.JSONDecodeError) as exc:
        print("Error decoding JSON:", exc)
        return None

    if not isinstance(recipe_list, list):
        print("LLM did not return a JSON array of recipes.")
        return None
    
    recipe_list_with_images = []

    for recipe in recipe_list:
        keyword = recipe.get("keyword", "")
        if keyword:
            image_url = fetch_image_from_pexels(query=keyword)
            recipe["image_url"] = image_url
        else:
            recipe["image_url"] = None
        # remove keyword from the final output
        recipe.pop("keyword", None)
        recipe_list_with_images.append(recipe)

    return recipe_list_with_images

def generate_recipe_content(recipe):
    step_schema = {
        "step_number": "integer",
        "instruction": "string"
    }
    content_schema = {
        "title": "string",
        "ingredients": "list[string]",
        "image_url": "string",
        "steps": "list[step_schema]"
    }
    prompt = f"Generate detailed cooking steps for the recipe titled '{recipe['title']}' with ingredients: {', '.join(recipe['ingredients'])} in JSON format following this schema: {step_schema}. Respond with only the JSON array of steps."
    steps_string = llm.invoke(prompt)
    response_text = getattr(steps_string, "content", str(steps_string))
    try:
        steps_list = _extract_json_payload(response_text)
    except (ValueError, json.JSONDecodeError) as exc:
        print("Error decoding JSON for steps:", exc)
        return None

    if not isinstance(steps_list, list):
        print("LLM did not return a JSON array of steps.")
        return None

    detailed_recipe = {
        "title": recipe["title"],
        "ingredients": recipe["ingredients"],
        "image_url": recipe.get("image_url"),
        "steps": steps_list
    }
    return detailed_recipe

__all__ = ["generate_recipe_list", "generate_recipe_content"]