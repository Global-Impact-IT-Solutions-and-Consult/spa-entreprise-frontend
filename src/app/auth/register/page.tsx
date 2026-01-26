'use client';

import { Box, Flex, Heading, Text, Button, Link as ChakraLink, Image, VStack, Checkbox, Icon, Separator, HStack, List } from '@chakra-ui/react';
// import { Checkbox } from "@/components/ui/checkbox"
import CustomInput from '@/components/ui/InputGroup';
import { FiMail, FiLock, FiUser, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [strength, setStrength] = useState({
        length: false,
        number: false,
        special: false,
    });

    useEffect(() => {
        setStrength({
            length: password.length >= 8,
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    }, [password]);

    const strengthPercent = Object.values(strength).filter(Boolean).length * 33.33;

    return (
        <Flex minH="100vh" direction={{ base: 'column-reverse', md: 'row' }}>
            {/* Left Side - Form */}
            <Flex
                flex="1"
                align="top"
                justify="center"
                bg="white"
                p={{ base: 8, md: 16 }}
            >
                <VStack gap={5} w="full" maxW="md" align="stretch">
                    <Box textAlign="center" mb={2}>
                        <Heading size="lg" color="teal.900" mb={1}>Logo</Heading>
                    </Box>

                    <Box textAlign="center" mb={4}>
                        <Heading size="2xl" fontWeight="bold" color="gray.800" mb={2}>
                            Register Your Business
                        </Heading>
                        <Text color="gray.500">
                            Join Nigeria's leading services market place
                        </Text>
                    </Box>

                    <VStack gap={4}>
                        <CustomInput
                            label="Full Name*"
                            type="text"
                            placeholder="Full Name"
                            leftIcon={FiUser}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
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

                        {/* Password Strength */}
                        <Box w="full">
                            <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>Password Strength</Text>
                            <Box w="full" h="1" bg="gray.200" borderRadius="full" mb={2}>
                                <Box h="full" bg={strengthPercent < 50 ? "red.500" : strengthPercent < 100 ? "yellow.500" : "green.500"} width={`${strengthPercent}%`} borderRadius="full" transition="width 0.3s" />
                            </Box>
                            <List.Root gap="1" variant="plain">
                                <List.Item display="flex" alignItems="center">
                                    <List.Indicator asChild>
                                        <Icon as={FiCheckCircle} color={strength.length ? "green.500" : "gray.400"} mr={2} boxSize={3} />
                                    </List.Indicator>
                                    <Text fontSize="xs" color={strength.length ? "green.600" : "gray.500"}>At least 8 characters</Text>
                                </List.Item>
                                <List.Item display="flex" alignItems="center">
                                    <List.Indicator asChild>
                                        <Icon as={FiCheckCircle} color={strength.number ? "green.500" : "gray.400"} mr={2} boxSize={3} />
                                    </List.Indicator>
                                    <Text fontSize="xs" color={strength.number ? "green.600" : "gray.500"}>Contains a number</Text>
                                </List.Item>
                                <List.Item display="flex" alignItems="center">
                                    <List.Indicator asChild>
                                        <Icon as={FiCheckCircle} color={strength.special ? "green.500" : "gray.400"} mr={2} boxSize={3} />
                                    </List.Indicator>
                                    <Text fontSize="xs" color={strength.special ? "green.600" : "gray.500"}>Contains a special character</Text>
                                </List.Item>
                            </List.Root>
                        </Box>

                        <CustomInput
                            label="Confirm Password*"
                            type="password"
                            placeholder="**********"
                            leftIcon={FiLock}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </VStack>

                    <Checkbox.Root colorPalette="teal" variant="subtle" mt={2}>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label color="gray.500" fontSize="xs" lineHeight="short">
                            I agree to the <Link href="/terms"><Text as="span" color="teal.600">Terms</Text></Link> of <Link href="/service"><Text as="span" color="teal.600">Service</Text></Link> and Privacy Policy. I confirm that I have the authority to register this business.
                        </Checkbox.Label>
                    </Checkbox.Root>

                    <Button
                        colorPalette="teal"
                        size="xl"
                        borderRadius="full"
                        w="full"
                        fontSize="md"
                        bg="#2D5B5E"
                        _hover={{ bg: "#254E50" }}
                        mt={2}
                    >
                        Create Business Account
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

                    <Box textAlign="center" mt={6}>
                        <Text fontSize="sm" color="gray.600">
                            Already have an account?{' '}
                            <Link href="/auth/login">
                                <Text as="span" color="teal.600" fontWeight="medium">
                                    Sign In
                                </Text>
                            </Link>
                        </Text>
                    </Box>
                </VStack>
            </Flex>

            {/* Right Side - Image */}
            <Box
                flex="1"
                bg="teal.600"
                position="relative"
                display={{ base: 'none', md: 'block' }}
            >
                <Image
                    src="/assets/auth/register-bg.jpg"
                    alt="Abstract Background"
                    objectFit="cover"
                    w="full"
                    h="full"
                    opacity="0.9"
                />
            </Box>
        </Flex>
    );
}
