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
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';

interface CancelBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | null;
  onConfirm: (reason: string, notify: boolean) => Promise<void>;
}

const MIN_REASON_LENGTH = 10;

export function CancelBookingModal({
  open,
  onOpenChange,
  bookingId,
  onConfirm,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState('');
  const [notify, setNotify] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || reason.trim().length < MIN_REASON_LENGTH) return;
    setLoading(true);
    try {
      await onConfirm(reason.trim(), notify);
      onOpenChange(false);
      setReason('');
      setNotify(true);
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId) return null;

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
            Cancel Booking
          </DialogTitle>
        </DialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start mb-4">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            You are about to cancel booking #{bookingId.slice(0, 8)}. This
            action cannot be undone and will notify the customer and business.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cancel-reason">Reason for Cancellation *</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Please explain why this booking is being cancelled. This message will be shared with the customer and the business."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 min-h-[100px]"
              required
              minLength={MIN_REASON_LENGTH}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum {MIN_REASON_LENGTH} characters required.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="cancel-notify"
              checked={notify}
              onCheckedChange={(c) => setNotify(!!c)}
            />
            <Label
              htmlFor="cancel-notify"
              className="font-normal cursor-pointer"
            >
              Notify customer and business (email)
            </Label>
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
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={reason.trim().length < MIN_REASON_LENGTH || loading}
            >
              {loading ? 'Cancelling...' : 'Confirm cancellation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
