'use client';

import api from '@/lib/api';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type NewsletterInput = {
  email: string;
};

export const NewsletterForm = () => {
  const { register, handleSubmit, reset } = useForm<NewsletterInput>();

  const onSubmit = (data: NewsletterInput) => {
    api
      .post('/newsletters', { email: data.email })
      .then(() => {
        toast.success('Subscribed!');
        reset();
      })
      .catch((error) => {
        const message = error.response?.data?.message ?? 'Failed to subscribe';
        toast.error(message);
      });
  };

  return (
    <div className="rounded-xl bg-gray-900 px-6 py-10 text-center text-white">
      <h2 className="text-2xl font-bold">Stay Updated</h2>
      <p className="mt-1 text-gray-400">Subscribe for exclusive deals and new arrivals</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto mt-4 md:flex max-w-md gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('email', { required: true })}
          />
          <button className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold hover:bg-blue-700 max-md:mt-4 max-md:w-full">
            Subscribe
          </button>
        </div>
      </form>
    </div>
  );
};
