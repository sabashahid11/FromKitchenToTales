import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from clients.supabaseClient import supabase

def insertUserInfo(user_id: str, username: str, email: str):
    data = {"id": user_id, "username": username, "email": email}
    # Use upsert to handle cases where user already exists
    response = supabase.table('users_info').upsert(data, on_conflict='id').execute()
    return response

def fetchUserInfo(user_id: str):
    response = supabase.table('users_info').select('*').eq('id', user_id).execute()
    return response

def update_user(user_id: str, updates: dict):
    response = supabase.table('users_info').update(updates).eq('id', user_id).execute()
    return response

def save_recipe(user_id: str, recipe_data: dict):
    data = {"user_id": user_id, "title": recipe_data.get("title"),
            "ingredients": recipe_data.get("ingredients"),
            "image_url": recipe_data.get("image_url"),
            "steps": recipe_data.get("steps")}
    response = supabase.table('user_recipes').insert(data).execute()
    return response

def fetch_user_recipes(user_id: str):
    response = supabase.table('user_recipes').select('*').eq('user_id', user_id).execute()
    return response

def give_review(recipe_id: str, reviews: int):
    data = {"reviews": reviews}
    response = supabase.table('user_recipes').update(data).eq('id', recipe_id).execute()
    return response


# Scan History functions
def save_scan_history(user_id: str, ingredients: list, recipes_count: int):
    data = {
        "user_id": user_id,
        "ingredients": ingredients,
        "recipes_count": recipes_count
    }
    response = supabase.table('scan_history').insert(data).execute()
    return response

def fetch_scan_history(user_id: str):
    response = supabase.table('scan_history').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
    return response

def delete_scan_history_item(history_id: str, user_id: str):
    response = supabase.table('scan_history').delete().eq('id', history_id).eq('user_id', user_id).execute()
    return response

def clear_scan_history(user_id: str):
    response = supabase.table('scan_history').delete().eq('user_id', user_id).execute()
    return response


# Diet Preferences functions
def save_diet_preferences(user_id: str, diet_preferences: list):
    response = supabase.table('users_info').update({
        'diet_preferences': diet_preferences
    }).eq('id', user_id).execute()
    return response

def fetch_diet_preferences(user_id: str):
    response = supabase.table('users_info').select('diet_preferences').eq('id', user_id).execute()
    if response.data and len(response.data) > 0:
        return response.data[0].get('diet_preferences', [])
    return []

