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
import { CheckCircle } from 'lucide-react';

interface UnsuspendUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onConfirm: (user: AdminUser) => void;
}

export function UnsuspendUserModal({
  open,
  onOpenChange,
  user,
  onConfirm,
}: UnsuspendUserModalProps) {
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
            Unsuspend User
          </DialogTitle>
        </DialogHeader>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2 items-start">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            Reactivate {fullName}? They will regain access to their account.
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
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              onConfirm(user);
              onOpenChange(false);
            }}
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Unsuspend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
