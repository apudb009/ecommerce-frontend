'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/lib/types';

export default function BannerSlider({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // auto-play
  useEffect(() => {
    if (paused || banners.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, banners.length]);

  if (banners.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative min-w-full">
            {/* image */}
            <div className="aspect-21/9 w-full overflow-hidden bg-gray-100">
              <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
            </div>

            {/* overlay text */}
            <div className="absolute inset-0 flex items-center justify-center-safe bg-linear-to-r from-black/50 to-transparent px-10">
              <div className="max-w-lg text-white">
                <h2 className="text-3xl font-bold drop-shadow-lg md:text-4xl">{banner.title}</h2>
                {banner.subtitle && (
                  <p className="mt-2 text-lg text-white/90 drop-shadow">{banner.subtitle}</p>
                )}
                {banner.link && (
                  <Link
                    href={banner.link}
                    className="mt-4 inline-block rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                  >
                    Shop Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* prev/next buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-6 bg-white' : 'w-2 bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
