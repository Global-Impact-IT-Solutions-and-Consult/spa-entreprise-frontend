"use client";

import { Box, Text, VStack, HStack, Icon, Center } from "@chakra-ui/react";
import { FiDollarSign, FiHome } from "react-icons/fi"; // Using closest approximations
import { IconType } from "react-icons";

interface RevenueCardProps {
    amount: string;
    percentageChange: string; // e.g., "12% from yesterday"
}

export function RevenueCard({ amount, percentageChange }: RevenueCardProps) {
    return (
        <Box
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            borderWidth="1px"
            width="250px"
        >
            <VStack align="start" spacing={1} mb={4}>
                <HStack justify="space-between" width="100%">
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Today's<br />Revenue</Text>
                    <Box bg="gray.100" p={1} borderRadius="md">
                        <Icon as={FiDollarSign} color="teal.600" />
                    </Box>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="black">{amount}</Text>
            </VStack>
            <Text fontSize="xs" color="teal.600">{percentageChange}</Text>
        </Box>
    );
}

interface QuickLinkCardProps {
    icon?: IconType;
    title: string;
    subtitle?: string;
    isActive?: boolean;
}

export function QuickLinkCard({ icon = FiHome, title, subtitle, isActive = false }: QuickLinkCardProps) {
    return (
        <HStack
            bg={isActive ? "#5C7C7E" : "#EDF2F7"} // Dark slate teal for active, Light gray for inactive
            p={4}
            borderRadius="lg"
            width="100%"
            minW="200px"
            spacing={4}
            cursor="pointer"
            transition="all 0.2s"
        >
            <Center bg="transparent" w={10} h={10} color={isActive ? "white" : "gray.600"}>
                <Icon as={icon} boxSize={6} />
            </Center>
            <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="md" color={isActive ? "white" : "gray.800"}>{title}</Text>
                {subtitle && <Text fontSize="xs" color={isActive ? "gray.200" : "gray.500"}>{subtitle}</Text>}
            </VStack>
        </HStack>
    )
}

export function MenuLinkCard({ title, isActive = false }: { title: string, isActive?: boolean }) {
    return (
        <HStack
            bg={isActive ? "teal.600" : "gray.100"}
            p={4}
            borderRadius="lg"
            width="200px"
            spacing={3}
            color={isActive ? "white" : "gray.700"}
        >
            <Icon as={FiHome} color={isActive ? "white" : "gray.500"} boxSize={5} />
            <Text fontWeight="medium" fontSize="md">{title}</Text>
        </HStack>
    )
}
