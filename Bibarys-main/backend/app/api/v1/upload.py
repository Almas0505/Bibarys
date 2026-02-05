"""
Upload endpoints for product images
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from app.api.v1 import get_current_user, require_seller_or_admin
from app.core.image_handler import save_product_image, delete_image
from app.db.models import User
from pydantic import BaseModel

router = APIRouter()


class ImageUploadResponse(BaseModel):
    """Response model for image upload"""
    url: str
    thumbnail: str
    filename: str
    message: str = "Image uploaded successfully"


class ImageDeleteResponse(BaseModel):
    """Response model for image deletion"""
    message: str
    filename: str


@router.post("/product-image", response_model=ImageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_seller_or_admin)
):
    """
    Загрузить фото товара (для продавцов)
    
    - **file**: Изображение товара (JPG, PNG, WebP)
    - Максимум: 5MB
    - Автоматически создается thumbnail
    
    Возвращает URL оригинала и thumbnail
    """
    try:
        # Валидация типа файла
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Допускаются только изображения"
            )
        
        # Сохраняем и оптимизируем
        result = await save_product_image(file)
        
        return ImageUploadResponse(
            url=result["url"],
            thumbnail=result["thumbnail"],
            filename=result["filename"]
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка загрузки: {str(e)}"
        )


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
        deleted = await delete_file(filename)
        if deleted:
            return {"message": "File deleted successfully"}
        else:
            raise HTTPException(404, "File not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"File deletion failed: {str(e)}")
