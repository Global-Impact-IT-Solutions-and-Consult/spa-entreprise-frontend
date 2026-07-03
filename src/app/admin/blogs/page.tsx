'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAdminHeader } from '@/contexts/AdminHeaderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, type SelectOption } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toaster } from '@/components/ui/toaster';
import { normalizeApiMessage } from '@/lib/api';
import {
  blogService,
  type BlogPayload,
  type BlogPost,
  type BlogStatus,
} from '@/services/blog.service';
import {
  Eye,
  ImagePlus,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';

const PAGE_SIZE = 10;
const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

function getApiError(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    return normalizeApiMessage(
      (error as { response?: { data?: unknown } }).response?.data,
    );
  }
  return fallback;
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminBlogsPage() {
  const { setHeaderActions } = useAdminHeader();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const stats = useMemo(
    () => ({
      total,
      published: blogs.filter((blog) => blog.status === 'published').length,
      drafts: blogs.filter((blog) => blog.status === 'draft').length,
    }),
    [blogs, total],
  );

  useEffect(() => {
    setHeaderActions(
      <Button
        className="bg-[#9333EA] hover:bg-[#7e22ce] text-white"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        New Blog
      </Button>,
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await blogService.getAdminBlogs({
        page,
        limit: PAGE_SIZE,
        status: status === 'all' ? undefined : (status as BlogStatus),
        search: search.trim() || undefined,
      });
      setBlogs(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: getApiError(error, 'Failed to load blogs.'),
        type: 'error',
      });
      setBlogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBlogs();
  }, [page, status]);

  const handleSearch = () => {
    setPage(1);
    void loadBlogs();
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setPage(1);
  };

  const handleSave = async (
    payload: BlogPayload,
    imageFile?: File | null,
  ) => {
    try {
      const blog = selectedBlog
        ? await blogService.updateBlog(selectedBlog.id, payload)
        : await blogService.createBlog(payload);
      if (imageFile) {
        await blogService.uploadImage(blog.id, imageFile);
      }
      toaster.create({
        title: selectedBlog ? 'Blog updated' : 'Blog created',
        type: 'success',
      });
      setCreateOpen(false);
      setEditOpen(false);
      setSelectedBlog(null);
      void loadBlogs();
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: getApiError(error, 'Failed to save blog.'),
        type: 'error',
      });
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedBlog) return;
    try {
      await blogService.deleteBlog(selectedBlog.id);
      toaster.create({ title: 'Blog deleted', type: 'success' });
      setDeleteOpen(false);
      setSelectedBlog(null);
      void loadBlogs();
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: getApiError(error, 'Failed to delete blog.'),
        type: 'error',
      });
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Blog Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create and publish customer-facing blog posts.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 shrink-0">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Published" value={stats.published} tone="green" />
          <StatCard label="Drafts" value={stats.drafts} tone="amber" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="w-[150px]"
        />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search blogs..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSearch();
            }}
            className="pl-9 w-64"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleSearch}>
          Search
        </Button>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Post</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    Loading blogs...
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No blog posts found.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 overflow-hidden rounded bg-gray-100">
                          {blog.coverImageUrl ? (
                            <Image
                              src={blog.coverImageUrl}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <ImagePlus className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{blog.title}</p>
                          <p className="text-xs text-gray-500">{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={blog.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(blog.publishedAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(blog.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {blog.status === 'published' && (
                          <Link
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBlog(blog);
                            setEditOpen(true);
                          }}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBlog(blog);
                            setDeleteOpen(true);
                          }}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
          <p className="text-sm text-gray-600">
            Showing {blogs.length ? (page - 1) * PAGE_SIZE + 1 : 0} to{' '}
            {Math.min(page * PAGE_SIZE, total)} of {total} posts
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <BlogFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleSave}
      />
      <BlogFormDialog
        open={editOpen}
        blog={selectedBlog}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedBlog(null);
        }}
        onSubmit={handleSave}
      />
      <DeleteBlogDialog
        open={deleteOpen}
        blog={selectedBlog}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setSelectedBlog(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = 'gray',
}: {
  label: string;
  value: number;
  tone?: 'gray' | 'green' | 'amber';
}) {
  const toneClass =
    tone === 'green'
      ? 'text-green-600'
      : tone === 'amber'
        ? 'text-amber-600'
        : 'text-gray-900';

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: BlogStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        status === 'published'
          ? 'bg-green-100 text-green-700'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );
}

function BlogFormDialog({
  open,
  onOpenChange,
  blog,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog?: BlogPost | null;
  onSubmit: (payload: BlogPayload, imageFile?: File | null) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<BlogStatus>('draft');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(blog?.title || '');
    setSlug(blog?.slug || '');
    setExcerpt(blog?.excerpt || '');
    setContent(blog?.content || '');
    setStatus(blog?.status || 'draft');
    setImageFile(null);
  }, [blog, open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (imageFile && imageFile.size > 1024 * 1024) {
      toaster.create({
        title: 'Image too large',
        description: 'Blog images must be 1MB or smaller.',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(
        {
          title: title.trim(),
          slug: slug.trim() || undefined,
          excerpt: excerpt.trim() || undefined,
          content,
          status,
        },
        imageFile,
      );
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {blog ? 'Edit Blog' : 'Create Blog'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="blog-title">Title *</Label>
            <Input
              id="blog-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="blog-slug">Slug</Label>
              <Input
                id="blog-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="auto-generated-from-title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="blog-status">Status</Label>
              <Select
                id="blog-status"
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                ]}
                value={status}
                onChange={(event) => setStatus(event.target.value as BlogStatus)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="blog-excerpt">Excerpt</Label>
            <Textarea
              id="blog-excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="blog-content">Content *</Label>
            <Textarea
              id="blog-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="blog-image">Cover image</Label>
            <Input
              id="blog-image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(event) =>
                setImageFile(event.target.files?.[0] || null)
              }
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG, or WEBP. Max 1MB.
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#9333EA] hover:bg-[#7e22ce] text-white"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : blog ? 'Save Changes' : 'Create Blog'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteBlogDialog({
  open,
  onOpenChange,
  blog,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: BlogPost | null;
  onConfirm: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Delete Blog
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Delete {blog ? `"${blog.title}"` : 'this blog post'}? This also
          removes its cover image from storage.
        </p>
        <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={submitting}
            onClick={handleConfirm}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {submitting ? 'Deleting...' : 'Delete Blog'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
