from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
from cryptography.fernet import Fernet
import hashlib
import base64
import bcrypt
import os

class EncryptionHandler:
    def __init__(self):
        self.iterations = 480_000
        self.backend = default_backend()

    def gen_salt(self):
        return os.urandom(16)

    def hash_password(self, password:str)->bytes:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    def verify_password(self, password:str, stored_hash:str)->bool:
        return bcrypt.checkpw(password.encode("utf-8"), stored_hash)

    def gen_uuid(self, username:str, hashed_password:bytes, salt:bytes)->str:
        combined = username.encode('utf-8') + hashed_password + salt
        return hashlib.sha256(combined).hexdigest()

    def derive_key(self, hashed_password:bytes, salt:bytes)->bytes:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=self.iterations,
            backend=self.backend
        )
        return base64.urlsafe_b64encode(kdf.derive(hashed_password))

    # Function to encrypt entire file content as binary data
    def encrypt_file(self, key:bytes, data:bytes)->bytes:
        f = Fernet(key)
        return f.encrypt(data)

    # Function to decrypt entire file content as binary data
    def decrypt_file(self, key:bytes, encrypted_data:bytes)->bytes:
        f = Fernet(key)
        return f.decrypt(encrypted_data)