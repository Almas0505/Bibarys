"""
Storage service for handling file uploads
"""
import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
import aiofiles

# Create uploads directory
UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return Path(filename).suffix.lower()


def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


async def save_upload_file(file: UploadFile) -> str:
    """Save uploaded file and return filename."""
    # Validate filename exists
    if not file.filename:
        raise ValueError("Filename is required")
    
    # Validate extension
    if not is_allowed_file(file.filename):
        raise ValueError(f"File type not allowed. Allowed: {ALLOWED_EXTENSIONS}")
    
    # Read file
    contents = await file.read()
    
    # Validate size
    if len(contents) > MAX_FILE_SIZE:
        raise ValueError(f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB")
    
    # Generate unique filename
    ext = get_file_extension(file.filename)
    new_filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / new_filename
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(contents)
    
    return new_filename


async def delete_file(filename: str) -> bool:
    """
    Delete uploaded file.
    
    Returns:
        bool: True if file was deleted, False if file didn't exist
        
    Raises:
        Exception: If deletion fails for reasons other than file not existing
    """
    file_path = UPLOAD_DIR / filename
    if file_path.exists() and file_path.is_file():
        os.remove(file_path)
        return True
    return False


def get_file_url(filename: str) -> str:
    """Get public URL for uploaded file."""
    return f"/static/uploads/{filename}"
