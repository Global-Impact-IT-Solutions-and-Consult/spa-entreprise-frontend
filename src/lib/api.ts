import { toaster } from "@/components/ui/toaster";

/**
 * Normalize API error data to a human-readable string.
 * Handles the standard validation error format: { message: string, errors?: [{ field: string, messages: string[] }] }
 * Also handles simple message strings or arrays of strings.
 */
interface ApiErrorData {
    message?: string | string[];
    errors?: Array<{
        field?: string;
        messages?: string | string[];
    }>;
}

export function normalizeApiMessage(data: unknown): string {
    if (!data || typeof data !== 'object') {
        return typeof data === 'string' ? data : "An error occurred";
    }

    const errorData = data as ApiErrorData;

    // 1. Handle structured validation errors array
    if (errorData.errors && Array.isArray(errorData.errors)) {
        return errorData.errors
            .map((err) => {
                const fieldName = err.field 
                    ? `${err.field.charAt(0).toUpperCase() + err.field.slice(1)}: ` 
                    : "";
                const messages = Array.isArray(err.messages) 
                    ? err.messages.join(". ") 
                    : String(err.messages || "");
                return `${fieldName}${messages}`;
            })
            .join("; ");
    }

    // 2. Handle simple message property (string or array of strings)
    const message = errorData.message;
    if (Array.isArray(message)) {
        return message.length ? String(message[0]) : "An error occurred";
    }
    if (typeof message === "string") return message;

    // 3. Fallback to basic stringification if it's just a string or other simple type
    return "An error occurred";
}

/**
 * True when a request was sent but never got a response (offline, DNS
 * failure, CORS, timeout) — axios's signature for "the network itself
 * failed," as opposed to a server-returned error.
 */
export function isNetworkError(error: unknown): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    return !err?.response && !!err?.request;
}

/**
 * High-level error handler that parses an API error and shows a toaster notification.
 * @param error - The error object from a catch block (usually Axios error)
 * @param title - Optional title for the toaster notification
 */
export function handleApiError(error: unknown, title: string = "Error") {
    // Surface one clear, consistent message for network failures instead of
    // whatever generic fallback normalizeApiMessage(undefined) would give.
    if (isNetworkError(error)) {
        toaster.create({
            title: "You're offline",
            description: "Check your connection and try again.",
            type: "error",
        });
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (error as any)?.response?.data;
    const message = normalizeApiMessage(data);
    toaster.create({
        title,
        description: message,
        type: "error"
    });
}
