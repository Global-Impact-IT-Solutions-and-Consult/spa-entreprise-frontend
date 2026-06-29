import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
export const ACCEPTED_IMAGE_EXTENSIONS = "image/jpeg,image/png";

export function validateImageFile(file: File): string | null {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return "Please select a valid image file (JPEG or PNG).";
    }
    if (file.size > MAX_FILE_SIZE) {
        return "File size must be less than 1MB.";
    }
    return null;
}
