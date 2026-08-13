'use client';

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  FlashSale,
  FlashSaleProduct,
  Product,
  ProductImage,
  ProductVariant,
  ProductVariantImage,
} from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import StarRating from '@/components/ui/StarRating';
import ReviewSection from '@/components/product/ReviewSection';
import { ShoppingCart, Minus, Plus, ChevronLeft, Zap } from 'lucide-react';
import CountdownTimer from '../ui/CountdownTimer';
import ImageGallery from './Product/ImageGallery';
import TrustBadges from './Product/TrustBadges';
import Loader from './Product/Loader';

type Props = {
  slug: string;
  product: Product;
};

const ProductDetail: FC<Props> = ({ product, slug }) => {
  const router = useRouter();

  const { user } = useAuthStore();
  const { fetchCart } = useCartStore();

  //const [product, setProduct] = useState<Product | null>(null);
  //const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const [activeSale, setActiveSale] = useState<FlashSale | null>(null);
  const [flashPrice, setFlashPrice] = useState<number | null>(null);

  const [images, setImages] = useState<ProductImage[] | ProductVariantImage[]>(
    product?.images || [],
  );

  // helper — check if color is light or dark for checkmark contrast
  function isLightColor(hex: string): boolean {
    if (!hex) return true;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // luminance formula
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  }

  useEffect(() => {
    const fetchProduct = async () => {
      //setLoading(true);
      try {
        //const { data } = await api.get(`/products/${slug}`);

        // fetch variants by product id
        if (product.id) {
          const { data: variantData } = await api.get(`/products/${product.id}/variants`);
          setVariants(variantData);
        }

        //setProduct(data);
        setSelectedImage(0);
        setQuantity(1);
        setImages(product.images);
      } catch {
        toast.error('Product not found');
        router.push('/products');
      } finally {
        //setLoading(false);
      }
    };

    fetchProduct();
  }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!product) return;
    api
      .get('/flash-sales/active')
      .then(({ data }) => {
        for (const sale of data) {
          const inSale = sale.products.some((p: FlashSaleProduct) => p.product.id === product.id);
          if (inSale) {
            setActiveSale(sale);
            const orig = Number(product.price);
            const value = Number(sale.discountValue);
            const price =
              sale.discountType === 'PERCENTAGE' ? orig - (orig * value) / 100 : orig - value;
            setFlashPrice(Number(price.toFixed(2)));
            break;
          }
        }
      })
      .catch(() => {});
  }, [product]);

  // group variants by name (Size, Color etc.)
  const variantGroups = variants.reduce<Record<string, ProductVariant[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {});

  const handleAddToCart = async (): Promise<boolean> => {
    if (!product) return false;

    if (!user) {
      router.push(`/login?redirect=/products/${slug}`);
      return false;
    }

    if (!!product.variants?.length && !selectedVariant) {
      toast.error('Please select a variant');
      return false;
    }

    setAddingToCart(true);
    try {
      await api.post('/cart/items', {
        productId: product.id,
        quantity,
        variantId: selectedVariant?.id,
      });
      await fetchCart();
      toast.success(`${quantity} × ${product.name} added to cart`);
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const handleVariantClick = (variant: ProductVariant) => {
    const isSelected = selectedVariant?.id === variant.id;
    setSelectedVariant(isSelected ? null : variant);
    if (isSelected) {
      setImages(product?.images ?? []);
      setSelectedImage(0);
    } else {
      if (variant?.images?.length) {
        setImages(variant.images);
        const index = variant.images.findIndex((img) => img.isMain);
        setSelectedImage(index);
      }
    }
  };

  const handleBuyNow = async () => {
    const isAddedToCart = await handleAddToCart();
    if (user && isAddedToCart) router.push('/checkout');
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* ── IMAGE GALLERY ─────────────────────────────── */}
        <ImageGallery
          images={images}
          selectedImage={selectedImage}
          product={product}
          onSelection={(index) => setSelectedImage(index)}
        />

        {/* ── DETAILS ────────────────────────────────────── */}
        <div>
          {product.category && (
            <span className="text-sm font-medium text-blue-600">{product.category.name}</span>
          )}

          <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>

          {/* rating */}
          {product.averageRating !== null && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={Math.round(product.averageRating)} size="sm" />
              <span className="text-sm text-gray-500">
                {product.averageRating} ({product._count?.reviews || 0} reviews)
              </span>
            </div>
          )}

          {/* price */}
          {activeSale && flashPrice !== null ? (
            <div
              className="mt-4 rounded-xl p-4 text-white"
              style={{ backgroundColor: activeSale.bannerColor }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-bold">{activeSale.name} — Ends in:</span>
                <CountdownTimer
                  endTime={activeSale.endTime}
                  size="sm"
                  onExpired={() => {
                    setActiveSale(null);
                    setFlashPrice(null);
                  }}
                />
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">${flashPrice.toFixed(2)}</span>
                <span className="text-lg line-through opacity-60">
                  ${Number(product.price).toFixed(2)}
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-sm font-bold">
                  {activeSale.discountType === 'PERCENTAGE'
                    ? `${activeSale.discountValue}% OFF`
                    : `$${activeSale.discountValue} OFF`}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-3xl font-bold text-gray-900">
              ${Number(product.price).toFixed(2)}
            </p>
          )}

          {/* stock status */}
          <div className="mt-2">
            {isOutOfStock ? (
              <span className="text-sm font-medium text-red-600">Out of Stock</span>
            ) : product.stock <= 10 ? (
              <span className="text-sm font-medium text-orange-600">
                Only {product.stock} left in stock!
              </span>
            ) : (
              <span className="text-sm font-medium text-green-600">In Stock</span>
            )}
          </div>

          {/* description */}
          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-gray-600">{product.description}</p>
          )}

          {Object.entries(variantGroups).length > 0 && (
            <div className="mt-4 space-y-3">
              {Object.entries(variantGroups).map(
                ([groupName, groupVariants]: [string, ProductVariant[]]) => (
                  <div key={groupName}>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {groupName}
                      {selectedVariant?.name === groupName && (
                        <span className="ml-2 text-blue-600">— {selectedVariant.value}</span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {groupVariants.map((variant) => {
                        const isSelected = selectedVariant?.id === variant.id;
                        const isOOS = variant.stock === 0;
                        const isColorType = !!variant.color;
                        return isColorType ? (
                          // ── COLOR SWATCH ────────────────────────
                          <button
                            key={variant.id}
                            onClick={() => handleVariantClick(variant)}
                            disabled={isOOS}
                            title={`${variant.value}${isOOS ? ' (Out of Stock)' : ''}`}
                            className={`relative h-9 w-9 rounded-full border-2 shadow-sm transition ${
                              isSelected
                                ? 'border-gray-900 scale-110'
                                : 'border-transparent hover:border-gray-400'
                            } ${isOOS ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                            style={{ backgroundColor: variant.color }}
                          >
                            {isSelected && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <svg
                                  className="h-4 w-4 drop-shadow"
                                  style={{
                                    color: isLightColor(variant.color!) ? '#000' : '#fff',
                                  }}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            )}
                            {isOOS && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="h-px w-8 rotate-45 bg-gray-400" />
                              </span>
                            )}
                          </button>
                        ) : (
                          // ── TEXT BUTTON ─────────────────────────
                          <button
                            key={variant.id}
                            onClick={() => handleVariantClick(variant)}
                            disabled={isOOS}
                            className={`rounded-md border px-3 py-1.5 text-sm transition ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : isOOS
                                  ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300 line-through'
                                  : 'border-gray-300 text-gray-700 hover:border-blue-400'
                            }`}
                          >
                            {variant.value}
                            {variant.stock <= 3 && variant.stock > 0 && (
                              <span className="ml-1 text-xs opacity-70">
                                ({variant.stock} left)
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {selectedVariant?.price && (
            <p className="mt-3 text-3xl font-bold text-gray-900">
              ${Number(selectedVariant.price).toFixed(2)}
              <span className="ml-2 text-lg text-gray-400 line-through">
                ${Number(product?.price).toFixed(2)}
              </span>
            </p>
          )}

          {/* quantity selector */}
          {!isOutOfStock && (
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-md border border-gray-300">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-400">
                  {selectedVariant?.stock ?? product.stock} available
                </span>
              </div>
            </div>
          )}

          {/* action buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border-2 border-blue-600 px-6 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || addingToCart}
              className="flex-1 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {/* trust badges */}
          <TrustBadges />
        </div>
      </div>

      {/* ── REVIEWS ────────────────────────────────────── */}
      <div className="mt-12">
        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetail;
