'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Search } from 'lucide-react';
import { CustomerFooter } from '@/components/modules/customer/customer-footer';
import { CustomerHeader } from '@/components/modules/customer/customer-header';
import { CustomerBottomNav } from '@/components/modules/customer/customer-bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { blogService, type BlogPost } from '@/services/blog.service';

function formatDate(value?: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await blogService.getBlogs({
        page: 1,
        limit: 24,
        search: search.trim() || undefined,
      });
      setBlogs(res.data || []);
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900">
      <CustomerHeader />
      <main>
        <section className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#E89D24]">
              Blog
            </p>
            <div className="mt-4 max-w-4xl">
              <h1 className="font-playfair text-3xl md:text-5xl font-bold leading-tight text-gray-950">
                Guides for better wellness bookings
              </h1>
              <p className="mt-5 text-base md:text-lg leading-8 text-gray-600">
                Practical notes for customers choosing services and businesses
                improving their online booking experience.
              </p>
            </div>
            <div className="mt-8 flex max-w-xl gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void loadBlogs();
                  }}
                  placeholder="Search articles"
                  className="h-11 rounded-md border-gray-200 bg-white pl-9"
                />
              </div>
              <Button
                onClick={() => void loadBlogs()}
                className="h-11 rounded-md bg-[#E89D24] text-white hover:bg-[#d88c18]"
              >
                Search
              </Button>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-lg border border-gray-200 bg-white"
                />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
              <h2 className="text-xl font-bold text-gray-950">
                No articles published yet
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Check back soon for iBookam guides and updates.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] bg-gray-100">
                    {blog.coverImageUrl ? (
                      <Image
                        src={blog.coverImageUrl}
                        alt=""
                        fill
                        className="object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-medium text-gray-400">
                        iBookam
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </div>
                    <h2 className="text-lg font-bold leading-6 text-gray-950">
                      {blog.title}
                    </h2>
                    {blog.excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <CustomerFooter />
      <CustomerBottomNav />
    </div>
  );
}
