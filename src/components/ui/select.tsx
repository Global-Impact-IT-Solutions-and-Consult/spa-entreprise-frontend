import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export interface SelectOption {
    label: string
    value: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    options?: SelectOption[]
    error?: string
    placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, options, error, placeholder, children, ...props }, ref) => {
        return (
            <div className="grid w-full gap-1.5">
                {label && <Label>{label}</Label>}
                <div className="relative">
                    <select
                        className={cn(
                            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                            className
                        )}
                        ref={ref}
                        value={props.value || ""}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options ? (
                            options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))
                        ) : children}
                    </select>
                    {/* Arrow Icon */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
        )
    }
)
Select.displayName = "Select"

export { Select }
