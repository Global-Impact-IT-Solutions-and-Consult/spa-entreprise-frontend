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
import { AdminUser } from '../types';
import { Trash2, AlertCircle } from 'lucide-react';

interface DeleteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSoftDelete: (user: AdminUser) => void;
  onHardDeleteClick: (user: AdminUser) => void;
}

export function DeleteUserModal({
  open,
  onOpenChange,
  user,
  onSoftDelete,
  onHardDeleteClick,
}: DeleteUserModalProps) {
  if (!user) return null;
  const fullName = `${user.firstName} ${user.lastName}`;

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
            Delete User
          </DialogTitle>
        </DialogHeader>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start mb-2">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">
            Are you sure you want to delete {fullName}?
          </p>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          This is a soft delete. The user will be marked as inactive, but data
          will be preserved for audit purposes. They will not be able to login.
        </p>
        <p className="text-sm text-gray-600">
          Need permanent deletion?{' '}
          <button
            type="button"
            className="text-red-600 hover:underline font-medium"
            onClick={() => {
              onOpenChange(false);
              onHardDeleteClick(user);
            }}
          >
            Hard Delete (Permanent)
          </button>
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
            onClick={() => {
              onSoftDelete(user);
              onOpenChange(false);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Soft Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
