from pydantic import BaseModel
from datetime import datetime
from typing import Optional # Import Optional

class DocumentBase(BaseModel):
    filename: str
    category: str
    author: Optional[str] = None
    summary: Optional[str] = None

class DocumentCreate(DocumentBase):
    filepath: str

class Document(DocumentBase):
    docid: int
    upload_date: datetime
    uuid: str
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    uuid: str
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class AccessLog(BaseModel):
    log_id: int
    user_uuid: str
    doc_uuid: Optional[int] = None
    action: str
    timestamp: datetime
    class Config:
        from_attributes = True