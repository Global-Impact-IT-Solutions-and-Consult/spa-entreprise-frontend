'use client';

import { Box, Flex, Heading, Text, Button, VStack, Link as ChakraLink, Icon, Separator } from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { FiChevronLeft, FiMail, FiInfo } from 'react-icons/fi';
import CustomInput from '@/components/ui/InputGroup';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');

    const handleSendVerificationCode = () => {
        //navigate to verify email page
        location.href = '/auth/verify-email';
    };

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
                                Reset Your Password
                            </Heading>
                            <Text color="gray.500" fontSize="sm" px={4}>
                                Enter your business email to receive a reset code
                            </Text>
                        </Box>

                        <CustomInput
                            label="Email *"
                            type="email"
                            placeholder="example.com"
                            leftIcon={FiMail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Button
                            colorPalette="teal"
                            size="xl"
                            borderRadius="full"
                            w="full"
                            fontSize="md"
                            bg="#2D5B5E"
                            _hover={{ bg: "#254E50" }}
                            onClick={handleSendVerificationCode}
                        >
                            Send Verification Code
                        </Button>

                        <Separator />

                        <Flex align="start" gap={2} textAlign="left">
                            <Icon as={FiInfo} color="teal.700" mt={1} />
                            <Box>
                                <Text fontSize="sm" fontWeight="bold" color="gray.700">Can't access your email or phone?</Text>
                                <Text fontSize="sm" color="gray.500">
                                    Contact our business support team at <Link href="mailto:support@servicehub.ng"><Text as="span" color="teal.700">support@servicehub.ng</Text></Link> for assistance.
                                </Text>
                            </Box>
                        </Flex>
                    </VStack>
                </Box>
            </Flex>
        </Flex>
    );
}
