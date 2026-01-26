"use client";

import { Box, HStack, VStack, Text, Avatar, Badge, Icon } from "@chakra-ui/react";
import { FiClock } from "react-icons/fi";

interface AppointmentCardProps {
    name: string;
    role: string;
    time: string; // e.g., "2:00 PM - 3:00 PM"
    duration: string; // e.g., "60 mins"
    price: string; // e.g., "₦15,000"
    status: "confirmed" | "pending";
}

export default function AppointmentCard({ name, role, time, duration, price, status }: AppointmentCardProps) {
    const statusColor = status === "confirmed" ? "green" : "orange";

    return (
        <Box
            bg="white"
            p={4}
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            width="100%"
            maxW="400px"
        >
            <HStack justify="space-between" align="start" mb={2}>
                <HStack gap={3}>
                    {/* Placeholder for staff avatar if needed, or just text */}
                    <Box>
                        <Text fontWeight="bold" fontSize="md" color="gray.900">{name}</Text>
                        <Text fontSize="sm" color="gray.600">{role} • {duration}</Text>
                    </Box>
                </HStack>
                <Badge
                    colorPalette={statusColor}
                    variant="subtle"
                    borderRadius="full"
                    px={3}
                    fontSize="xs"
                    textTransform="lowercase"
                >
                    {status}
                </Badge>
            </HStack>

            <HStack justify="space-between" mt={4}>
                <HStack color="gray.600" gap={2}>
                    <Icon as={FiClock} />
                    <Text fontSize="sm">{time}</Text>
                </HStack>
                <Text fontWeight="bold" fontSize="md" color="gray.900">{price}</Text>
            </HStack>
        </Box>
    );
}
