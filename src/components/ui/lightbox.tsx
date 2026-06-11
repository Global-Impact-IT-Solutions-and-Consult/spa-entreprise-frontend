"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
    images: Array<string | { url: string; caption?: string | null }>;
    initialIndex: number;
    onClose: () => void;
}

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
    const [index, setIndex] = useState(initialIndex);
    const [mounted, setMounted] = useState(false);

    // Set mounted on client to enable portal rendering
    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync state if initialIndex updates
    useEffect(() => {
        setIndex(initialIndex);
    }, [initialIndex]);

    const getImageUrl = (item: any) => typeof item === 'string' ? item : item.url;
    const getImageCaption = (item: any) => typeof item === 'string' ? null : item.caption;

    const handlePrev = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                handleNext();
            } else if (e.key === "ArrowLeft") {
                handlePrev();
            } else if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleNext, handlePrev, onClose]);

    if (images.length === 0 || index < 0 || index >= images.length) return null;

    const currentImage = images[index];
    const imageUrl = getImageUrl(currentImage);
    const imageCaption = getImageCaption(currentImage);

    const lightboxContent = (
        <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Top status bar & close button */}
            <div className="absolute top-6 inset-x-6 flex items-center justify-between text-white z-10 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                <span className="text-sm font-semibold bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full select-none">
                    Photo {index + 1} of {images.length}
                </span>
                <button
                    onClick={onClose}
                    className="p-2.5 bg-black/80 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-all shadow-md hover:scale-105 active:scale-95"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="relative max-w-4xl h-full w-full flex items-center justify-center">
                <div className="relative w-full h-[80vh]">
                    <Image
                        src={imageUrl}
                        alt={imageCaption || "Gallery image"}
                        fill
                        className="object-contain rounded-2xl select-none animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
                {imageCaption && (
                    <div className="absolute bottom-4 inset-x-4 text-center">
                        <p className="text-white text-sm font-medium bg-[#000000]/40 backdrop-blur-md rounded-xl px-4 py-2 inline-block">
                            {imageCaption}
                        </p>
                    </div>
                )}

                {/* Navigation Chevrons inside the relative container */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-90 backdrop-blur-md rounded-full text-white transition-all shadow-lg z-10"
                            title="Previous Image"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-90 backdrop-blur-md rounded-full text-white transition-all shadow-lg z-10"
                            title="Next Image"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    if (mounted && typeof document !== "undefined") {
        return createPortal(lightboxContent, document.body);
    }

    return null;
}
