/**
 * Validates if the local part of a phone number is valid (no leading zero).
 */
export const isValidLocalPhoneNumber = (localPhone: string): boolean => {
    return /^[1-9]\d{6,14}$/.test(localPhone.replace(/[\s-()]/g, ''));
};

/**
 * Validates if a phone number is in international E.164 format.
 * Format: +[country code][number] (e.g., +2348001234567)
 * Total digits: 7 to 15.
 */
export const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};
