import { IconType } from 'react-icons';
import {
    FaCut,
    FaPaintBrush,
    FaDumbbell,
    FaPaintRoller,
    FaStore,
    FaSpa,
    FaUser
} from 'react-icons/fa';
import { LucideIcon, Scissors, Brush, Dumbbell, Store, Sparkles, User } from 'lucide-react';

/**
 * Maps a FontAwesome icon code (e.g., 'fa-cut') to a React Icon component.
 * Fallback to Lucide icons if FA icon is not explicitly mapped or as default.
 */
export const getBusinessIcon = (iconUrl: string | undefined): IconType | undefined => {
    // if (!iconUrl) return Scissors;

    const code = iconUrl?.toLowerCase();

    // Mapping based on the provided business type response
    if (code?.includes('fa-cut')) return FaCut;
    if (code?.includes('fa-paint-brush')) return FaPaintBrush;
    if (code?.includes('fa-dumbbell')) return FaDumbbell;
    if (code?.includes('fa-paint-roller')) return FaPaintRoller;
    if (code?.includes('fa-store')) return FaStore;
    if (code?.includes('fa-spa')) return FaSpa;

    // Generic fallbacks
    if (code?.includes('cut') || code?.includes('scissor')) return Scissors;
    if (code?.includes('brush') || code?.includes('paint')) return Brush;
    if (code?.includes('fitness') || code?.includes('gym')) return Dumbbell;
    if (code?.includes('store') || code?.includes('shop')) return Store;
    if (code?.includes('spa') || code?.includes('wellness')) return Sparkles;
    if (code?.includes('user') || code?.includes('staff')) return User;

    // return Scissors; // Default fallback
};
