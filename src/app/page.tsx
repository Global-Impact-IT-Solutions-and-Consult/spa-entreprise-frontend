"use client";

import { Box, HStack, VStack, Text, Heading, Button, Grid, GridItem } from "@chakra-ui/react";
import Sidebar from "@/components/modules/Sidebar";
import ServiceCard from "@/components/ui/ServiceCard";
import ActionCard from "@/components/ui/Actions";
import StaffCard from "@/components/ui/StaffCard";
import CustomInput from "@/components/ui/InputGroup";
import { RevenueCard, QuickLinkCard } from "@/components/ui/DashboardWidgets";
import ServiceTypeToggle from "@/components/ui/HomeServiceToggle";
import StatusBadge from "@/components/ui/Tags";
import { FiSearch, FiCalendar } from "react-icons/fi";

import AppointmentCard from "@/components/ui/AppointmentCard";
import CheckboxRow from "@/components/ui/CheckboxRow";
import ServiceListItem from "@/components/ui/ServiceListItem";

export default function Home() {
  return (
    <HStack align="start" height="100vh" gap={0} bg="gray.50">
      <Sidebar />

      <Box flex={1} height="100vh" overflowY="auto" p={8}>
        <Heading mb={8} size="lg" color="gray.900">UI Components Showcase</Heading>

        <VStack gap={10} align="stretch" pb={20}>

          {/* Service Cards Section */}
          <Box>
            <Heading size="md" mb={4} color="gray.800">Service Cards & Actions</Heading>
            <HStack gap={4} align="stretch" flexWrap="wrap">
              <ServiceCard
                title="Barbing"
                description="Haircut, beard trimming, shaving services"
                duration={30}
                price={3000}
                isSelected={false}
              />
              <ServiceCard
                title="Barbing (Selected)"
                description="Haircut, beard trimming, shaving services"
                duration={30}
                price={3000}
                isSelected={true}
              />
              <ActionCard
                title="Add Custom Service"
                subtitle="Add a service not listed here"
              />
            </HStack>
          </Box>

          {/* Staff & Appointments Section */}
          <Box>
            <Heading size="md" mb={4} color="gray.800">Staff & Appointments</Heading>
            <HStack gap={4} align="start" flexWrap="wrap">
              <StaffCard
                name="John Doe"
                role="Expert"
                tags={["Spa & Massage", "Relaxation, therapeutic massage"]}
              />
              <VStack align="stretch" gap={4} w="100%" maxW="400px">
                <AppointmentCard
                  name="Adeola Johnson"
                  role="Therapeutic Massage"
                  duration="60 mins"
                  time="2:00 PM - 3:00 PM"
                  price="₦15,000"
                  status="confirmed"
                />
                <CheckboxRow
                  label="Amara Okeke"
                  subLabel="Massage Therapist"
                />
                <CheckboxRow
                  label="David Okeke"
                  subLabel="Massage Therapist"
                  isChecked
                />
              </VStack>
            </HStack>
          </Box>

          {/* Dashboard Widgets Section */}
          <Box>
            <Heading size="md" mb={4} color="gray.800">Dashboard Widgets</Heading>
            <HStack gap={4} align="start" flexWrap="wrap">
              <VStack>
                <RevenueCard amount="₦84,500" percentageChange="12% from yesterday" />
              </VStack>
              <VStack gap={4} w="300px">
                <QuickLinkCard title="Dashboard" subtitle="" isActive />
                <QuickLinkCard title="Business Profile" subtitle="" />
                <QuickLinkCard title="Services" subtitle="" />
              </VStack>
            </HStack>
          </Box>

          {/* Service List Items Section */}
          <Box>
            <Heading size="md" mb={4} color="gray.800">Service List Items</Heading>
            <VStack gap={4} align="stretch">
              <ServiceListItem
                title="Therapeutic Massage"
                price="₦15,000"
                duration="60 mins"
                description="Full body therapeutic massage with essential oils for relaxation and pain relief."
                tags={["Massage", "In-Location"]}
                staffCount={3}
              />
              <ServiceListItem
                title="Deep Tissue Massage"
                price="₦20,000"
                duration="90 mins"
                description="Intense massage targeting deep muscle layers."
                tags={["Massage", "Home Service"]}
                staffCount={2}
              />
            </VStack>
          </Box>

          {/* New Action Cards (Add Staff Variants) */}
          <Box>
            <Heading size="md" mb={4} color="gray.800">Add Staff Actions</Heading>
            <HStack gap={4} flexWrap="wrap">
              <ActionCard title="Add Staff" variant="ghost" />
              <ActionCard title="Add Staff" variant="default" />
            </HStack>
          </Box>

          {/* Form Elements & Inputs */}
          <Box>
            <Heading size="md" mb={4} color="gray.800">Form Elements & Inputs</Heading>
            <VStack gap={4} maxW="400px" align="stretch">
              <CustomInput label="Label *" placeholder="example.text.here" />
              <CustomInput label="Password*" type="password" placeholder="**********" />
              <ServiceTypeToggle selected="both" />
              <HStack gap={2}>
                <StatusBadge status="confirmed" />
                <StatusBadge status="pending" />
              </HStack>
              <HStack gap={2}>
                <Button colorScheme="teal" borderRadius="full">Button</Button>
                <Button variant="outline" borderRadius="full">Button</Button>
              </HStack>
            </VStack>
          </Box>

        </VStack>
      </Box>
    </HStack>
  );
}
