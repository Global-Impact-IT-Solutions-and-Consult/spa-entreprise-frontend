"use client";

import { Box, Checkbox, Text, VStack, NumberInput } from "@chakra-ui/react";
import { FiCheck } from "react-icons/fi";

interface ServiceCardProps {
    title: string;
    description: string;
    duration: number;
    price: number;
    isSelected?: boolean;
    onSelect?: (isSelected: boolean) => void;
    onDurationChange?: (val: number) => void;
    onPriceChange?: (val: number) => void;
}

export default function ServiceCard({
    title,
    description,
    duration,
    price,
    isSelected = false,
    onSelect,
    onDurationChange,
    onPriceChange
}: ServiceCardProps) {
    return (
        <Box
            borderWidth="1px"
            borderRadius="xl"
            p={5}
            bg={isSelected ? "#E6FFFA" : "white"} // Light teal for selected
            borderColor={isSelected ? "teal.600" : "gray.200"}
            boxShadow="sm"
            width="100%"
            maxW="350px"
            position="relative"
            transition="all 0.2s"
        >
            <Box position="absolute" top={5} right={5}>
                <Checkbox.Root
                    checked={isSelected}
                    onCheckedChange={(e) => onSelect?.(!!e.checked)}
                    size="md"
                    colorPalette="teal"
                    variant="outline"
                >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control borderRadius="md" borderWidth="2px" borderColor={isSelected ? "teal.600" : "gray.400"}>
                        <Checkbox.Indicator>
                            <FiCheck />
                        </Checkbox.Indicator>
                    </Checkbox.Control>
                </Checkbox.Root>
            </Box>

            <VStack align="stretch" gap={5}>
                <VStack align="start" gap={1} pr={8}>
                    <Text fontWeight="bold" fontSize="md" color="gray.900">{title}</Text>
                    <Text fontSize="xs" color="gray.500" lineHeight="short">{description}</Text>
                </VStack>

                <Box>
                    <Text fontSize="xs" mb={1.5} color="gray.500" fontWeight="medium">Duration (minutes)</Text>
                    <NumberInput.Root
                        value={duration.toString()}
                        onValueChange={(e) => onDurationChange?.(Number(e.value))}
                        min={0}
                        size="md"
                    >
                        <NumberInput.Input
                            bg={isSelected ? "white" : "#F7FAFC"}
                            borderColor="gray.200"
                            borderRadius="md"
                            _focus={{ borderColor: "teal.500", boxShadow: "none" }}
                            fontSize="sm"
                        />
                        <NumberInput.Control>
                            <NumberInput.IncrementTrigger color="gray.500" />
                            <NumberInput.DecrementTrigger color="gray.500" />
                        </NumberInput.Control>
                    </NumberInput.Root>
                </Box>

                <Box>
                    <Text fontSize="xs" mb={1.5} color="gray.500" fontWeight="medium">Price (₦)</Text>
                    <NumberInput.Root
                        value={price.toString()}
                        onValueChange={(e) => onPriceChange?.(Number(e.value))}
                        min={0}
                        size="md"
                    >
                        <NumberInput.Input
                            bg={isSelected ? "white" : "#F7FAFC"}
                            borderColor="gray.200"
                            borderRadius="md"
                            _focus={{ borderColor: "teal.500", boxShadow: "none" }}
                            fontSize="sm"
                        />
                        <NumberInput.Control>
                            <NumberInput.IncrementTrigger color="gray.500" />
                            <NumberInput.DecrementTrigger color="gray.500" />
                        </NumberInput.Control>
                    </NumberInput.Root>
                </Box>
            </VStack>
        </Box>
    );
}
