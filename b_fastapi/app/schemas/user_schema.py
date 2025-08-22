from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str 

class UserLogin(BaseModel):
    email: EmailStr 
    password: str 


class UserTarget(BaseModel):
    id: str = Field(..., alias="$id")
    created_at: str = Field(..., alias="$createdAt")
    updated_at: str = Field(..., alias="$updatedAt")
    name: Optional[str]
    user_id: str = Field(..., alias="userId")
    provider_id: Optional[str] = Field(..., alias="providerId")
    provider_type: str = Field(..., alias="providerType")
    identifier: str
    expired: bool

class AppwriteUser(BaseModel):
    id: str = Field(..., alias="$id")
    created_at: str = Field(..., alias="$createdAt")
    updated_at: str = Field(..., alias="$updatedAt")
    name: str
    registration: str
    status: bool
    labels: List[str]
    password_update: str = Field(..., alias="passwordUpdate")
    email: str
    phone: str
    email_verification: bool = Field(..., alias="emailVerification")
    phone_verification: bool = Field(..., alias="phoneVerification")
    mfa: bool
    prefs: dict
    targets: List[UserTarget]
    accessed_at: str = Field(..., alias="accessedAt")

class UserResponse(BaseModel):
    msg: str
    user: AppwriteUser

class SessionData(BaseModel):
    id: str = Field(..., alias="$id")
    created_at: str = Field(..., alias="$createdAt")
    updated_at: str = Field(..., alias="$updatedAt")
    user_id: str = Field(..., alias="userId")
    expire: str
    provider: str
    provider_uid: str = Field(..., alias="providerUid")
    provider_access_token: Optional[str] = Field(..., alias="providerAccessToken")
    provider_access_token_expiry: Optional[str] = Field(..., alias="providerAccessTokenExpiry")
    provider_refresh_token: Optional[str] = Field(..., alias="providerRefreshToken")
    ip: str
    os_code: Optional[str] = Field(..., alias="osCode")
    os_name: Optional[str] = Field(..., alias="osName")
    os_version: Optional[str] = Field(..., alias="osVersion")
    client_type: Optional[str] = Field(..., alias="clientType")
    client_code: Optional[str] = Field(..., alias="clientCode")
    client_name: Optional[str] = Field(..., alias="clientName")
    client_version: Optional[str] = Field(..., alias="clientVersion")
    client_engine: Optional[str] = Field(..., alias="clientEngine")
    client_engine_version: Optional[str] = Field(..., alias="clientEngineVersion")
    device_name: Optional[str] = Field(..., alias="deviceName")
    device_brand: Optional[str] = Field(..., alias="deviceBrand")
    device_model: Optional[str] = Field(..., alias="deviceModel")
    country_code: Optional[str] = Field(..., alias="countryCode")
    country_name: Optional[str] = Field(..., alias="countryName")
    current: bool
    factors: List[str]
    secret: str
    mfa_updated_at: Optional[str] = Field(..., alias="mfaUpdatedAt")


class LoginResponse(BaseModel):
    msg: str
    session: SessionData
