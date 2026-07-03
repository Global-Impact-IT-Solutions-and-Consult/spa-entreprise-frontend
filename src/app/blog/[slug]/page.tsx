'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import { CustomerFooter } from '@/components/modules/customer/customer-footer';
import { CustomerHeader } from '@/components/modules/customer/customer-header';
import { blogService, type BlogPost } from '@/services/blog.service';

function formatDate(value?: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);
      try {
        const data = await blogService.getBlog(params.slug);
        setBlog(data);
      } catch {
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) void loadBlog();
  }, [params.slug]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900">
      <CustomerHeader />
      <main>
        {loading ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="h-96 animate-pulse rounded-lg bg-white" />
          </div>
        ) : !blog ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#E89D24]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
            <div className="mt-8 rounded-lg border border-gray-200 bg-white p-10 text-center">
              <h1 className="text-2xl font-bold text-gray-950">
                Blog post not found
              </h1>
            </div>
          </div>
        ) : (
          <>
            <section className="border-b border-gray-200 bg-white">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#E89D24]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to blog
                </Link>
                <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {formatDate(blog.publishedAt || blog.createdAt)}
                </div>
                <h1 className="mt-4 font-playfair text-3xl md:text-5xl font-bold leading-tight text-gray-950">
                  {blog.title}
                </h1>
                {blog.excerpt && (
                  <p className="mt-5 text-lg leading-8 text-gray-600">
                    {blog.excerpt}
                  </p>
                )}
              </div>
            </section>

            {blog.coverImageUrl && (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <div className="relative aspect-[16/8] overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={blog.coverImageUrl}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
              <div className="whitespace-pre-wrap text-base leading-8 text-gray-700">
                {blog.content}
              </div>
            </article>
          </>
        )}
      </main>
      <CustomerFooter />
    </div>
  );
}
