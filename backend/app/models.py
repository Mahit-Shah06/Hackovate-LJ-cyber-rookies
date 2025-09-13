from sqlalchemy import LargeBinary, Column, Integer, String, DateTime, Text, ForeignKey
from datetime import datetime
from .db import Base

# Document table
class Document(Base):
    __tablename__ = "documents"

    uuid = Column(String, ForeignKey("users.uuid"), index=True)
    docid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String, index=True)
    filepath = Column(String)
    category = Column(String)
    author = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    upload_date = Column(DateTime, default=datetime.utcnow)

# User table
class User(Base):
    __tablename__ = "users"

    uuid = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)   # Will hash later
    role = Column(String)       # HR, Finance, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    salt = Column(LargeBinary)
