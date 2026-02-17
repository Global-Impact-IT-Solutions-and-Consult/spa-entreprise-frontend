"use client";

import Image from "next/image";

interface BusinessGalleryTabProps {
    images: string[];
}

export function BusinessGalleryTab({ images }: BusinessGalleryTabProps) {
    // Ensure we have at least 6 items for a nice grid
    const displayImages = [...images, ...Array(Math.max(0, 6 - images.length)).fill(null)];

    return (
        <div className="space-y-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Gallery</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayImages.map((img, i) => (
                    <div key={i} className="group relative aspect-square rounded-3xl overflow-hidden bg-gray-100 border border-gray-50 shadow-sm hover:shadow-md transition-all">
                        {img ? (
                            <Image
                                src={img}
                                alt={`Business Gallery ${i + 1}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                                <span className="text-4xl">📸</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                    </div>
                ))}
            </div>
        </div>
    );
}
