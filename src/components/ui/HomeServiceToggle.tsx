"use client";

import { Box, VStack, Text, Icon, SimpleGrid, Center } from "@chakra-ui/react";
import { FiHome, FiMapPin, FiRepeat } from "react-icons/fi"; // Icons for In-Location, Home Service, Both

type ServiceType = "in-location" | "home" | "both";

interface ServiceTypeToggleProps {
    selected?: ServiceType;
    onChange?: (type: ServiceType) => void;
}

export default function ServiceTypeToggle({ selected, onChange }: ServiceTypeToggleProps) {
    const options: { id: ServiceType; label: string; icon: any }[] = [
        { id: "in-location", label: "In-Location Only", icon: FiMapPin },
        { id: "home", label: "Home Service Only", icon: FiHome },
        { id: "both", label: "Both", icon: FiRepeat },
    ];

    return (
        <SimpleGrid columns={3} spacing={4} width="100%" maxW="600px">
            {options.map((option) => {
                const isSelected = selected === option.id;
                return (
                    <Box
                        key={option.id}
                        onClick={() => onChange?.(option.id)}
                        borderWidth="1px"
                        borderRadius="lg"
                        p={6}
                        bg={isSelected ? "teal.50" : "white"}
                        borderColor={isSelected ? "teal.500" : "gray.200"}
                        cursor="pointer"
                        _hover={{ shadow: "md" }}
                        transition="all 0.2s"
                    >
                        <Center flexDirection="column">
                            <Icon
                                as={option.icon}
                                boxSize={6}
                                mb={3}
                                color={isSelected ? "teal.600" : "gray.500"}
                            />
                            <Text
                                fontSize="sm"
                                fontWeight={isSelected ? "bold" : "normal"}
                                color={isSelected ? "teal.800" : "black"}
                                textAlign="center"
                            >
                                {option.label}
                            </Text>
                        </Center>
                    </Box>
                );
            })}
        </SimpleGrid>
    );
}
