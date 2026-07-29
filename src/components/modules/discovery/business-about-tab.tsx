"use client";

interface BusinessAboutTabProps {
    businessName: string;
    description: string;
}

export function BusinessAboutTab({ businessName, description }: BusinessAboutTabProps) {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 p-5 md:p-10 shadow-sm transition-all hover:shadow-md">
            <h2 className="text-[17px] md:text-3xl font-bold text-gray-900 mb-3 md:mb-6 tracking-tight">
                About {businessName}
            </h2>
            <div className="space-y-4 md:space-y-6">
                {description.split('\n\n').map((para, i) => (
                    <p key={i} className="text-gray-500 leading-relaxed text-sm md:text-lg font-medium">
                        {para}
                    </p>
                ))}
            </div>
        </div>
    );
}
