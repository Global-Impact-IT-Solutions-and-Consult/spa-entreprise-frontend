"use client";

import * as React from "react";
import CustomInput from "./InputGroup";
import { Select } from "./select";
import { isValidPhoneNumber, isValidLocalPhoneNumber } from "@/lib/validation";
import { Phone } from "lucide-react";
import { Country } from "country-state-city";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface PhoneNumberInputProps extends Omit<React.ComponentProps<typeof CustomInput>, "value" | "onChange"> {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement> | any) => void;
    onValidationChange?: (isValid: boolean) => void;
}

const PhoneNumberInput = React.forwardRef<HTMLInputElement, PhoneNumberInputProps>(
    ({ value = "", onChange, error: externalError, onValidationChange, label, required, ...props }, ref) => {
        const [touched, setTouched] = React.useState(false);
        const [internalError, setInternalError] = React.useState<string | undefined>();

        // Countries sorted by name but Nigeria first as it's common in this's context
        const countryOptions = React.useMemo(() => {
            const allCountries = Country.getAllCountries();
            return allCountries
                .map(c => ({
                    label: `${c.flag} +${c.phonecode}`,
                    value: `+${c.phonecode}`,
                    name: c.name
                }))
                .sort((a, b) => {
                    if (a.value === "+234") return -1;
                    if (b.value === "+234") return 1;
                    return a.name.localeCompare(b.name);
                });
        }, []);

        // Split value into country code and local number
        const { currentCountryCode, currentLocalNumber } = React.useMemo(() => {
            // Find matched country code from list (longest match first)
            const sortedCodes = [...new Set(countryOptions.map(o => o.value))].sort((a, b) => b.length - a.length);
            const foundCode = sortedCodes.find(code => value.startsWith(code));
            
            if (foundCode) {
                let localPart = value.slice(foundCode.length);
                // Proactively strip leading zero from legacy data for display
                if (localPart.startsWith("0")) localPart = localPart.slice(1);
                
                return {
                    currentCountryCode: foundCode,
                    currentLocalNumber: localPart
                };
            }
            
            let fallbackLocal = value.startsWith("+") ? "" : value;
            if (fallbackLocal.startsWith("0")) fallbackLocal = fallbackLocal.slice(1);
            
            return {
                currentCountryCode: "+234",
                currentLocalNumber: fallbackLocal
            };
        }, [value, countryOptions]);

        const validatePhone = (fullValue: string, localVal: string) => {
            if (!localVal && required) {
                return "Phone number is required";
            }
            if (localVal && !isValidLocalPhoneNumber(localVal)) {
                return "Phone number must not start with zero and should be valid";
            }
            if (fullValue && !isValidPhoneNumber(fullValue)) {
                return "Please enter a valid phone number";
            }
            return undefined;
        };

        const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newCode = e.target.value;
            const newValue = `${newCode}${currentLocalNumber}`;
            if (onChange) onChange({ target: { name: props.name, value: newValue } });
            
            if (touched) {
                const err = validatePhone(newValue, currentLocalNumber);
                setInternalError(err);
                if (onValidationChange) onValidationChange(!err);
            }
        };

        const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let val = e.target.value.replace(/\D/g, ""); // Only digits
            
            // Re-enforce no leading zero if user somehow tries
            if (val.startsWith("0")) {
                val = val.slice(1);
            }

            const newValue = `${currentCountryCode}${val}`;
            if (onChange) onChange({ target: { name: props.name, value: newValue } });

            if (touched) {
                const err = validatePhone(newValue, val);
                setInternalError(err);
                if (onValidationChange) onValidationChange(!err);
            }
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setTouched(true);
            const err = validatePhone(value, currentLocalNumber);
            setInternalError(err);
            if (onValidationChange) onValidationChange(!err);
            if (props.onBlur) props.onBlur(e);
        };

        return (
            <div className="space-y-1.5 flex-1">
                {label && <Label className={props.labelClassName}>{label} {required && "*"}</Label>}
                <div className="flex gap-2">
                    <div className="w-[120px]">
                        <Select
                            options={countryOptions}
                            value={currentCountryCode}
                            onChange={handleCountryChange}
                            className={cn(
                                "h-[50px] rounded-xl",
                                (externalError || internalError) && "border-red-500 focus:ring-red-500"
                            )}
                        />
                    </div>
                    <div className="flex-1">
                        <CustomInput
                            {...props}
                            label="" // Already rendered at top
                            ref={ref}
                            type="tel"
                            value={currentLocalNumber}
                            onChange={handleLocalNumberChange}
                            onBlur={handleBlur}
                            leftIcon={Phone as any}
                            placeholder="800 123 4567"
                            className={cn(
                                "h-[50px] rounded-xl", 
                                props.className,
                                (externalError || internalError) && "border-red-500 focus:border-red-500 focus:ring-red-500"
                            )}
                        />
                    </div>
                </div>
                {(externalError || internalError) && (
                    <p className="text-xs text-red-500 mt-1 ml-1">{externalError || internalError}</p>
                )}
            </div>
        );
    }
);

PhoneNumberInput.displayName = "PhoneNumberInput";

export default PhoneNumberInput;
