"use client";

import { Box, HStack, VStack, Text, Button, Avatar, Badge, Icon } from "@chakra-ui/react";
import { FiEdit2 } from "react-icons/fi";
import { BsDot } from "react-icons/bs";

interface StaffCardProps {
    name: string;
    role: string;
    tags: string[];
    onEdit?: () => void;
}

export default function StaffCard({ name, role, tags, onEdit }: StaffCardProps) {
    return (
        <Box
            borderWidth="1px"
            borderRadius="2xl"
            p={5}
            bg="white"
            borderColor="gray.200"
            boxShadow="sm"
            width="100%"
            maxW="300px"
        >
            <HStack gap={4} align="start" mb={4}>
                <Avatar.Root size="md" bg="teal.700" color="white">
                    <Avatar.Fallback name={name} />
                    <Avatar.Image />
                </Avatar.Root>
                <VStack align="start" gap={0}>
                    <Text fontWeight="bold" fontSize="md" color="gray.800">{name}</Text>
                    <Text fontSize="sm" color="gray.600">{role}</Text>
                </VStack>
            </HStack>

            <VStack align="start" gap={1} mb={6}>
                {tags.map((tag, index) => (
                    <HStack key={index} gap={1}>
                        <Icon as={BsDot} color="teal.500" />
                        <Text fontSize="sm" color="gray.600">{tag}</Text>
                    </HStack>
                ))}
            </VStack>

            <Button
                size="sm"
                bg="teal.700"
                color="white"
                _hover={{ bg: "teal.800" }}
                borderRadius="full"
                px={6}
                fontSize="xs"
                onClick={onEdit}
            >
                Edit
            </Button>
        </Box>
    );
}
