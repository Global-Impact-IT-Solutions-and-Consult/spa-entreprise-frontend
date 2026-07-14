'use client';

import { SessionTimeoutProvider } from '@/components/session/SessionTimeoutProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionTimeoutProvider>
            {children}
        </SessionTimeoutProvider>
    );
}
