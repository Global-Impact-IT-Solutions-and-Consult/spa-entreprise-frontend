import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconType } from "react-icons"
import { cn } from "@/lib/utils"
import { FiEye, FiEyeOff } from "react-icons/fi";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    leftIcon?: IconType;
    error?: string;
    labelClassName?: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
    ({ className, label, leftIcon: LeftIcon, error, type, labelClassName, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isPassword = type === 'password';

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
        };

        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <Label className={cn("text-sm font-medium text-gray-400", labelClassName)}>
                        {label}
                    </Label>
                )}
                <div className="relative group">
                    {LeftIcon && !isPassword && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E59622] transition-colors">
                            <LeftIcon size={20} />
                        </div>
                    )}

                    {isPassword && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E59622] transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                    )}

                    <Input
                        type={inputType}
                        className={cn(
                            "h-[56px] w-full rounded-lg border border-gray-400 bg-white px-4 py-1 text-base text-gray-900 placeholder:text-gray-300 focus:ring-0 focus:ring-[#E59622] transition-all outline-none",
                            (LeftIcon || isPassword) && "pl-12",
                            isPassword && "pr-12",
                            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                        </button>
                    )}
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        )
    }
)
CustomInput.displayName = "CustomInput"

export default CustomInput
