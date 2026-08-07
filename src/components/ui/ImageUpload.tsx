'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Upload, X, Loader2, ImageIcon, Info } from 'lucide-react';
import { Product, ProductImage } from '@/lib/types';
import Image from 'next/image';

export default function ImageUpload({
  images,
  product,
  onChange,
  maxImages = 5,
  folder = 'products',
  hasPermission = true,
}: {
  images: string[];
  product?: Product;
  onChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
  hasPermission?: boolean;
}) {
  const mainImageInit = product?.images.findIndex((img) => img.isMain);
  const [uploading, setUploading] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState<number>(mainImageInit ?? 0);

  const updateProductMainImage = async (productImage: ProductImage, index: number) => {
    try {
      if (!product) return;
      await api.patch(`/products/${product.id}/main-image`, { imageId: productImage.id });
      toast.success('Main image updated');
      setMainImageIndex(index);
    } catch {
      toast.error('Failed to update main image');
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      setUploading(true);

      try {
        const uploadedUrls: string[] = [];

        for (const file of acceptedFiles) {
          const formData = new FormData();
          formData.append('file', file);

          const { data } = await api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          uploadedUrls.push(data.url);
        }

        onChange([...images, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} uploaded`);
      } catch {
        toast.error('Failed to upload image');
      } finally {
        setUploading(false);
      }
    },
    [images, maxImages, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    disabled: uploading || images.length >= maxImages,
    multiple: true,
  });

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div key={i} className="group relative aspect-square">
              <Image
                src={url}
                alt=""
                className="h-full w-full rounded-lg object-cover"
                width={100}
                height={100}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
              {i === mainImageIndex ? (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white">
                  Main
                </span>
              ) : (
                <span
                  onClick={product && (() => updateProductMainImage(product.images[i], i))}
                  className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white hidden group-hover:block hover:cursor-pointer"
                >
                  Set as main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {!hasPermission && (
        <div className="flex items-center justify-center p-4">
          <Info className="mr-2 h-4 w-4 text-red-500" />
          <p className="text-sm text-red-500">
            You don&apos;t have permission to upload images for this product
          </p>
        </div>
      )}

      {/* dropzone */}
      {images.length < maxImages && hasPermission && (
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : uploading
                ? 'cursor-not-allowed border-gray-200 bg-gray-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
          ) : isDragActive ? (
            <Upload className="mb-2 h-8 w-8 text-blue-600" />
          ) : (
            <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
          )}

          <p className="text-sm font-medium text-gray-600">
            {uploading
              ? 'Uploading...'
              : isDragActive
                ? 'Drop images here'
                : 'Drag & drop or click to upload'}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            JPG, PNG, WebP up to 5MB
            {maxImages > 1 && ` · ${images.length}/${maxImages} images`}
          </p>
        </div>
      )}
    </div>
  );
}
