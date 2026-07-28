'use client';

import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import Link from 'next/link';

export default function Footer() {
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();

  return (
    <footer className="border-t bg-gray-50 py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* brand */}
          <div>
            <h3 className="text-lg font-bold text-blue-600">
              🛒 {(settings?.store_name as string) || 'ShopApp'}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Your one-stop shop for everything you need.
            </p>
          </div>

          {/* links */}
          <div>
            <h4 className="font-semibold text-gray-900">Shop</h4>
            <ul className="mt-2 space-y-1">
              {[
                { label: 'All Products', href: '/products', shouldShow: true },
                { label: 'My Orders', href: '/orders', shouldShow: user !== null },
                { label: 'My Cart', href: '/cart', shouldShow: user !== null },
              ]
                .filter((link) => link.shouldShow)
                .map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-500 hover:text-blue-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* account */}
          <div>
            <h4 className="font-semibold text-gray-900">Account</h4>
            <ul className="mt-2 space-y-1">
              {[
                { label: 'Sign In', href: '/login', shouldShow: user === null },
                { label: 'Register', href: '/register', shouldShow: user === null },
                { label: 'Profile', href: '/profile', shouldShow: user !== null },
              ]
                .filter((link) => link.shouldShow)
                .map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-500 hover:text-blue-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
              {settings.social_facebook && (
                <li>
                  <a
                    href={`https://facebook.com/${settings.social_facebook}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-blue-600"
                  >
                    Facebook
                  </a>
                </li>
              )}
              {settings.social_instagram && (
                <li>
                  <a
                    href={`https://instagram.com/${settings.social_instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-pink-600"
                  >
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} ShopApp. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
