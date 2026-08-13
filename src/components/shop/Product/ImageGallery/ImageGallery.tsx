import Image from 'next/image';
import { FC } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product, ProductImage, ProductVariantImage } from '@/lib/types';

type Props = {
  images: ProductImage[] | ProductVariantImage[];
  selectedImage: number;
  product: Product;
  onSelection: (index: number) => void;
};

const ImageGallery: FC<Props> = ({ images, selectedImage, product, onSelection }) => {
  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-lg border bg-gray-50">
        {images.length > 0 ? (
          <Image
            src={images[selectedImage].url}
            alt={product.name}
            className="h-full w-full"
            width={500}
            height={500}
            priority={true}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <ShoppingCart className="h-20 w-20" />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onSelection(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                selectedImage === i ? 'border-blue-600' : 'border-transparent'
              }`}
            >
              <Image
                src={img.url}
                alt=""
                className="h-full w-full"
                width={60}
                height={60}
                priority={i < 3}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
