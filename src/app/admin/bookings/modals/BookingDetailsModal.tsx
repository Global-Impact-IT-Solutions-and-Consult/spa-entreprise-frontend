'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import type { AdminBookingDetail } from '@/services/admin.service';

interface BookingDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: AdminBookingDetail | null;
}

function formatBookedOn(bookedOn: string) {
  try {
    const d = new Date(bookedOn);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return bookedOn;
  }
}

export function BookingDetailsModal({
  open,
  onOpenChange,
  booking,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const { customer, businessAndService, schedule, payment } = booking;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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
            Booking Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">
              Customer Information
            </h4>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span> {customer.name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {customer.email}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Phone:</span> {customer.phone}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">User ID:</span> {customer.id}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">
              Business & Service
            </h4>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Business:</span>{' '}
              {businessAndService.businessName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Service:</span>{' '}
              {businessAndService.serviceName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Duration:</span>{' '}
              {businessAndService.duration} minutes
            </p>
            {businessAndService.staffName && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Staff:</span>{' '}
                {businessAndService.staffName}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Schedule</h4>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span> {schedule.date}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Time:</span> {schedule.time}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Booked On:</span>{' '}
              {formatBookedOn(schedule.bookedOn)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
