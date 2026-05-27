/**
 * Product Form Component - Add/Edit Product
 */

import { useState, useEffect } from 'react';
import { ProductCategory } from '../../types';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { PhotoUpload } from '../common/PhotoUpload';

interface ProductFormProps {
  product?: {
    id?: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    category: ProductCategory;
    image_urls: string[];
    expiry_date?: string | null;
  };
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    quantity: product?.quantity || 0,
    category: product?.category || ('other' as ProductCategory),
    expiry_date: product?.expiry_date || '',
  });

  const [imageUrls, setImageUrls] = useState<string[]>(product?.image_urls || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        category: product.category,
        expiry_date: product.expiry_date || '',
      });
      setImageUrls(product.image_urls);
    }
  }, [product]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Атауы міндетті түрде болуы керек';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Атауы кем дегенде 3 таңбадан тұруы керек';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Сипаттама міндетті түрде болуы керек';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Сипаттама кем дегенде 10 таңбадан тұруы керек';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Бағасы 0-ден жоғары болуы керек';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Саны теріс болмауы керек';
    }

    if (formData.expiry_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiryDate = new Date(formData.expiry_date);
      if (expiryDate < today) {
        newErrors.expiry_date = 'Жарамдылық мерзімі өткен күн болмауы керек';
      }
    }

    if (imageUrls.length === 0) {
      newErrors.images = 'Кем дегенде бір сурет қосыңыз';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price.toString());
    submitData.append('quantity', formData.quantity.toString());
    submitData.append('category', formData.category);
    if (formData.expiry_date) {
      submitData.append('expiry_date', formData.expiry_date);
    }
    
    // PhotoUpload уже загружает файлы, отправляем только URLs
    submitData.append('image_urls', JSON.stringify(imageUrls));

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Тауар атауы *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Тауар атауын енгізіңіз"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Сипаттама *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Тауардың толық сипаттамасы"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Price and Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Бағасы (₸) *
          </label>
          <input
            type="number"
            id="price"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
            min="0"
            step="1"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Бағаны теңгемен енгізіңіз"
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
            Саны *
          </label>
          <input
            type="number"
            id="quantity"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            min="0"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Санат *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Expiry Date */}
      <div>
        <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 mb-2">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Жарамдылық мерзімі
            <span className="text-gray-400 text-xs font-normal">(міндетті емес)</span>
          </span>
        </label>
        <input
          type="date"
          id="expiry_date"
          value={formData.expiry_date}
          onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.expiry_date ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.expiry_date && <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>}
        <p className="mt-1 text-xs text-gray-500">
          Егер мерзімін енгізсеңіз, тауар картасында көрсетіледі
        </p>
      </div>

      {/* Images */}
      <PhotoUpload 
        onImagesUploaded={(images) => {
          const urls = images.map(img => img.url);
          setImageUrls(urls);
          setErrors({ ...errors, images: '' });
        }}
        maxFiles={5}
      />

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Болдырмау
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {isLoading ? 'Сақталуда...' : product?.id ? 'Жаңарту' : 'Құру'}
        </button>
      </div>
    </form>
  );
}
