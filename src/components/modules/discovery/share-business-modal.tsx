import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { FaFacebook, FaWhatsapp, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

interface ShareBusinessModalProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    businessUrl: string;
    businessName: string;
    title?: string;
    description?: string;
}

export function ShareBusinessModal({ 
    isOpen, 
    onClose, 
    businessUrl, 
    businessName,
    title = "Share Business",
    description = "Share this business profile with your friends and family."
}: ShareBusinessModalProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(businessUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toaster.create({ title: "Link copied to clipboard", type: "success" });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-lg p-0 overflow-hidden border-none cursor-default">
                <div className="p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-lg font-bold text-gray-900">{title}</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 font-medium">
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="link" className="sr-only">Link</Label>
                                <Input
                                    id="link"
                                    defaultValue={businessUrl}
                                    readOnly
                                    className="h-10 text-sm bg-gray-50 border-gray-100 rounded-lg focus-visible:ring-[#E89D24]"
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={handleCopyLink}
                                className="h-10 px-4 text-sm bg-[#E89D24] hover:bg-[#D48616] text-white font-bold rounded-lg flex items-center gap-2 min-w-[100px]"
                            >
                                {isCopied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex justify-center gap-3 pt-4 border-t border-gray-50">
                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(businessUrl)}&text=${encodeURIComponent(`Check out ${businessName || 'this business'}!`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-[#E1E8ED] text-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                            >
                                <FaXTwitter className="w-4 h-4" />
                            </a>
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(businessUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-[#E4E6EB] text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors"
                            >
                                <FaFacebook className="w-4 h-4" />
                            </a>
                            <a
                                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${businessName || 'this business'}: ${businessUrl}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-[#E7F5ED] text-[#25D366] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-colors"
                            >
                                <FaWhatsapp className="w-4 h-4" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigator.clipboard.writeText(businessUrl);
                                    toaster.create({ title: "Link copied for Instagram!", type: "success" });
                                    setTimeout(() => {
                                        window.open('https://instagram.com', '_blank');
                                    }, 2000);
                                }}
                                className="w-10 h-10 rounded-full bg-pink-50 text-[#E4405F] flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-colors"
                            >
                                <FaInstagram className="w-4 h-4" />
                            </a>
                            <a
                                href="https://tiktok.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigator.clipboard.writeText(businessUrl);
                                    toaster.create({ title: "Link copied for TikTok!", type: "success" });
                                    setTimeout(() => {
                                        window.open('https://tiktok.com', '_blank');
                                    }, 2000);
                                }}
                                className="w-10 h-10 rounded-full bg-gray-100 text-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                            >
                                <FaTiktok className="w-4 h-4" />
                            </a>
                        </div>

                        <div className="flex justify-center pt-2">
                            <p className="text-xs text-gray-400 font-medium">
                                Publicly accessible at the link above
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
