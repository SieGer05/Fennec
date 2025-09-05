from pydantic_settings import BaseSettings

class Settings(BaseSettings):
   # Database connection URL (default: local SQLite file)
   database_url: str = "sqlite:///./database.db"

   # Allowed CORS origins (frontend URLs or IP addresses allowed to access the API)
   # To add more origins (e.g., IP addresses or domains), just append them to this list.
   # Example: ["http://localhost:5173", "http://192.168.1.100:3000", "https://mydomain.com"]
   cors_origins: list[str] = ["http://localhost:5173"]

   # Default admin username
   # Change this value if you want a new admin username.
   admin_username: str = "admin"

   # Admin password hash (bcrypt)
   # Replace this with the bcrypt hash of your new password if you want to update it.
   # You can generate a new hash using: 
   #   from passlib.hash import bcrypt
   #   print(bcrypt.hash("your_new_password"))
   admin_password_hash: str = "$2b$12$5xrx/YgB4y593kiBIZ.FNecYSmnqu9mwN.s/0zcvPJZUGCyWRKsmK"


# Instantiate settings
settings = Settings()
