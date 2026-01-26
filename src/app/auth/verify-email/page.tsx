'use client';

import { Box, Flex, Heading, Text, Button, Input, VStack, Link as ChakraLink, Separator, Field } from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { FiChevronLeft } from 'react-icons/fi';

export default function VerifyEmailPage() {
    const [code, setCode] = useState('');

    return (
        <Flex minH="100vh" direction="column" bg="white" p={8}>
            <Box mb={8}>
                <Link href="/auth/login">
                    <Flex align="center" color="teal.700" fontWeight="medium" fontSize="sm">
                        <FiChevronLeft size={20} />
                        <Text ml={1}>Back To Login</Text>
                    </Flex>
                </Link>
            </Box>

            <Flex flex="1" align="center" justify="center">
                <Box
                    w="full"
                    maxW="lg"
                    bg="white"
                    p={8}
                    borderWidth="1px"
                    borderColor="gray.100"
                    borderRadius="2xl"
                    boxShadow="sm"
                >
                    <VStack gap={6} align="stretch" textAlign="center">
                        <Box>
                            <Heading size="xl" fontWeight="bold" color="gray.800" mb={3}>
                                Verify Email Address
                            </Heading>
                            <Text color="gray.500" fontSize="sm" px={4}>
                                A 6 digit code has been sent to your email, fill below to continue
                            </Text>
                        </Box>

                        <Field.Root>
                            <Field.Label fontSize="sm" fontWeight="bold" color="gray.800" mb={1} textAlign="left" w="full">Code</Field.Label>
                            <Input
                                placeholder="enter code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                size="lg"
                                borderRadius="full"
                                borderColor="gray.200"
                                _focus={{ borderColor: "teal.500" }}
                                textAlign="left"
                                bg="white"
                                ps={5}
                            />
                        </Field.Root>

                        <Button
                            colorPalette="teal"
                            size="xl"
                            borderRadius="full"
                            w="full"
                            fontSize="md"
                            bg="#2D5B5E"
                            _hover={{ bg: "#254E50" }}
                        >
                            Verify
                        </Button>

                        <Separator />

                        <Text fontSize="sm" color="gray.500">
                            00:59  Din't get code?{' '}
                            <Link href="#">
                                <Text as="span" color="teal.700" fontWeight="medium">
                                    Send again
                                </Text>
                            </Link>
                        </Text>
                    </VStack>
                </Box>
            </Flex>
        </Flex>
    );
}
