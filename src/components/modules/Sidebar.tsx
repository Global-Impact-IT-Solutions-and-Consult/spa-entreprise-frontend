"use client";

import { Box, VStack, HStack, Text, Icon, Link } from "@chakra-ui/react";
import { FiHome, FiBriefcase, FiCalendar, FiUsers, FiBarChart2, FiGrid } from "react-icons/fi";
import { IconType } from "react-icons";

interface SidebarItemProps {
    icon: IconType;
    label: string;
    isActive?: boolean;
}

const SidebarItem = ({ icon, label, isActive }: SidebarItemProps) => {
    return (
        <HStack
            spacing={4}
            w="100%"
            p={3}
            borderRadius="md"
            bg={isActive ? "teal.50" : "transparent"}
            color={isActive ? "teal.700" : "gray.600"}
            _hover={{ bg: "gray.50", cursor: "pointer" }}
        >
            <Icon as={icon} boxSize={5} />
            <Text fontSize="md" fontWeight={isActive ? "medium" : "normal"}>{label}</Text>
        </HStack>
    );
};

export default function Sidebar() {
    return (
        <Box w="250px" h="100vh" bg="white" borderRight="1px" borderColor="gray.100" p={6}>
            <VStack spacing={2} align="stretch" mt={10}>
                <SidebarItem icon={FiGrid} label="Dashboard" isActive />
                <SidebarItem icon={FiBriefcase} label="Business Profile" />
                <SidebarItem icon={FiBriefcase} label="Services" />
                <SidebarItem icon={FiCalendar} label="Bookings" />
                <SidebarItem icon={FiUsers} label="Staff" />
                <SidebarItem icon={FiBarChart2} label="Analytics" />
            </VStack>

            <Box mt="auto">
                <VStack spacing={2} align="stretch">
                    <SidebarItem icon={FiUsers} label="Settings" />
                    <SidebarItem icon={FiHome} label="Logout" />
                    <HStack spacing={3} mt={4} pt={4} borderTopWidth="1px" borderColor="gray.100">
                        <Box w={8} h={8} borderRadius="full" bg="#1D4044" /> {/* User avatar placeholder */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900">David Carter</Text>
                            <Text fontSize="xs" color="gray.500">Owner</Text>
                        </Box>
                    </HStack>
                </VStack>
            </Box>
        </Box>
    );
}
