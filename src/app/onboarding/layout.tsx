'use client';

import { Box, Flex, Heading, Text, VStack, Circle, Separator, HStack } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { FiCheck } from 'react-icons/fi';

const steps = [
    { id: 1, path: '/onboarding/business-info', title: 'Business Info' },
    { id: 2, path: '/onboarding/business-hours', title: 'Business Hours' },
    { id: 3, path: '/onboarding/staff', title: 'Staffs' },
    { id: 4, path: '/onboarding/services', title: 'Services' },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Determine current step index (1-based)
    const currentStepIndex = steps.findIndex(step => pathname.includes(step.path)) + 1 || 1;
    const progress = Math.min((currentStepIndex / steps.length) * 100, 100);

    return (
        <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
            {/* Left Sidebar */}
            <Box
                w={{ base: 'full', md: '400px' }}
                bg="#2D5B5E"
                color="white"
                p={10}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                position="relative"
            >
                <Box>
                    <Heading size="lg" mb={12}>Logo</Heading>

                    <VStack align="start" gap={4}>
                        {/* Dynamic Content could go here based on step, but for now hardcoded based on screenshots or generic */}
                        <Heading size="4xl" fontWeight="bold" lineHeight="1.2">
                            {currentStepIndex === 1 && "Solutions Tailored For You"}
                            {currentStepIndex === 2 && "Tell Us When You Are Available"}
                            {currentStepIndex === 3 && "Offer More Than One Service?"}
                            {currentStepIndex === 4 && "Offer More Than One Service?"} {/* Screenshot 3 and 4 show similar left side? No, screenshot 3 shows just logo. Let's use generic text or switch based on step */}
                        </Heading>
                        <Text fontSize="lg" opacity={0.9}>
                            {currentStepIndex === 1 && "Connecting you to more people while managing all the hassle for your business"}
                            {currentStepIndex === 2 && "Help us understand your business hours"}
                            {currentStepIndex >= 3 && "No Problem we’ve got you covered on that"}
                        </Text>
                    </VStack>
                </Box>

                {/* Decorative Diamonds */}
                <HStack gap={4} mb={8}>
                    <Box transform="rotate(45deg)" bg="pink.200" w="8" h="8" borderRadius="sm" />
                    <Box transform="rotate(45deg)" bg="pink.200" w="8" h="8" borderRadius="sm" opacity={0.8} />
                    <Box transform="rotate(45deg)" bg="pink.200" w="8" h="8" borderRadius="sm" opacity={0.6} />
                    <Box transform="rotate(45deg)" bg="pink.200" w="8" h="8" borderRadius="sm" opacity={0.4} />
                </HStack>
            </Box>

            {/* Right Content */}
            <Flex flex="1" direction="column" bg="white">
                {/* Progress Bar */}
                <Box px={10} py={8}>
                    <Box position="relative" w="full">
                        <Box
                            position="absolute"
                            top="50%"
                            left="0"
                            transform="translateY(-50%)"
                            w="full"
                            h="1px"
                            bg="gray.200"
                            zIndex={0}
                        />
                        <Box
                            position="absolute"
                            top="50%"
                            left="0"
                            transform="translateY(-50%)"
                            w={`${((currentStepIndex - 1) / (steps.length - 1)) * 100}%`}
                            h="1px"
                            bg="teal.600"
                            zIndex={0}
                            transition="width 0.3s"
                        />

                        <Flex justify="space-between" position="relative" zIndex={1}>
                            {steps.map((step, index) => {
                                const stepNum = index + 1;
                                const isCompleted = stepNum < currentStepIndex;
                                const isCurrent = stepNum === currentStepIndex;

                                return (
                                    <Circle
                                        key={step.id}
                                        size="4"
                                        bg={isCompleted || isCurrent ? "teal.600" : "white"}
                                        borderWidth="1px"
                                        borderColor={isCompleted || isCurrent ? "teal.600" : "gray.200"}
                                    >
                                        {/* {isCompleted && <FiCheck color="white" size={10} />} */}
                                    </Circle>
                                );
                            })}
                        </Flex>
                    </Box>
                </Box>

                {/* Scrollable Content Area */}
                <Box flex="1" px={{ base: 6, md: 20 }} py={4} overflowY="auto">
                    {children}
                </Box>
            </Flex>
        </Flex>
    );
}
