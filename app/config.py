from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables."""
    
    # Anthropic API Configuration
    anthropic_api_key: str
    
    # CORS Configuration
    cors_origins: str = "https://moorching.com,https://*.moorching.com"
    
    # Server Configuration
    thinking_budget_tokens: int = 10000
    session_cleanup_hours: int = 1
    max_concurrent_sessions_per_ip: int = 3
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Global settings instance
settings = Settings()

