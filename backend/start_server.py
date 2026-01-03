"""Simple uvicorn server starter without reload"""
import uvicorn
import sys

if __name__ == "__main__":
    print("Starting backend server on http://0.0.0.0:8001")
    print("Press CTRL+C to stop")
    
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8001,  # Changed to 8001 to avoid conflicts
            log_level="info",
            reload=False  # Disabled for stability
        )
    except KeyboardInterrupt:
        print("\nServer stopped")
        sys.exit(0)
