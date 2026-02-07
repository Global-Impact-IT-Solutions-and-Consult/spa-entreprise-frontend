import { businessService } from '@/services/business.service';
import { Business, Service, Staff } from '@/services/business.service';

/**
 * Determines the correct onboarding step based on business completion status
 * 
 * Priority:
 * 1. Check onboardingCompleted flag (if available from backend) - FASTEST
 * 2. Manual check using addressRelation and services/staff endpoints - FALLBACK
 * 
 * @param business - The business object (from getMyBusinesses) to check
 * @returns The path to redirect to
 */
export async function determineOnboardingStep(business: Business): Promise<string> {
    console.log('=== DETERMINING ONBOARDING STEP ===');
    console.log('Business from getMyBusinesses:', business);
    console.log('Business summary:', {
        id: business.id,
        businessName: business.businessName,
        phone: business.phone,
        description: business.description,
        hasAddressRelation: !!business.addressRelation,
        onboardingCompleted: business.onboardingCompleted,
        onboardingCompletedAt: business.onboardingCompletedAt
    });
    
    try {
        // OPTION 1: Use onboardingCompleted flag (recommended - fastest)
        // Backend automatically maintains this flag based on profile/services/staff completion
        if (business.onboardingCompleted === true) {
            console.log('✅ Onboarding completed (using backend flag). Redirecting to dashboard.');
            return '/dashboard';
        }

        // OPTION 2: Manual check (fallback if flag is not available or false)
        // This is needed for backward compatibility or if backend hasn't calculated the flag yet
        
        // If addressRelation is missing from getMyBusinesses, try to fetch full business details
        // (This should rarely happen now since backend includes addressRelation)
        let businessData = business;
        if (!business.addressRelation && !business.address && !business.country) {
            console.log('Address data missing from getMyBusinesses, fetching full business details...');
            try {
                businessData = await businessService.getBusiness(business.id);
                console.log('Full business data fetched:', businessData);
                
                // Check onboardingCompleted flag again after fetching full details
                if (businessData.onboardingCompleted === true) {
                    console.log('✅ Onboarding completed (using backend flag from full fetch). Redirecting to dashboard.');
                    return '/dashboard';
                }
            } catch (error: any) {
                console.warn('Could not fetch full business details:', error);
                // Continue with the business data we have
            }
        }
        
        // Check if business profile is complete
        // Use addressRelation if available (new structure), otherwise fall back to legacy fields
        const addressInfo = businessData.addressRelation || {
            country: businessData.country,
            state: businessData.state,
            city: businessData.city,
            address: businessData.address
        };

        // Check profile completion - all required fields must be present
        const hasBusinessName = !!businessData.businessName;
        const hasPhone = !!businessData.phone;
        const hasDescription = !!businessData.description;
        const hasCountry = !!addressInfo?.country;
        const hasState = !!addressInfo?.state;
        const hasCity = !!addressInfo?.city;
        const hasAddress = !!addressInfo?.address;

        const hasProfile = hasBusinessName && 
                          hasPhone && 
                          hasDescription && 
                          hasCountry && 
                          hasState && 
                          hasCity && 
                          hasAddress;

        console.log('Profile check:', {
            hasProfile,
            businessName: hasBusinessName,
            phone: hasPhone,
            description: hasDescription,
            country: hasCountry,
            state: hasState,
            city: hasCity,
            address: hasAddress,
            addressInfo: addressInfo,
            addressRelation: businessData.addressRelation
        });

        if (!hasProfile) {
            console.log('Profile incomplete, redirecting to business-info');
            return '/onboarding/business-info';
        }

        // Check if services exist
        try {
            const services = await businessService.getServices(businessData.id);
            console.log('Services check:', {
                servicesCount: services?.length || 0,
                services: services
            });
            
            if (!services || services.length === 0) {
                console.log('No services found, redirecting to services step');
                return '/onboarding/services';
            }

            // Check if staff exist
            const staff = await businessService.getAllStaff(businessData.id);
            console.log('Staff check:', {
                staffCount: staff?.length || 0,
                staff: staff
            });
            
            if (!staff || staff.length === 0) {
                console.log('No staff found, redirecting to staff step');
                return '/onboarding/staff';
            }

            // All onboarding steps complete, go to dashboard
            console.log('✅ Onboarding complete! All steps done (manual check). Redirecting to dashboard.');
            return '/dashboard';
        } catch (error: any) {
            // If services/staff endpoints fail, log the error but check if it's a 404
            console.error('Error checking services/staff:', error);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            
            // If it's a 404, it might mean the endpoints don't exist or business doesn't have them
            // In that case, if profile is complete, we might allow going to dashboard
            // But for now, let's be safe and redirect to services
            if (error.response?.status === 404) {
                console.warn('Services/staff endpoints returned 404. This might mean they are optional.');
                // If profile is complete, allow proceeding (services/staff might be optional)
                // But let's still redirect to services to be safe
            }
            return '/onboarding/services';
        }
    } catch (error) {
        console.error('Error determining onboarding step:', error);
        // On error, default to business info step
        return '/onboarding/business-info';
    }
}

