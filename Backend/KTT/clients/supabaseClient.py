from supabase import create_client
import os
from dotenv import load_dotenv
load_dotenv()

url: str = os.getenv("SUPABASE_URL") # type: ignore
key: str = os.getenv("SUPABASE_KEY") # type: ignore
supabase = create_client(url, key)