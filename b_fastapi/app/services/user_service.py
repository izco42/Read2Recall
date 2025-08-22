import os
import httpx

BASE_URL = os.getenv("AUTH_URL")

async def login_user(email: str, password: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/auth/log-in",
            json={"email": email, "password": password}
        )
        response.raise_for_status()  # lanza error si status != 200
        return response.json()


async def signup_user(email: str, password: str, name: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/auth/sign-up",
            json={"email": email, "password": password, "name": name}
        )
        response.raise_for_status()
        return response.json()

