'use client';

import { Box, Flex, Heading, Text, Button, Link as ChakraLink, Image, VStack, Checkbox, Icon, Separator, HStack } from '@chakra-ui/react';
// import { Checkbox } from "@/components/ui/checkbox" // We might need to check if a custom Checkbox component exists or use Chakra's
import CustomInput from '@/components/ui/InputGroup';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
            {/* Left Side - Image */}
            <Box
                flex="1"
                bg="teal.600"
                position="relative"
                display={{ base: 'none', md: 'block' }}
            >
                <Image
                    src="/assets/auth/login-bg.jpg"
                    alt="Abstract Background"
                    objectFit="cover"
                    w="full"
                    h="full"
                    opacity="0.9"
                />
                {/* Overlay to ensure text readability if we were putting text on top, but the design shows just the image pattern */}
            </Box>

            {/* Right Side - Form */}
            <Flex
                flex="1"
                align="top"
                justify="center"
                bg="white"
                p={{ base: 8, md: 16 }}
            >
                <VStack gap={6} w="full" maxW="md" align="stretch">
                    <Box textAlign="center" mb={2}>
                        <Heading size="lg" color="teal.900" mb={1}>Logo</Heading> {/* Placeholder for Logo */}
                    </Box>

                    <Box textAlign="center" mb={6}>
                        <Heading size="2xl" fontWeight="bold" color="gray.800" mb={2}>
                            Business Portal
                        </Heading>
                        <Text color="gray.500">
                            Sign in to manage your business
                        </Text>
                    </Box>

                    <VStack gap={4}>
                        <CustomInput
                            label="Email *"
                            type="email"
                            placeholder="example.com"
                            leftIcon={FiMail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <CustomInput
                            label="Password*"
                            type="password"
                            placeholder="**********"
                            leftIcon={FiLock}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </VStack>

                    <Flex justify="space-between" align="center" width="full">
                        <Checkbox.Root colorPalette="teal" variant="subtle">
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label color="gray.500" fontSize="sm">Keep me signed in</Checkbox.Label>
                        </Checkbox.Root>
                        <Link href="/auth/forgot-password">
                            <Text color="teal.600" fontSize="sm" fontWeight="medium">
                                Forgot Password?
                            </Text>
                        </Link>
                    </Flex>

                    <Button
                        colorPalette="teal"
                        size="xl"
                        borderRadius="full"
                        w="full"
                        fontSize="md"
                        bg="#2D5B5E" // Custom dark teal from screenshot
                        _hover={{ bg: "#254E50" }}
                    >
                        Sign in to Dashboard
                    </Button>

                    <HStack width="full" my={4}>
                        <Separator flex="1" />
                        <Text fontSize="xs" color="gray.400">or sign up with either accoutns</Text>
                        <Separator flex="1" />
                    </HStack>

                    <Flex gap={4} wrap="wrap" justifyContent="center">
                        <Button
                            variant="outline"
                            w="fit"
                            borderRadius="full"
                            borderColor="gray.200"
                            color="gray.600"
                            fontWeight="normal"
                            px={5}
                        >
                            <Icon as={FcGoogle} mr={2} /> Google
                        </Button>
                        <Button
                            variant="outline"
                            w="fit"
                            borderRadius="full"
                            borderColor="gray.200"
                            color="gray.600"
                            fontWeight="normal"
                            px={5}
                        >
                            <Icon as={FaFacebook} color="#1877F2" mr={2} /> facebook
                        </Button>
                    </Flex>

                    <Box textAlign="center" mt={5}>
                        <Text fontSize="sm" color="gray.600">
                            Don't have a business account?{' '}
                            <Link href="/auth/register">
                                <Text as="span" color="teal.600" fontWeight="medium">
                                    Register Here
                                </Text>
                            </Link>
                        </Text>
                    </Box>
                </VStack>
            </Flex>
        </Flex>
    );
}
