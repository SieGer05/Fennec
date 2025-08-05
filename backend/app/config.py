from pydantic_settings import BaseSettings

class Settings(BaseSettings):
   database_url: str = "sqlite:///./database.db"
   cors_origins: list[str] = ["http://localhost:5173"]
   admin_username: str = "admin"
   admin_password_hash: str = "$2b$12$5xrx/YgB4y593kiBIZ.FNecYSmnqu9mwN.s/0zcvPJZUGCyWRKsmK"

settings = Settings() 