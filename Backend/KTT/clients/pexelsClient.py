import requests
import os
from dotenv import load_dotenv
load_dotenv()


API_KEY = os.getenv("PEXELS_API_KEY")
url = "https://api.pexels.com/v1/search"

headers = {
    "Authorization": API_KEY
}

def fetch_image_from_pexels(query="nature", index=0):
    params = {
        "query": query,
        "per_page": 1
    }
    response = requests.get(url, headers=headers, params=params)

    # Raise if something went wild (network issues, invalid key, etc.)
    response.raise_for_status()
    data = response.json()
    return data['photos'][index]['src']['original']




