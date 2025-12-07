import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from clients.supabaseClient import supabase
from functions.database import insertUserInfo, fetchUserInfo

def signin(email: str, password: str):
    auth_response = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    user_info = fetchUserInfo(auth_response.user.id)  # type: ignore
    return {"user_info": user_info, "auth_response": auth_response}

def signup(username: str, email: str, password: str):
    auth_response = supabase.auth.sign_up({
        "email": email,
        "password": password
    })
    user_id = auth_response.user.id # type: ignore
    insertUserInfo(user_id, username, email)
    return auth_response
