"use client";

import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
    id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    date: string;
    comment: string;
    service: string;
    provider: string;
}

interface BusinessReviewsTabProps {
    rating: number;
    totalReviews: number;
    ratingDistribution: {
        stars: number;
        count: number;
    }[];
    reviews: Review[];
}

export function BusinessReviewsTab({ rating, totalReviews, ratingDistribution, reviews }: BusinessReviewsTabProps) {
    return (
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Review</h2>
                <Button className="bg-[#E89D24] hover:bg-[#E5A800] text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-yellow-500/10">
                    Write a Review
                </Button>
            </div>

            {/* Summary Box */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center gap-12">
                <div className="flex flex-col items-center text-center">
                    <div className="text-7xl font-bold text-gray-900 mb-4">{rating}</div>
                    <div className="flex items-center gap-1.5 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                className={`w-6 h-6 ${s <= Math.floor(rating) ? "fill-[#E89D24] text-[#E89D24]" : "text-gray-200"}`}
                            />
                        ))}
                    </div>
                    <div className="text-gray-400 font-bold">{totalReviews} reviews</div>
                </div>

                <div className="flex-1 w-full space-y-4">
                    {(ratingDistribution || []).slice().reverse().map((dist) => (
                        <div key={dist.stars} className="flex items-center gap-4">
                            <span className="text-sm font-bold text-gray-500 w-12">{dist.stars} stars</span>
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#E89D24] rounded-full"
                                    style={{ width: `${(dist.count / totalReviews) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-gray-900 w-8 text-right">{dist.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
                                    <AvatarImage src={review.userAvatar} />
                                    <AvatarFallback className="bg-gray-100 font-bold text-gray-600">
                                        {review.userName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{review.userName}</h4>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-[#E89D24] text-[#E89D24]" : "text-gray-200"}`}
                                            />
                                        ))}
                                        <span className="ml-2 text-xs text-gray-400 font-medium">{review.date}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-500 leading-relaxed font-medium mb-6">
                            {review.comment}
                        </p>

                        <div className="pt-6 border-t border-gray-50 flex items-center gap-4 text-sm font-bold text-gray-400">
                            <span>Service: <span className="text-gray-700">{review.service}</span></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                            <span>Barber: <span className="text-gray-700">{review.provider}</span></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
