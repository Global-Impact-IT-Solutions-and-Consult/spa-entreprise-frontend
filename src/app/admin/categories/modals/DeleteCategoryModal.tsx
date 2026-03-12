'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import type { AdminServiceCategory } from '@/services/admin.service';

interface DeleteCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: AdminServiceCategory | null;
  onConfirm: (id: string) => Promise<void>;
  loading?: boolean;
}

export function DeleteCategoryModal({
  open,
  onOpenChange,
  category,
  onConfirm,
  loading,
}: DeleteCategoryModalProps) {
  if (!category) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm(category.id);
      onOpenChange(false);
    } catch {
      // Error handled by parent
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogClose
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </DialogClose>
          <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
            Delete Category
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium">
              Are you sure you want to delete &apos;{category.name}&apos;?
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              This category is currently used by {category.usageCount} services.
              Deleting it will affect those services.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            The action will soft delete the category (mark as inactive). Data
            will be preserved for audit purposes.
          </p>
        </div>
        <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
