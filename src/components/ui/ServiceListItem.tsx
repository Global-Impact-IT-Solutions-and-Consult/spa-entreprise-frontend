"use client";

import { Box, HStack, VStack, Text, Badge, IconButton } from "@chakra-ui/react";
import { FiEdit2, FiTrash2, FiUser } from "react-icons/fi";

interface ServiceListItemProps {
    title: string;
    price: string;
    duration: string;
    description: string;
    tags: string[];
    staffCount: number;
}

export default function ServiceListItem({ title, price, duration, description, tags, staffCount }: ServiceListItemProps) {
    return (
        <Box
            bg="white"
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.100"
            width="100%"
            maxW="600px" // Approximate width from screenshot
        >
            <HStack justify="space-between" align="start" mb={3}>
                <VStack align="start" gap={1}>
                    <Text fontWeight="bold" fontSize="lg" color="gray.900">{title}</Text>
                    <HStack gap={2}>
                        {tags.map((tag, i) => (
                            <Badge key={i} colorPalette="gray" variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="md">
                                {tag}
                            </Badge>
                        ))}
                    </HStack>
                </VStack>
                <VStack align="end" gap={0}>
                    <Text fontWeight="bold" fontSize="lg" color="gray.900">{price}</Text>
                    <Text fontSize="xs" color="gray.500">{duration}</Text>
                </VStack>
            </HStack>

            <Text fontSize="sm" color="gray.600" mb={4} lineHeight="relaxed">
                {description}
            </Text>

            <HStack justify="space-between" pt={4} borderTopWidth="1px" borderColor="gray.100">
                <HStack gap={2} color="gray.600">
                    <FiUser />
                    <Text fontSize="sm">{staffCount} Staff Assigned</Text>
                </HStack>

                <HStack gap={2}>
                    <IconButton
                        aria-label="Edit"
                        variant="ghost"
                        color="teal.600"
                        size="sm"
                    >
                        <FiEdit2 />
                    </IconButton>
                    <IconButton
                        aria-label="Delete"
                        variant="ghost"
                        color="red.500"
                        size="sm"
                    >
                        <FiTrash2 />
                    </IconButton>
                </HStack>
            </HStack>
        </Box>
    );
}
