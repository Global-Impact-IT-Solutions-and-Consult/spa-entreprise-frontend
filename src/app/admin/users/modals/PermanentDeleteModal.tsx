'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminUser } from '../types';
import { Trash2, AlertTriangle } from 'lucide-react';

const CONFIRM_TEXT = 'DELETE';

interface PermanentDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onConfirm: (user: AdminUser) => void;
}

export function PermanentDeleteModal({
  open,
  onOpenChange,
  user,
  onConfirm,
}: PermanentDeleteModalProps) {
  const [confirmValue, setConfirmValue] = useState('');
  const canDelete = confirmValue === CONFIRM_TEXT;

  const handleClose = () => {
    onOpenChange(false);
    setConfirmValue('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canDelete) return;
    onConfirm(user);
    handleClose();
  };

  if (!user) return null;
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
        else onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogClose
            onClick={handleClose}
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
            Permanent Deletion
          </DialogTitle>
        </DialogHeader>

        <div className="bg-red-500 text-white rounded-lg p-3 flex gap-2 items-center mb-4">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="font-medium">
            WARNING: This action is irreversible!
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          You are about to permanently delete {fullName} from the database. All
          associated data will be lost.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="confirm-delete">
              Type &quot;{CONFIRM_TEXT}&quot; to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              placeholder={CONFIRM_TEXT}
              className="mt-1 font-mono"
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mt-1">
              This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canDelete}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Permanently Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
