'use client';

import { Box, Heading, Text, VStack, Button, Flex, Icon, createListCollection, Select, Field } from '@chakra-ui/react';
import CustomInput from '@/components/ui/InputGroup';
import { FiUpload, FiBriefcase, FiMapPin, FiPhone, FiHash, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';
import Link from 'next/link';

// Mock data for Select
const frameworks = createListCollection({
    items: [
        { label: "React.js", value: "react" },
        { label: "Vue.js", value: "vue" },
        { label: "Angular", value: "angular" },
        { label: "Svelte", value: "svelte" },
    ],
})

const businessTypes = createListCollection({ items: [{ label: "Spa", value: "spa" }, { label: "Salon", value: "salon" }, { label: "Gym", value: "gym" }] });
const locations = createListCollection({ items: [{ label: "Abuja", value: "abuja" }, { label: "Lagos", value: "lagos" }, { label: "Port Harcourt", value: "ph" }] });

export default function BusinessInfoPage() {
    const [logo, setLogo] = useState<File | null>(null);

    return (
        <Box maxW="600px" mx="auto">
            <Box mb={8}>
                <Heading size="xl" fontWeight="bold" mb={2} color="gray.800">Business Info</Heading>
                <Text color="gray.500">Fill correct business information here</Text>
            </Box>

            <VStack gap={5} align="stretch" mb={10}>
                {/* Business Type */}
                <Select.Root collection={businessTypes} size="lg" variant="outline">
                    <Select.Label fontWeight="medium" color="gray.700">Business Type *</Select.Label>
                    <Select.Trigger px={3}>
                        <Select.ValueText placeholder="Select Business Type" />
                    </Select.Trigger>
                    <Select.Positioner>
                        <Select.Content color="gray.600" p={3}>
                            {businessTypes.items.map((item) => (
                                <Select.Item item={item} key={item.value} py={1} ps={1}>
                                    {item.label}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Positioner>
                </Select.Root>

                {/* Business Name */}
                <CustomInput
                    label="Business Name"
                    placeholder="ZTX Spar LTD"
                    leftIcon={FiBriefcase}
                />

                {/* Phone Number */}
                <CustomInput
                    label="Phone Number"
                    placeholder="000 000 00 00"
                    type="tel"
                    leftIcon={FiPhone}
                />

                {/* CAC Reg Number */}
                <CustomInput
                    label="CAC Reg Number"
                    placeholder="RC12345667"
                    leftIcon={FiHash}
                />

                {/* Business Location */}
                <CustomInput
                    label="Business Location"
                    placeholder="No. 5 Block Street, Wuse zone 5, Abuja Nigeria"
                    leftIcon={FiMapPin}
                />

                {/* Upload Logo */}
                <Field.Root>
                    <Field.Label fontWeight="medium" color="gray.700">Upload Logo</Field.Label>
                    <Box
                        borderWidth="1px"
                        borderStyle="dashed"
                        borderColor="gray.300"
                        borderRadius="xl"
                        p={8}
                        w="full"
                        textAlign="center"
                        _hover={{ borderColor: "teal.500", bg: "gray.50" }}
                        cursor="pointer"
                    >
                        <VStack gap={2}>
                            <Icon as={FiUpload} boxSize={8} color="gray.400" />
                            <Box>
                                <Text fontSize="md" fontWeight="bold" color="gray.600">Drag and Drop Here</Text>
                                <Text fontSize="xs" color="gray.400">File Supported (PNG & JPGE)</Text>
                            </Box>
                            <Button size="sm" variant="surface" colorPalette="gray" borderRadius="full" px={5}>
                                Choose file
                            </Button>
                            <Text fontSize="xs" color="gray.400">Maximum Size 5MB</Text>
                        </VStack>
                    </Box>
                </Field.Root>

            </VStack>

            <Flex justify="space-between" mt={8}>
                <Button variant="outline" borderRadius="full" px={8} disabled color="gray.400">
                    <Icon as={FiArrowLeft} mr={2} /> Back
                </Button>
                <Link href="/onboarding/business-hours">
                    <Button colorPalette="teal" bg="#2D5B5E" borderRadius="full" px={8} size="lg">
                        Continue <Icon as={FiArrowRight} ml={2} />
                    </Button>
                </Link>
            </Flex>
        </Box>
    );
}
