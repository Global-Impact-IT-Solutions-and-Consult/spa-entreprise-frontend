'use client';

import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { authService } from '@/services/auth.service';

export const SocialButtons = () => {
    return (
        <div className="flex flex-col items-center gap-6 mt-8">
            <div className="flex items-center w-full gap-4">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-400 font-medium">or sign up with</span>
                <div className="h-px bg-gray-200 flex-1" />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => authService.googleLogin()}
                    className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                    aria-label="Sign up with Google"
                >
                    <FcGoogle size={24} />
                </button>
                <button
                    className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                    aria-label="Sign up with Facebook"
                >
                    <FaFacebook size={24} color="#1877F2" />
                </button>
            </div>
        </div>
    );
};
