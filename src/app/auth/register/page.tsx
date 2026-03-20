'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import CustomInput from '@/components/ui/InputGroup';
import { toaster } from "@/components/ui/toaster";
import { authService } from '@/services/auth.service';
import { useOnboardingStore } from '@/store/onboarding.store';
import { cn } from '@/lib/utils';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { handleApiError } from '@/lib/api';

type AccountType = 'customer' | 'business';

export default function RegisterPage() {
    const router = useRouter();
    const { setTempCredentials } = useOnboardingStore();
    const [accountType, setAccountType] = useState<AccountType>('customer');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [strength, setStrength] = useState({
        length: false,
        number: false,
        special: false,
        uppercase: false,
        lowercase: false,
    });

    useEffect(() => {
        setStrength({
            length: password.length >= 8,
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
        });
    }, [password]);

    const strengthPercent = Object.values(strength).filter(Boolean).length * 20;

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            toaster.create({ title: "Please fill all fields", type: "error" });
            return;
        }

        if (password !== confirmPassword) {
            toaster.create({ title: "Passwords do not match", type: "error" });
            return;
        }

        if (!acceptedTerms) {
            toaster.create({ title: "Please accept the Terms of Service", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            await authService.register({
                email,
                password,
                first_name: firstName,
                last_name: lastName,
                role: accountType
            });

            toaster.create({
                title: "Account created",
                description: "Please check your email for verification.",
                type: "success",
            });

            setTempCredentials({ email: email, password: password });
            router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&role=${accountType}`);

        } catch (error) {
            handleApiError(error, "Registration Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            {/* Role Picker */}
            <div className="flex justify-center mb-6">
                <div className="bg-gray-100 p-1 rounded-full inline-flex">
                    <button
                        type="button"
                        onClick={() => setAccountType('customer')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                            accountType === 'customer'
                                ? "bg-[#6C5CE7] text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        User
                    </button>
                    <button
                        type="button"
                        onClick={() => setAccountType('business')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                            accountType === 'business'
                                ? "bg-[#6C5CE7] text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Businesses
                    </button>
                </div>
            </div>

            <div className="flex flex-col text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-inter">Create an account</h1>
                <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-[#E59622] hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>

            <div className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row gap-4">
                    <CustomInput
                        label="First Name"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <CustomInput
                        label="Last Name"
                        type="text"
                        placeholder="John"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>

                <CustomInput
                    label="Email"
                    type="email"
                    placeholder="example@example.com"
                    leftIcon={FiMail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <CustomInput
                    label="Password"
                    type="password"
                    placeholder="********"
                    leftIcon={FiLock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* Password Strength Indicator */}
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-gray-400">Password Strength</p>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-300",
                                strengthPercent < 66 ? "bg-red-500" : strengthPercent < 100 ? "bg-yellow-500" : "bg-green-500"
                            )}
                            style={{ width: `${strengthPercent}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center border", Object.values(strength).every(Boolean) ? "bg-green-500 border-green-500" : "border-gray-200")}>
                            {Object.values(strength).every(Boolean) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span className="text-xs text-gray-500">
                            At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
                        </span>
                    </div>
                </div>

                <CustomInput
                    label="Confirm Password"
                    type="password"
                    placeholder="********"
                    leftIcon={FiLock}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <div className="flex items-start gap-3">
                    <div className="relative flex items-center mt-0.5">
                        <input
                            type="checkbox"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:bg-[#E59622] checked:border-[#E59622]"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                        />
                        <svg
                            className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <label className="text-[13px] leading-relaxed text-gray-500">
                        I agree to the <Link href="/terms" className="text-[#E59622] font-semibold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#E59622] font-semibold hover:underline">Privacy Policy</Link>.
                        {accountType === 'business' && ' I confirm that i have the authority to register this business.'}
                    </label>
                </div>

                <Button
                    size="lg"
                    className="w-full h-[56px] rounded-lg bg-[#E59622] text-lg font-bold hover:bg-[#d48a1f] transition-colors text-white mt-2"
                    onClick={handleRegister}
                    disabled={isLoading || !acceptedTerms}
                >
                    {isLoading ? "Creating..." : "Create Account"}
                </Button>

                <SocialButtons />
            </div>
        </AuthLayout>
    );
}
