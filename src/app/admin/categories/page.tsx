'use client';

import { useEffect, useState } from 'react';
import { useAdminHeader } from '@/contexts/AdminHeaderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, type SelectOption } from '@/components/ui/select';
import {
  adminService,
  type AdminServiceCategory,
} from '@/services/admin.service';
import { CreateCategoryModal } from './modals/CreateCategoryModal';
import { EditCategoryModal } from './modals/EditCategoryModal';
import { DeleteCategoryModal } from './modals/DeleteCategoryModal';
import { Pencil, Trash2, RotateCcw, Plus } from 'lucide-react';
import { toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 15;
const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
const SORT_OPTIONS: SelectOption[] = [
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return s;
  }
}

export default function AdminCategoriesPage() {
  const { setHeaderActions } = useAdminHeader();
  const [list, setList] = useState<AdminServiceCategory[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<AdminServiceCategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setHeaderActions(
      <Button
        className="bg-[#9333EA] hover:bg-[#7e22ce] text-white"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" /> New Category
      </Button>,
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await adminService.getServiceCategories({
        page,
        limit: PAGE_SIZE,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy,
      });
      setList(res.data || []);
      setPagination(res.pagination || { total: 0, page: 1, totalPages: 0 });
      if (res.stats) setStats(res.stats);
      else
        setStats({
          total: res.pagination?.total ?? 0,
          active: (res.data || []).filter((c) => c.isActive).length,
        });
    } catch {
      setList([]);
      setPagination({ total: 0, page: 1, totalPages: 0 });
      toaster.create({
        title: 'Error',
        description: 'Failed to load categories.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [page, statusFilter, sortBy]);

  const handleCreate = async (data: { name: string; description: string }) => {
    try {
      await adminService.createServiceCategory(data);
      toaster.create({ title: 'Category created', type: 'success' });
      loadCategories();
    } catch (e: any) {
      const raw = e.response?.data?.message;
      const msg = Array.isArray(raw)
        ? raw[0]
        : raw || 'Failed to create category.';
      toaster.create({ title: 'Error', description: msg, type: 'error' });
      throw e;
    }
  };

  const handleEdit = async (
    id: string,
    data: { name: string; description: string; isActive: boolean },
  ) => {
    try {
      await adminService.updateServiceCategory(id, data);
      toaster.create({ title: 'Category updated', type: 'success' });
      setSelectedCategory(null);
      loadCategories();
    } catch (e: any) {
      const raw = e.response?.data?.message;
      const msg = Array.isArray(raw)
        ? raw[0]
        : raw || 'Failed to update category.';
      toaster.create({ title: 'Error', description: msg, type: 'error' });
      throw e;
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      await adminService.deleteServiceCategory(id);
      toaster.create({ title: 'Category deleted', type: 'success' });
      setSelectedCategory(null);
      loadCategories();
    } catch (e: any) {
      const raw = e.response?.data?.message;
      const msg = Array.isArray(raw)
        ? raw[0]
        : raw || 'Failed to delete category.';
      toaster.create({ title: 'Error', description: msg, type: 'error' });
      throw e;
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setSortBy('name_asc');
    setPage(1);
  };

  const totalPages = Math.max(1, pagination.totalPages);

  return (
    <div className="p-6 md:p-8">
      {/* Title/subtitle left, summary cards right */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Service Categories
          </h1>
          <p className="text-gray-600 mt-1">
            Manage service categories used across the platform.
          </p>
        </div>
        {/* Summary cards: bordered container (no extra white bg), white cards inside */}
        <div className="border border-gray-200 rounded-lg p-4 shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Filters: white background, bordered strip; Reset Filters = purple icon + text */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Status
            </span>
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-[120px] bg-white border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Sort By
            </span>
            <Select
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-[140px] bg-white border border-gray-300 rounded"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-[#9333EA] hover:text-[#7e22ce] hover:bg-[#9333EA]/10 p-0 h-auto font-medium"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-center">Usage Count</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Created At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                list.map((row, index) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'hover:bg-gray-50',
                      index % 2 === 1 && 'bg-gray-50/50',
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {row.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-center">
                      {row.usageCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${row.isActive ? 'text-green-600' : 'text-red-600'}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${row.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        {row.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-center">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(row);
                          setEditOpen(true);
                        }}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(row);
                          setDeleteOpen(true);
                        }}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total}{' '}
            categories
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </Button>
            {Array.from(
              { length: Math.min(4, totalPages) },
              (_, i) => i + 1,
            ).map((p) => (
              <Button
                key={p}
                variant={page === p ? 'default' : 'outline'}
                size="icon"
                className={`h-8 w-8 ${page === p ? 'bg-[#9333EA] hover:bg-[#7e22ce]' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </Button>
          </div>
        </div>
      </Card>

      <CreateCategoryModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
      <EditCategoryModal
        open={editOpen}
        onOpenChange={setEditOpen}
        category={selectedCategory}
        onSave={handleEdit}
      />
      <DeleteCategoryModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={selectedCategory}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
