/**
 * Generates a fallback image URL using placehold.co
 * @param text The text to display on the placeholder (Business or Service name)
 * @returns Encoded URL string
 */
export const getFallbackImage = (text: string): string => {
    const encodedText = encodeURIComponent(text);
    return `https://placehold.co/600x400.png?font=raleway&text=${encodedText}`;
};
