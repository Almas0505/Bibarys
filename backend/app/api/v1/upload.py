"""
Upload endpoints for image files
"""
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.api.v1 import get_current_user
from app.core.storage import save_upload_file, delete_file, get_file_url
from app.db.models import User
from pydantic import BaseModel

router = APIRouter()


class UploadResponse(BaseModel):
    """Response model for file upload"""
    filename: str
    url: str
    size: int


@router.post("/image", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload an image file.
    
    - **file**: Image file (jpg, jpeg, png, gif, webp)
    - Maximum size: 5MB
    
    Returns filename, URL, and file size
    """
    try:
        # Validate content type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(400, "Only image files are allowed")
        
        # Save file
        filename = await save_upload_file(file)
        
        # Get file size
        file_path = Path("static/uploads") / filename
        size = file_path.stat().st_size
        
        return UploadResponse(
            filename=filename,
            url=get_file_url(filename),
            size=size
        )
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"File upload failed: {str(e)}")


@router.delete("/image/{filename}")
async def delete_image(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete an uploaded image.
    
    - **filename**: Name of the file to delete
    
    Requires authentication
    """
    try:
        await delete_file(filename)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(500, f"File deletion failed: {str(e)}")
