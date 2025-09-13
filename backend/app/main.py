from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import os, shutil, uuid as uuid_lib

from app import models, schemas, crud, db
from app.encryption_logic import EncryptionHandler
from app.auth_logic import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

# DB tables
models.Base.metadata.create_all(bind=db.engine)

# FastAPI app
app = FastAPI(title="AI Document Backend", version="1.0.0")

# Encryption handler
encryption = EncryptionHandler()

UPLOAD_DIR = "uploaded_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_user_crud(db: Session = Depends(db.get_db)):
    return crud.UserCRUD(db)

def get_docs_crud(db: Session = Depends(db.get_db)):
    return crud.DocsCRUD(db)

@app.get("/")
def root():
    return {"message": "Backend is running"}

# -----------------------------
# User Registration & Login
# -----------------------------
@app.post("/users/", response_model=schemas.User)
def create_user(user_in: schemas.UserCreate, user_crud: crud.UserCRUD = Depends(get_user_crud)):
    if user_crud.fetch_username(user_in.username):
        raise HTTPException(status_code=400, detail="Username already exists")

    salt = encryption.gen_salt()
    hashed_pw = encryption.hash_password(user_in.password)
    user_uuid = encryption.gen_uuid(user_in.username, hashed_pw, salt)
    user = user_crud.create_user(
        uuid=user_uuid,
        username=user_in.username,
        hashed_password=hashed_pw,
        role=user_in.role,
        salt=salt
    )
    return user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_crud: crud.UserCRUD = Depends(get_user_crud)
):
    user = user_crud.fetch_username(form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    stored_hash_bytes = user.hashed_password
    if not encryption.verify_password(form_data.password, stored_hash_bytes):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# -----------------------------
# Document Upload & Retrieval
# -----------------------------
@app.post("/documents/", response_model=schemas.Document)
def upload_document(
    file: UploadFile = File(...),
    category: str = Form(...),
    author: str = Form(None),
    summary: str = Form(None),
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(get_current_user),
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Derive key from user's password + salt for encryption
    key = encryption.derive_key(current_user.hashed_password, current_user.salt)
    with open(file_path, "rb") as f:
        data = f.read()
    encrypted_data = encryption.encrypt_data(key, data)

    enc_path = f"{file_path}.enc"
    with open(enc_path, "wb") as f:
        f.write(encrypted_data)

    docs_crud = crud.DocsCRUD(db)
    new_doc = docs_crud.create_doc(
        uuid=current_user.uuid,
        filename=file.filename,
        filepath=enc_path,
        category=category,
        author=author or current_user.username,
        summary=summary
    )
    return new_doc


@app.get("/documents/", response_model=list[schemas.Document])
def list_documents(
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(get_current_user)
):
    docs_crud = crud.DocsCRUD(db)
    return docs_crud.fetch_docs_by_user(current_user.uuid)


@app.get("/documents/{docid}")
def get_document(
    docid: int,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(get_current_user)
):
    docs_crud = crud.DocsCRUD(db)
    doc = docs_crud.fetch_doc_by_id(docid)
    if not doc or doc.uuid != current_user.uuid:
        raise HTTPException(status_code=404, detail="Document not found")

    key = encryption.derive_key(current_user.hashed_password, current_user.salt)
    with open(doc.filepath, "rb") as f:
        encrypted_data = f.read()
    decrypted_data = encryption.decrypt_data(key, encrypted_data)

    return {
        "docid": doc.docid,
        "filename": doc.filename,
        "author": doc.author,
        "category": doc.category,
        "summary": doc.summary,
        "content_preview": decrypted_data[:200].decode(errors="ignore")
    }
