import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, Image as ImageIcon, Share2 } from "lucide-react";
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
    qrCode?: string | null;
}

export function ShareBusinessModal({ 
    isOpen, 
    onClose, 
    businessUrl, 
    businessName,
    title = "Share Business",
    description = "Share this business profile with your friends and family.",
    qrCode
}: ShareBusinessModalProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(businessUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toaster.create({ title: "Link copied to clipboard", type: "success" });
    };

    const handleDownloadQr = () => {
        if (!qrCode) return;
        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1600;
            canvas.height = 500;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, 1600, 500);
                const pngUrl = canvas.toDataURL('image/png');
                const element = document.createElement("a");
                element.href = pngUrl;
                element.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-qr-code.png`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                toaster.create({ title: "QR Code downloaded!", type: "success" });
            }
        };
        img.src = qrCode;
    };

    const handleCopyQrImage = async () => {
        if (!qrCode) return;
        try {
            const img = new window.Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = 1600;
                canvas.height = 500;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, 1600, 500);
                    canvas.toBlob(async (blob) => {
                        if (blob) {
                            try {
                                await navigator.clipboard.write([
                                    new ClipboardItem({
                                        [blob.type]: blob
                                    })
                                ]);
                                toaster.create({ title: "QR Code copied to clipboard!", type: "success" });
                            } catch (e) {
                                console.error(e);
                                toaster.create({ title: "Could not copy image. Try downloading it instead.", type: "error" });
                            }
                        }
                    }, 'image/png');
                }
            };
            img.src = qrCode;
        } catch (e) {
            console.error(e);
            toaster.create({ title: "Failed to copy QR Code", type: "error" });
        }
    };

    const handleShareQr = () => {
        if (!qrCode) return;
        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1600;
            canvas.height = 500;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, 1600, 500);
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        try {
                            const file = new File([blob], `${businessName.toLowerCase().replace(/\s+/g, '-')}-qr-code.png`, { type: 'image/png' });
                            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({
                                    files: [file],
                                    title: `${businessName} QR Code`,
                                    text: `Scan to book appointments at ${businessName}!`
                                });
                            } else {
                                toaster.create({ title: "Sharing files is not supported on this device.", type: "error" });
                            }
                        } catch (e) {
                            if ((e as Error).name !== 'AbortError') {
                                console.error(e);
                                toaster.create({ title: "Failed to share image", type: "error" });
                            }
                        }
                    }
                }, 'image/png');
            }
        };
        img.src = qrCode;
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
                        {qrCode && (
                            <div className="space-y-3 p-1 border border-gray-100 bg-gray-50/50 rounded-2xl">
                                <div className="relative aspect-[16/5] w-full overflow-hidden rounded-xl border border-gray-100 bg-white flex items-center justify-center">
                                    <img
                                        src={qrCode}
                                        alt={`${businessName} QR Code`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2 p-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleDownloadQr}
                                        className="h-9 text-xs font-bold rounded-lg border-gray-200 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center gap-1.5"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCopyQrImage}
                                        className="h-9 text-xs font-bold rounded-lg border-gray-200 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center gap-1.5"
                                    >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        Copy
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleShareQr}
                                        className="h-9 text-xs font-bold rounded-lg border-gray-200 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center gap-1.5"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        )}

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
