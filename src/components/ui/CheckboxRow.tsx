"use client";

import { HStack, Text, Checkbox, Avatar, Box } from "@chakra-ui/react";

interface CheckboxRowProps {
    label: string;
    subLabel?: string;
    isChecked?: boolean;
    onChange?: (checked: boolean) => void;
}

export default function CheckboxRow({ label, subLabel, isChecked, onChange }: CheckboxRowProps) {
    return (
        <HStack
            gap={4}
            width="100%"
            p={3}
            _hover={{ bg: "gray.50" }}
            borderRadius="lg"
            cursor="pointer"
            onClick={() => onChange?.(!isChecked)}
        >
            <Checkbox.Root
                checked={isChecked}
                onCheckedChange={(e) => onChange?.(!!e.checked)}
                colorPalette="teal"
                size="md"
            >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
            </Checkbox.Root>

            <HStack gap={3}>
                <Avatar.Root size="sm" bg="gray.200">
                    <Avatar.Fallback name={label} color="gray.600" />
                </Avatar.Root>
                <Box>
                    <Text fontWeight="medium" fontSize="sm" color="gray.800">{label}</Text>
                    {subLabel && <Text fontSize="xs" color="gray.600">{subLabel}</Text>}
                </Box>
            </HStack>
        </HStack>
    );
}
