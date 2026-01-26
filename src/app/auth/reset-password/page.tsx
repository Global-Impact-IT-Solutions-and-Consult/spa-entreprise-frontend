'use client';

import { Box, Flex, Heading, Text, Button, VStack, Link as ChakraLink, Icon, Separator } from '@chakra-ui/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiChevronLeft, FiLock, FiCheckCircle } from 'react-icons/fi';
import CustomInput from '@/components/ui/InputGroup';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const hasLength = password.length >= 8;
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        setIsValid(hasLength && hasNumber && hasSpecial);
    }, [password]);

    return (
        <Flex minH="100vh" direction="column" bg="white" p={8}>
            <Box mb={8}>
                <Link href="/auth/login">
                    <Flex align="center" color="teal.700" fontWeight="medium" fontSize="sm">
                        <Icon as={FiChevronLeft} boxSize={5} />
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
                                Create New Password
                            </Heading>
                            <Text color="gray.500" fontSize="sm" px={4}>
                                Your password must be different from previous passwords
                            </Text>
                        </Box>

                        <VStack gap={2} align="stretch" textAlign="left">
                            <CustomInput
                                label="New Password"
                                type="password"
                                placeholder="Enter new password"
                                leftIcon={FiLock}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <Flex align="center" gap={2} mt={1}>
                                <Icon as={FiCheckCircle} color={isValid ? "green.500" : "gray.400"} boxSize={3} />
                                <Text fontSize="xs" color={isValid ? "green.500" : "gray.500"}>
                                    Must be at least 8 characters with a number and special character
                                </Text>
                            </Flex>
                        </VStack>

                        <CustomInput
                            label="Confirm New Password"
                            type="password"
                            placeholder="Re-enter new password"
                            leftIcon={FiLock}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <Button
                            colorPalette="teal"
                            size="xl"
                            borderRadius="full"
                            w="full"
                            fontSize="md"
                            bg="#2D5B5E"
                            _hover={{ bg: "#254E50" }}
                            mt={4}
                        >
                            Reset password and sign in
                        </Button>
                    </VStack>
                </Box>
            </Flex>
        </Flex>
    );
}
