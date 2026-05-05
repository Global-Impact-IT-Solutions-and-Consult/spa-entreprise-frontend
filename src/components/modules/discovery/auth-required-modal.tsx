import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthRequiredModalProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    title?: string;
    description?: string;
}

export function AuthRequiredModal({ 
    isOpen, 
    onClose, 
    title = "Sign In Required", 
    description = "Create an account to save your favorite businesses and services. Keep track of what you love and book faster!" 
}: AuthRequiredModalProps) {
    const router = useRouter();

    const handleLoginClick = () => {
        onClose(false);
        router.push('/auth/login');
    };

    const handleRegisterClick = () => {
        onClose(false);
        router.push('/auth/register');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl p-0 overflow-hidden border-none text-center">
                <div className="p-8">
                    <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                    </div>
                    
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold text-gray-900 text-center">{title}</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 font-medium text-center mt-2 leading-relaxed">
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <Button
                            onClick={handleLoginClick}
                            className="w-full h-12 bg-[#E89D24] hover:bg-[#E5A800] text-white font-bold rounded-xl shadow-lg shadow-yellow-500/20"
                        >
                            Log In to Account
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleRegisterClick}
                            className="w-full h-12 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 rounded-xl"
                        >
                            Create an Account
                        </Button>
                        <button
                            onClick={() => onClose(false)}
                            className="w-full mt-2 py-2 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors underline-offset-4 hover:underline"
                        >
                            Continue Browsing
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
