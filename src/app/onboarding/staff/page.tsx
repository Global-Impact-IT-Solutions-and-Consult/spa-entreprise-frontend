'use client';

import { Box, Heading, Text, VStack, Button, Flex, Icon, SimpleGrid, HStack, Checkbox, Avatar, Center, Dialog, Input, Stack, createListCollection, Select } from '@chakra-ui/react';
import { FiArrowLeft, FiArrowRight, FiPlus } from 'react-icons/fi';
import Link from 'next/link';
import { useState } from 'react';

// Reusing part of StaffCard logic but adapting for selection as per design
const StaffItem = ({ name, role, isSelected, onToggle }: { name: string; role: string; isSelected: boolean; onToggle: () => void }) => {
    return (
        <Box
            borderWidth="1px"
            borderColor={isSelected ? "teal.500" : "gray.200"}
            borderRadius="xl"
            p={4}
            bg={isSelected ? "#F0FDF9" : "white"}
            position="relative"
            cursor="pointer"
            onClick={onToggle}
            transition="all 0.2s"
        >
            <Flex align="center" gap={4}>
                <Checkbox.Root
                    checked={isSelected}
                    onCheckedChange={onToggle} // Toggle on checkbox click too
                    colorPalette="teal"
                    variant="outline"
                >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control borderRadius="md" boxSize={5} />
                </Checkbox.Root>

                <Avatar.Root size="md" bg="gray.200">
                    <Avatar.Fallback name={name} />
                </Avatar.Root>

                <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.900">{name}</Text>
                    <Text fontSize="xs" color="gray.500">{role}</Text>
                </Box>
            </Flex>
        </Box>
    );
}

const serviceTypes = createListCollection({
    items: [
        { label: "Spa & Massage", value: "spa_massage" },
        { label: "Hair Styling", value: "hair_styling" },
        { label: "Manicure & Pedicure", value: "manicure_pedicure" },
    ]
});

const experienceLevels = createListCollection({
    items: [
        { label: "Junior", value: "junior" },
        { label: "Mid-Level", value: "mid" },
        { label: "Expert", value: "expert" },
    ]
});

export default function StaffsPage() {
    const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
    const [open, setOpen] = useState(false);

    const staffList = [
        { id: 1, name: "Amara Okeke", role: "Massage Therapist" },
        { id: 2, name: "Amara Okeke", role: "Massage Therapist" }, // Duplicate name in design
    ];

    const toggleStaff = (id: number) => {
        setSelectedStaffIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    return (
        <Box maxW="800px" mx="auto">
            <Box mb={8}>
                <Heading size="xl" fontWeight="bold" mb={2} color="gray.800">Staffs</Heading>
                <Text color="gray.500">Add number of staffs and Staff Info</Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={8}>
                {staffList.map(staff => (
                    <StaffItem
                        key={staff.id}
                        name={staff.name}
                        role={staff.role}
                        isSelected={selectedStaffIds.includes(staff.id)}
                        onToggle={() => toggleStaff(staff.id)}
                    />
                ))}
            </SimpleGrid>

            {/* Add Staff Dialog */}
            <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
                <Dialog.Trigger asChild>
                    <Box
                        borderWidth="1px"
                        borderStyle="dashed"
                        borderColor="gray.300"
                        borderRadius="xl"
                        p={4}
                        textAlign="center"
                        _hover={{ borderColor: "teal.500", bg: "gray.50" }}
                        cursor="pointer"
                        mb={10}
                        maxW="300px"
                    >
                        <Center h="full">
                            <HStack gap={2} color="gray.500">
                                <CircleIcon />
                                <Text fontSize="sm" fontWeight="medium">Add Staff</Text>
                            </HStack>
                        </Center>
                    </Box>
                </Dialog.Trigger>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="2xl" p={8} maxW="500px" mt={20}>
                        <Dialog.Header textAlign="center" mb={6} p={0}>
                            <Dialog.Title fontSize="2xl" fontWeight="bold" color="gray.800">Add Staff</Dialog.Title>
                            <Text fontSize="sm" color="gray.500" fontWeight="normal">Add staff and services offerd</Text>
                        </Dialog.Header>

                        <Dialog.Body p={0}>
                            <Stack gap={5}>
                                <Box>
                                    <Text mb={2} fontWeight="medium" color="gray.700">Staff Name</Text>
                                    <Input placeholder="John Doe" borderRadius="md" size="lg" px={3} />
                                </Box>

                                <Box>
                                    <Text mb={2} fontWeight="medium" color="gray.700">Service</Text>
                                    <Select.Root collection={serviceTypes} size="lg" variant="outline">
                                        <Select.Trigger px={3}>
                                            <Select.ValueText placeholder="Spa & Massage" />
                                        </Select.Trigger>
                                        <Select.Positioner>
                                            <Select.Content color="gray.600" px={2} py={2}>
                                                {serviceTypes.items.map((item) => (
                                                    <Select.Item item={item} key={item.value} px={1} py={1}>
                                                        {item.label}
                                                    </Select.Item>
                                                ))}
                                            </Select.Content>
                                        </Select.Positioner>
                                    </Select.Root>
                                </Box>

                                <Box>
                                    <Text mb={2} fontWeight="medium" color="gray.700">Role</Text>
                                    <Input placeholder="Relaxation, therapeutic massage" borderRadius="md" size="lg" px={3} />
                                </Box>

                                <Box>
                                    <Text mb={2} fontWeight="medium" color="gray.700">Experience</Text>
                                    <Select.Root collection={experienceLevels} size="lg" variant="outline">
                                        <Select.Trigger px={3}>
                                            <Select.ValueText placeholder="Expert" />
                                        </Select.Trigger>
                                        <Select.Positioner>
                                            <Select.Content color="gray.600" px={2} py={2}>
                                                {experienceLevels.items.map((item) => (
                                                    <Select.Item item={item} key={item.value} px={1} py={1}>
                                                        {item.label}
                                                    </Select.Item>
                                                ))}
                                            </Select.Content>
                                        </Select.Positioner>
                                    </Select.Root>
                                </Box>
                            </Stack>
                        </Dialog.Body>

                        <Dialog.Footer p={0} mt={8} justifyContent="center" width="full">
                            <Button bg="#2D5B5E" color="white" borderRadius="full" size="lg" width="full" _hover={{ bg: "#254E50" }}>
                                Add Staff
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>


            <Flex justify="space-between" mt={8}>
                <Link href="/onboarding/business-hours">
                    <Button variant="outline" borderRadius="full" px={8} color="gray.600">
                        <Icon as={FiArrowLeft} mr={2} /> Back
                    </Button>
                </Link>
                <Link href="/onboarding/services">
                    <Button colorPalette="teal" bg="#2D5B5E" borderRadius="full" px={8} size="lg">
                        Continue <Icon as={FiArrowRight} ml={2} />
                    </Button>
                </Link>
            </Flex>
        </Box>
    );
}

const CircleIcon = () => (
    <Box bg="teal.100" borderRadius="full" p={1}>
        <Icon as={FiPlus} color="teal.700" boxSize={4} />
    </Box>
)
