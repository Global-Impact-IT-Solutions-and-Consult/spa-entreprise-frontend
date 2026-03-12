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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminUser } from '../types';
import { Ban, AlertCircle } from 'lucide-react';

interface SuspendUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onConfirm: (user: AdminUser, reason: string) => void;
}

export function SuspendUserModal(props: SuspendUserModalProps) {
  const { open, onOpenChange, user, onConfirm } = props;
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    onConfirm(user, reason);
    onOpenChange(false);
    setReason('');
  };

  if (!user) return null;
  const fullName = user.firstName + ' ' + user.lastName;

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
            Suspend User
          </DialogTitle>
        </DialogHeader>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start mb-4">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            You are about to suspend {fullName}. They will not be able to access
            their account.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="suspend-reason">Reason for Suspension *</Label>
            <Textarea
              id="suspend-reason"
              placeholder="Please provide a reason, this will be sent to the user..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 min-h-[100px]"
              required
            />
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
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Ban className="h-4 w-4 mr-2" /> Suspend User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
