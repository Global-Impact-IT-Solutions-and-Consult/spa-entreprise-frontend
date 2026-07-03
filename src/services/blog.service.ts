import apiClient from '@/lib/api-client';

export type BlogStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  status: BlogStatus;
  authorId: string | null;
  authorName: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  data: BlogPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BlogQuery {
  page?: number;
  limit?: number;
  status?: BlogStatus;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'title_asc' | 'title_desc';
}

export interface BlogPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  status?: BlogStatus;
  coverImageUrl?: string | null;
}

export const blogService = {
  getBlogs: async (params?: BlogQuery) => {
    const res = await apiClient.get<BlogListResponse>('/blogs', { params });
    return res.data;
  },
  getBlog: async (slug: string) => {
    const res = await apiClient.get<BlogPost>(`/blogs/${slug}`);
    return res.data;
  },
  getAdminBlogs: async (params?: BlogQuery) => {
    const res = await apiClient.get<BlogListResponse>('/admin/blogs', {
      params,
    });
    return res.data;
  },
  getAdminBlog: async (id: string) => {
    const res = await apiClient.get<BlogPost>(`/admin/blogs/${id}`);
    return res.data;
  },
  createBlog: async (body: BlogPayload) => {
    const res = await apiClient.post<BlogPost>('/admin/blogs', body);
    return res.data;
  },
  updateBlog: async (id: string, body: Partial<BlogPayload>) => {
    const res = await apiClient.patch<BlogPost>(`/admin/blogs/${id}`, body);
    return res.data;
  },
  deleteBlog: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(
      `/admin/blogs/${id}`,
    );
    return res.data;
  },
  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<BlogPost>(
      `/admin/blogs/${id}/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data;
  },
  deleteImage: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(
      `/admin/blogs/${id}/image`,
    );
    return res.data;
  },
};
