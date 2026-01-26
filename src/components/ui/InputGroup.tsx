"use client";

import { Input, InputGroup, Button, Field, Icon } from "@chakra-ui/react";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { IconType } from "react-icons";

interface CustomInputProps {
    label?: string;
    placeholder?: string;
    type?: string;
    leftIcon?: IconType;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CustomInput({ label, placeholder, type = "text", leftIcon, value, onChange }: CustomInputProps) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const handleClick = () => setShow(!show);

    return (
        <Field.Root>
            {label && <Field.Label fontSize="sm" fontWeight="bold" color="gray.700">{label}</Field.Label>}
            <InputGroup
                flex="1"
                startElement={
                    leftIcon && (
                        <Icon as={leftIcon} color="gray.500" />
                    )
                }
                endElement={
                    isPassword && (
                        <Button h="1.75rem" size="sm" onClick={handleClick} variant="ghost" color="gray.500">
                            {show ? <FiEyeOff /> : <FiEye />}
                        </Button>
                    )
                }
            >
                <Input
                    type={isPassword ? (show ? "text" : "password") : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    bg="white"
                    borderRadius="full"
                    height="12"
                    _focus={{ borderColor: "teal.500" }}
                    pl={leftIcon ? "10" : "4"}
                    color="gray.800"
                    _placeholder={{ color: "gray.400" }} // Placeholder can be slightly lighter but typical is 500/400
                    borderColor="gray.300"
                />
            </InputGroup>
        </Field.Root>
    );
}
