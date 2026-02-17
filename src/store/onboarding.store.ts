import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RegisterBusinessDto, CreateServiceDto, OperatingHours } from '@/services/business.service';

interface OnboardingState {
    step: number;
    businessId: string | null;
    businessInfo: Partial<RegisterBusinessDto>;
    operatingHours: OperatingHours; // Using OperatingHours interface
    services: CreateServiceDto[];
    tempCredentials?: { email: string; password: string }; // For MFA setup flow

    // Actions
    setStep: (step: number) => void;
    setBusinessId: (id: string) => void;
    setBusinessInfo: (info: Partial<RegisterBusinessDto>) => void;
    setOperatingHours: (hours: OperatingHours) => void;
    addService: (service: CreateServiceDto) => void;
    removeService: (index: number) => void;
    setTempCredentials: (creds: { email: string; password: string }) => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            step: 1,
            businessId: null,
            businessInfo: {},
            operatingHours: {},
            services: [],
            tempCredentials: undefined,

            setStep: (step) => set({ step }),
            setBusinessId: (id) => set({ businessId: id }),
            setBusinessInfo: (info) => set((state) => ({ businessInfo: { ...state.businessInfo, ...info } })),
            setOperatingHours: (hours) => set({ operatingHours: hours }),
            addService: (service) => set((state) => ({ services: [...state.services, service] })),
            removeService: (index) => set((state) => ({ services: state.services.filter((_, i) => i !== index) })),
            setTempCredentials: (creds) => set({ tempCredentials: creds }),
            reset: () => set({ step: 1, businessId: null, businessInfo: {}, operatingHours: {}, services: [], tempCredentials: undefined }),
        }),
        {
            name: 'onboarding-storage',
        }
    )
);
