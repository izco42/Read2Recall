from fastapi import Header, HTTPException
from appwrite.client import Client
from appwrite.services.account import Account
from dotenv import load_dotenv
from typing import Tuple
import os

load_dotenv()

def get_appwrite_client():
    client = Client()
    client.set_endpoint(os.getenv("APPWRITE_ENDPOINT","http://appwrite/v1"))
    client.set_project(os.getenv("APPWRITE_PROJECT_ID", "project_id")) 
    return client

async def get_authenticated_client(secret: str = Header(...)) -> Tuple[Client, str]:
    client = get_appwrite_client()
    client.set_session(secret)
    try:
        account = Account(client)
        user = account.get()  
        return client, user["$id"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

