"use client";

import { Badge } from "@chakra-ui/react";

interface StatusBadgeProps {
    status: "confirmed" | "pending";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const colorScheme = status === "confirmed" ? "green" : "orange";
    // Custom styling to match design more closely if standard schemes aren't enough
    const bg = status === "confirmed" ? "green.100" : "orange.100";
    const color = status === "confirmed" ? "green.800" : "orange.800";

    return (
        <Badge
            bg={bg}
            color={color}
            px={3}
            py={1}
            borderRadius="full"
            textTransform="lowercase"
            fontSize="xs"
            fontWeight="bold"
        >
            {status}
        </Badge>
    );
}
