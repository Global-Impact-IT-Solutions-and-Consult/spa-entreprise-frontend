"use client";

import { Box, VStack, Text, Icon, Center } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

interface ActionCardProps {
    title: string;
    subtitle?: string;
    onClick?: () => void;
    variant?: "default" | "ghost" | "outline";
}

export default function ActionCard({ title, subtitle, onClick, variant = "default" }: ActionCardProps) {
    const isGhost = variant === "ghost"; // For the transparent one

    return (
        <Box
            as="button"
            onClick={onClick}
            borderWidth={isGhost ? "1px" : "2px"}
            borderStyle={isGhost ? "dashed" : "dashed"} // Screenshot shows dashed for both generally, but maybe solid for white. Keeping dashed for consistency unless specified. Actually Image 0 shows dashed.
            borderColor="gray.200"
            borderRadius="2xl"
            p={8}
            width="100%"
            maxW="350px"
            minH="200px"
            bg={isGhost ? "transparent" : "white"}
            _hover={{ bg: "gray.50", borderColor: "teal.400" }}
            transition="all 0.2s"
        >
            <Center height="100%">
                <VStack gap={3}>
                    <Center
                        bg="#DAE3E3" // Specific color from screenshot (light teal/gray mix)
                        w="16" // Larger circle
                        h="16"
                        borderRadius="full"
                    >
                        <Icon as={FiPlus} color="#1D4044" boxSize={6} />
                    </Center>
                    <VStack gap={0}>
                        <Text fontWeight="bold" fontSize="lg" color="gray.600">{title}</Text>
                        {subtitle && <Text fontSize="sm" color="gray.500">{subtitle}</Text>}
                    </VStack>
                </VStack>
            </Center>
        </Box>
    );
}
