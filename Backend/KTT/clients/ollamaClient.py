from dotenv import load_dotenv
import os
from langchain_ollama import ChatOllama

load_dotenv()
API_KEY = os.getenv("OLLAMA_API_KEY")
MODEL_NAME = "gpt-oss:20b-cloud"

llm = ChatOllama(model=MODEL_NAME, base_url="https://ollama.com", client_kwargs={
    "headers": {
        "Authorization": f"Bearer {API_KEY}"
    }
})