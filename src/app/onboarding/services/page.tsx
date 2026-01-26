'use client';

import { Box, Heading, Text, VStack, Button, Flex, Icon, SimpleGrid, Center, HStack, Dialog, Stack, Input } from '@chakra-ui/react';
import { FiArrowLeft, FiArrowRight, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from "@chakra-ui/react"
import { BsPerson } from 'react-icons/bs';

// Inline Service Component to match the specific "Onboarding" design which includes "Staff Assigned" and edit/delete actions
// The existing ServiceCard is close, but might be overkill or missing specific stylistic tweaks (like the staff count)
const OnboardingServiceCard = ({ title, price, duration, staffCount, tags, onEdit, onDelete }: any) => {
    return (
        <Box
            bg="white"
            borderRadius="2xl"
            p={6}
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
        >
            <Flex justify="space-between" align="start" mb={2}>
                <Box>
                    <Heading size="md" fontWeight="bold" color="gray.900" mb={1}>{title}</Heading>
                </Box>
                <Box textAlign="right">
                    <Text fontWeight="bold" fontSize="lg" color="gray.900">₦{price.toLocaleString()}</Text>
                    <Text fontSize="xs" color="gray.500">{duration} mins</Text>
                </Box>
            </Flex>

            <HStack gap={2} mb={6}>
                {tags.map((tag: string) => (
                    <Badge key={tag} colorPalette="gray" variant="surface" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="normal" textTransform="capitalize">
                        {tag}
                    </Badge>
                ))}
            </HStack>

            <Text fontSize="sm" color="gray.600" lineHeight="short" mb={6}>
                Full body therapeutic massage with essential oils for relaxation and pain relief.
            </Text>

            <Flex justify="space-between" align="center" pt={4} borderTopWidth="1px" borderColor="gray.100">
                <HStack color="gray.600" fontSize="sm">
                    <Icon as={BsPerson} />
                    <Text>{staffCount} Staff Assigned</Text>
                </HStack>

                <HStack gap={3}>
                    <Icon as={FiEdit2} color="teal.700" cursor="pointer" onClick={onEdit} />
                    <Icon as={FiTrash2} color="red.500" cursor="pointer" onClick={onDelete} />
                </HStack>
            </Flex>
        </Box>
    );
};

export default function ServicesPage() {
    const [open, setOpen] = useState(false);

    return (
        <Box maxW="900px" mx="auto">
            <Box mb={8}>
                <Heading size="xl" fontWeight="bold" mb={2} color="gray.800">Services</Heading>
                <Text color="gray.500">Add relevant Services your business offer</Text>
            </Box>

            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={10}>
                <OnboardingServiceCard
                    title="Therapeutic Massage"
                    price={15000}
                    duration={60}
                    staffCount={3}
                    tags={["Massage", "In-Location"]}
                />
                <OnboardingServiceCard
                    title="Therapeutic Massage"
                    price={15000}
                    duration={60}
                    staffCount={3}
                    tags={["Massage", "In-Location"]}
                />

                {/* Add Custom Service Dialog */}
                <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
                    <Dialog.Trigger asChild>
                        <Box
                            borderWidth="1px"
                            borderStyle="dashed"
                            borderColor="gray.300"
                            borderRadius="2xl"
                            p={6}
                            textAlign="center"
                            _hover={{ borderColor: "teal.500", bg: "gray.50" }}
                            cursor="pointer"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minH="200px"
                        >
                            <VStack>
                                <Box bg="teal.100" borderRadius="full" p={3}>
                                    <Icon as={FiPlus} color="teal.700" boxSize={6} />
                                </Box>
                                <Text fontWeight="bold" color="gray.800">Add Custom Service</Text>
                                <Text fontSize="xs" color="gray.500">Add a service not listed here</Text>
                            </VStack>
                        </Box>
                    </Dialog.Trigger>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content borderRadius="2xl" p={8} maxW="500px" mt={20}>
                            <Dialog.Header textAlign="center" mb={6} p={0}>
                                <VStack w="full">
                                    <Dialog.Title fontSize="2xl" fontWeight="bold" color="gray.800" textAlign="center">Add a new service</Dialog.Title>
                                    <Text fontSize="sm" color="gray.500" fontWeight="normal" textAlign="center">Create tailored Services for your customers</Text>
                                </VStack>
                            </Dialog.Header>

                            <Dialog.Body p={0}>
                                <Stack gap={5}>
                                    <Box>
                                        <Text mb={2} fontWeight="medium" color="gray.700">Service</Text>
                                        <Input placeholder="Service" borderRadius="md" size="lg" px={3} />
                                    </Box>

                                    <Box>
                                        <Text mb={2} fontWeight="medium" color="gray.700">Service Details</Text>
                                        <Input placeholder="details of service" borderRadius="md" size="lg" px={3} />
                                    </Box>

                                    <Box>
                                        <Text mb={2} fontWeight="medium" color="gray.700">Service Duration(Minutes)</Text>
                                        <Input placeholder="10" borderRadius="md" size="lg" type="number" px={3} />
                                    </Box>

                                    <Box>
                                        <Text mb={2} fontWeight="medium" color="gray.700">Service Cost</Text>
                                        <Input placeholder="100" borderRadius="md" size="lg" type="number" px={3} />
                                    </Box>
                                </Stack>
                            </Dialog.Body>

                            <Dialog.Footer p={0} mt={8} justifyContent="center" width="full">
                                <Button bg="#2D5B5E" color="white" borderRadius="full" size="lg" width="full" _hover={{ bg: "#254E50" }}>
                                    Create & Add Service
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Dialog.Root>
            </SimpleGrid>

            <Flex justify="space-between" mt={8}>
                <Link href="/onboarding/staff">
                    <Button variant="outline" borderRadius="full" px={8} color="gray.600">
                        <Icon as={FiArrowLeft} mr={2} /> Back
                    </Button>
                </Link>
                <Link href="/dashboard"> {/* Assuming next step is dashboard */}
                    <Button colorPalette="teal" bg="#2D5B5E" borderRadius="full" px={8} size="lg">
                        Continue <Icon as={FiArrowRight} ml={2} />
                    </Button>
                </Link>
            </Flex>
        </Box>
    );
}
