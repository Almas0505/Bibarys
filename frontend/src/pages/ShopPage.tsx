/**
 * Shop Page - Product Listing with Filters (Complete Rewrite)
 */

import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters, { ProductFiltersState } from '../components/product/ProductFilters';
import SearchBar from '../components/product/SearchBar';
import ProductSort, { SortOption } from '../components/product/ProductSort';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { useToast } from '../components/common/ToastContainer';
import { ProductCategory } from '../types';

export default function ShopPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, pagination, isLoading } = useAppSelector((state) => state.product);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  // Initialize filters from URL params or localStorage
  const [filters, setLocalFilters] = useState<ProductFiltersState>(() => {
    const savedFilters = localStorage.getItem('shopFilters');
    const categoryParam = searchParams.get('category');
    
    if (categoryParam) {
      return {
        categories: [categoryParam as ProductCategory],
        minPrice: '',
        maxPrice: '',
        minRating: 0,
        inStock: false,
      };
    }
    
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    
    return {
      categories: [],
      minPrice: '',
      maxPrice: '',
      minRating: 0,
      inStock: false,
    };
  });

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'newest'
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1')
  );

  // Sync filters with localStorage
  useEffect(() => {
    localStorage.setItem('shopFilters', JSON.stringify(filters));
  }, [filters]);

  // Sync URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    
    if (searchQuery) params.search = searchQuery;
    if (sortBy !== 'newest') params.sort = sortBy;
    if (currentPage > 1) params.page = currentPage.toString();
    if (filters.categories.length > 0) params.category = filters.categories[0];
    
    setSearchParams(params);
  }, [searchQuery, sortBy, currentPage, filters.categories, setSearchParams]);

  // Fetch products when filters change
  useEffect(() => {
    const fetchData = async () => {
      // Map sort option to API format
      const sortMapping: Record<SortOption, { sort_by: string; sort_order: 'asc' | 'desc' }> = {
        newest: { sort_by: 'created_at', sort_order: 'desc' },
        popular: { sort_by: 'view_count', sort_order: 'desc' },
        price_asc: { sort_by: 'price', sort_order: 'asc' },
        price_desc: { sort_by: 'price', sort_order: 'desc' },
        rating_desc: { sort_by: 'rating', sort_order: 'desc' },
      };

      const sort = sortMapping[sortBy];

      dispatch(
        fetchProducts({
          filters: {
            search: searchQuery || undefined,
            category: filters.categories[0] || undefined,
            min_price: filters.minPrice ? Number(filters.minPrice) : undefined,
            max_price: filters.maxPrice ? Number(filters.maxPrice) : undefined,
            sort_by: sort.sort_by,
            sort_order: sort.sort_order,
          },
          pagination: { page: currentPage, page_size: 20 },
        })
      );
    };

    fetchData();
  }, [dispatch, filters, searchQuery, sortBy, currentPage]);

  const handleFiltersChange = (newFilters: ProductFiltersState) => {
    setLocalFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      showToast('warning', 'Пожалуйста, войдите в систему');
      return;
    }

    try {
      await dispatch(addToCart({ product_id: productId, quantity: 1 })).unwrap();
      showToast('success', 'Товар добавлен в корзину!');
    } catch (error) {
      showToast('error', 'Не удалось добавить товар в корзину');
    }
  };

  const handleToggleWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      showToast('warning', 'Пожалуйста, войдите в систему');
      return;
    }

    const isInWishlist = wishlistItems.some((item) => item.id === productId);

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap();
        showToast('info', 'Товар удален из избранного');
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
        showToast('success', 'Товар добавлен в избранное!');
      }
    } catch (error) {
      showToast('error', 'Произошла ошибка');
    }
  };

  const wishlistProductIds = wishlistItems.map((item) => item.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-primary-600">
          Главная
        </Link>
        {' > '}
        <span className="text-gray-800">Каталог</span>
        {filters.categories.length > 0 && (
          <>
            {' > '}
            <span className="text-gray-800">{filters.categories[0]}</span>
          </>
        )}
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left sidebar - Filters */}
        <aside className="w-full lg:w-1/4">
          <div className="lg:sticky lg:top-4">
            <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} />
            </div>
            <ProductSort value={sortBy} onChange={handleSortChange} />
          </div>

          {/* Results count */}
          {!isLoading && (
            <p className="text-gray-600 mb-4">
              Найдено: {pagination.total} товаров
            </p>
          )}

          {/* Products grid */}
          {isLoading ? (
            <LoadingSpinner text="Загрузка товаров..." />
          ) : products.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Товары не найдены"
              description="Попробуйте изменить параметры поиска или фильтры"
              action={
                <Button
                  variant="primary"
                  onClick={() => {
                    setLocalFilters({
                      categories: [],
                      minPrice: '',
                      maxPrice: '',
                      minRating: 0,
                      inStock: false,
                    });
                    setSearchQuery('');
                  }}
                >
                  Сбросить фильтры
                </Button>
              }
            />
          ) : (
            <>
              <ProductGrid
                products={products}
                columns={3}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleToggleWishlist}
                wishlistIds={wishlistProductIds}
              />

              {/* Pagination */}
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.total_pages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
