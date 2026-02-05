import React, { useCallback, useState } from 'react';
import axios from 'axios';

interface UploadedImage {
  url: string;
  thumbnail: string;
  filename: string;
}

interface PhotoUploadProps {
  onImagesUploaded?: (images: UploadedImage[]) => void;
  maxFiles?: number;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onImagesUploaded,
  maxFiles = 5,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string>('');

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const uploadFiles = useCallback(async (files: FileList) => {
    if (uploadedImages.length >= maxFiles) {
      setError(`Максимум ${maxFiles} фото`);
      return;
    }

    setIsUploading(true);
    setError('');
    const newImages: UploadedImage[] = [];

    try {
      // Получаем JWT токен из localStorage
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Требуется аутентификация');
        setIsUploading(false);
        return;
      }

      // Загружаем файлы параллельно (максимум 5 одновременно)
      const filesToUpload = Array.from(files).slice(0, maxFiles - uploadedImages.length);
      
      for (const file of filesToUpload) {
        // Валидация типа файла
        if (!file.type.startsWith('image/')) {
          setError('Допускаются только изображения');
          continue;
        }

        // Валидация размера (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Размер файла не должен превышать 5MB');
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await axios.post(
            'http://localhost:8000/api/v1/upload/product-image',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          newImages.push({
            url: response.data.url,
            thumbnail: response.data.thumbnail,
            filename: response.data.filename,
          });
        } catch (err) {
          console.error('Upload error:', err);
          setError('Ошибка загрузки фото');
        }
      }

      const updated = [...uploadedImages, ...newImages];
      setUploadedImages(updated);
      onImagesUploaded?.(updated);
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages, maxFiles, onImagesUploaded]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        uploadFiles(e.target.files);
      }
    },
    [uploadFiles]
  );

  const removeImage = (filename: string) => {
    const updated = uploadedImages.filter((img) => img.filename !== filename);
    setUploadedImages(updated);
    onImagesUploaded?.(updated);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Фото товара
      </label>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="pointer-events-none">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-12l-3.172-3.172a4 4 0 00-5.656 0L28 12m0 0l-3.172-3.172a4 4 0 00-5.656 0L12 16m16 0h4m-20 20h4m8-8a4 4 0 11-8 0 4 4 0 018 0z"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="mt-2 text-sm text-gray-600">
            Перетащите фото или <span className="text-blue-600 font-medium">выберите файл</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG или WebP до 5MB (максимум {maxFiles} фото)
          </p>
        </div>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Загрузка...</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Загруженные фото ({uploadedImages.length}/{maxFiles})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {uploadedImages.map((image) => (
              <div
                key={image.filename}
                className="relative group rounded-lg overflow-hidden bg-gray-200 aspect-square"
              >
                <img
                  src={image.thumbnail}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removeImage(image.filename)}
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
