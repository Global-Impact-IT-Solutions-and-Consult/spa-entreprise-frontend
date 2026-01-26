'use client';

import { Box, Heading, Text, VStack, Button, Flex, Icon, createListCollection, HStack, Separator, Select } from '@chakra-ui/react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

// Mock times
const times = createListCollection({
    items: [
        { label: "8:00 AM", value: "08:00" },
        { label: "9:00 AM", value: "09:00" },
        { label: "10:00 AM", value: "10:00" },
        { label: "5:00 PM", value: "17:00" },
        { label: "7:00 PM", value: "19:00" },
        { label: "9:00 PM", value: "21:00" },
        { label: "Closed", value: "closed" },
    ]
});

const days = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const DayRow = ({ day, isLast }: { day: string; isLast?: boolean }) => {
    return (
        <Box borderBottomWidth={isLast ? "0px" : "1px"} borderColor="gray.100" py={4}>
            <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
                <Text width={{ base: "full", sm: "120px" }} fontWeight="medium" color="gray.600">
                    {day}
                </Text>

                <HStack flex="1" gap={4} justify="flex-end">
                    <Select.Root collection={times} size="md" width="140px" variant="subtle" borderRadius="md">
                        <Select.Trigger bg="gray.100" color="gray.600" px={3}>
                            <Select.ValueText placeholder={day === "Sunday" ? "Closed" : "9:00 PM"} />
                        </Select.Trigger>
                        <Select.Positioner>
                            <Select.Content color="gray.600" px={3} py={1}>
                                {times.items.map((item) => (
                                    <Select.Item item={item} key={item.value} py={1} ps={1}>
                                        {item.label}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Positioner>
                    </Select.Root>

                    <Select.Root collection={times} size="md" width="140px" variant="subtle" borderRadius="md">
                        <Select.Trigger bg="gray.100" color="gray.600" px={3}>
                            <Select.ValueText placeholder={day === "Sunday" ? "Closed" : "9:00 PM"} />
                        </Select.Trigger>
                        <Select.Positioner>
                            <Select.Content color="gray.600" px={3} py={1}>
                                {times.items.map((item) => (
                                    <Select.Item item={item} key={item.value} py={1} ps={1}>
                                        {item.label}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Positioner>
                    </Select.Root>
                </HStack>
            </Flex>
        </Box>
    );
};


export default function BusinessHoursPage() {
    return (
        <Box maxW="700px" mx="auto">
            <Box mb={8}>
                <Heading size="xl" fontWeight="bold" mb={2} color="gray.800">Business Hours</Heading>
                <Text color="gray.500">Fill your working hours and working days</Text>
            </Box>

            <Box bg="white" borderRadius="xl" mb={10}>
                {/* Header Row */}
                <Flex borderBottomWidth="1px" borderColor="gray.200" pb={2} mb={2}>
                    <Text width={{ base: "full", sm: "120px" }} fontSize="sm" fontWeight="bold" color="gray.400">Day</Text>
                    <HStack flex="1" gap={4} justify="flex-end" ml={{ base: 0, sm: 4 }}>
                        <Text width="140px" fontSize="sm" fontWeight="bold" color="gray.400">Opening Time</Text>
                        <Text width="140px" fontSize="sm" fontWeight="bold" color="gray.400">Closing Time</Text>
                    </HStack>
                </Flex>

                {days.map((day, index) => (
                    <DayRow key={day} day={day} isLast={index === days.length - 1} />
                ))}
            </Box>

            <Flex justify="space-between" mt={8}>
                <Link href="/onboarding/business-info">
                    <Button variant="outline" borderRadius="full" px={8} color="gray.600">
                        <Icon as={FiArrowLeft} mr={2} /> Back
                    </Button>
                </Link>
                <Link href="/onboarding/staff">
                    <Button colorPalette="teal" bg="#2D5B5E" borderRadius="full" px={8} size="lg">
                        Continue <Icon as={FiArrowRight} ml={2} />
                    </Button>
                </Link>
            </Flex>
        </Box>
    );
}
