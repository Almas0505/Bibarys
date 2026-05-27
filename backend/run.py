"""
Backend startup script with Python 3.13 compatibility workaround
"""
import sys
import os

# Set environment
os.environ['PYTHONPATH'] = os.path.dirname(os.path.abspath(__file__))

# Workaround for Python 3.13 + SQLAlchemy typing issues
if sys.version_info >= (3, 13):
    import typing
    # Monkey patch to fix TypingOnly issue
    if not hasattr(typing, '_TypingBase'):
        typing._TypingBase = type

print("=" * 60)
print("🚀 Starting SaudaFlow Backend Server")
print("=" * 60)
print(f"Python Version: {sys.version}")
print(f"Working Directory: {os.getcwd()}")
print("=" * 60)

# Import and run uvicorn
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
