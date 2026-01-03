"""
Simplified startup for testing - без database initialization
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Create FastAPI application without database
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="E-Commerce API - Test Mode",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "E-Commerce API Test Mode",
        "status": "running",
        "version": settings.APP_VERSION,
        "docs": "/api/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🧪 Starting E-Commerce Backend (Test Mode)")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
