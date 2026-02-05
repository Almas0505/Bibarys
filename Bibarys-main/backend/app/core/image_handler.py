"""
Улучшенный сервис для работы с загрузками изображений
"""
import os
import uuid
from pathlib import Path
from typing import Dict, Optional
from fastapi import UploadFile
from PIL import Image
import io

UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_IMAGE_SIZE = 2000  # pixels


async def save_product_image(file: UploadFile) -> Dict[str, str]:
    """
    Сохранить и оптимизировать изображение товара
    Возвращает URL оригинала и thumbnail
    """
    if not file.filename:
        raise ValueError("Название файла обязательно")
    
    # Проверка расширения
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Недопустимый тип файла. Разрешены: {ALLOWED_EXTENSIONS}")
    
    # Прочитать файл
    contents = await file.read()
    
    # Проверка размера
    if len(contents) > MAX_FILE_SIZE:
        raise ValueError(f"Файл слишком большой. Максимум: {MAX_FILE_SIZE / 1024 / 1024}MB")
    
    # Валидация и оптимизация изображения
    try:
        img = Image.open(io.BytesIO(contents))
        
        # Конвертируем RGBA в RGB если нужно
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Ресайз если слишком большое
        if img.width > MAX_IMAGE_SIZE or img.height > MAX_IMAGE_SIZE:
            img.thumbnail((MAX_IMAGE_SIZE, MAX_IMAGE_SIZE), Image.Resampling.LANCZOS)
        
    except Exception as e:
        raise ValueError(f"Невалидное изображение: {str(e)}")
    
    # Генерируем уникальное имя
    unique_filename = f"{uuid.uuid4()}.jpg"
    products_dir = UPLOAD_DIR / "products"
    products_dir.mkdir(parents=True, exist_ok=True)
    
    original_path = products_dir / unique_filename
    thumb_path = products_dir / f"thumb_{unique_filename}"
    
    # Сохраняем оригинал
    img.save(original_path, 'JPEG', quality=85, optimize=True)
    
    # Создаем thumbnail (300x300)
    thumb_img = img.copy()
    thumb_img.thumbnail((300, 300), Image.Resampling.LANCZOS)
    thumb_img.save(thumb_path, 'JPEG', quality=80, optimize=True)
    
    return {
        "url": f"/static/uploads/products/{unique_filename}",
        "thumbnail": f"/static/uploads/products/thumb_{unique_filename}",
        "filename": unique_filename
    }


async def delete_image(filename: str) -> bool:
    """Удалить изображение и его thumbnail"""
    try:
        original_path = UPLOAD_DIR / "products" / filename
        thumb_path = UPLOAD_DIR / "products" / f"thumb_{filename}"
        
        if original_path.exists():
            original_path.unlink()
        if thumb_path.exists():
            thumb_path.unlink()
        
        return True
    except Exception as e:
        print(f"Ошибка при удалении файла: {e}")
        return False
