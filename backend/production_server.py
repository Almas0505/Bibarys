"""
Final Backend Startup Script
Starts the server in a stable way
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn
    
    print("="*80)
    print("BIBARYS E-COMMERCE BACKEND - PRODUCTION READY")
    print("="*80)
    print()
    print("Starting server on http://0.0.0.0:8001")
    print("API Documentation: http://localhost:8001/api/docs")
    print("Alternative docs: http://localhost:8001/api/redoc")
    print()
    print("Press CTRL+C to stop")
    print("="*80)
    print()
    
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8001,
            reload=False,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n\nServer stopped gracefully")
        sys.exit(0)
    except Exception as e:
        print(f"\n\nError starting server: {e}")
        sys.exit(1)
