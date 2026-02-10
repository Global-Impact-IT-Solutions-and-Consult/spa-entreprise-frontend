'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';

import { Button } from "@/components/ui/button";
import CustomInput from '@/components/ui/InputGroup';
import { Select } from '@/components/ui/select';
import { toaster } from "@/components/ui/toaster";
import { Label } from "@/components/ui/label";

import { useOnboardingStore } from '@/store/onboarding.store';
import { businessService, Country as CountryType, State as StateType, City as CityType, UpdateProfileDto } from '@/services/business.service';

const businessTypes = [
    { label: "Select business type", value: "" },
    { label: "SPA", value: "spa" },
    { label: "Barbershop", value: "barbershop" },
    { label: "Hair Salon", value: "hair_salon" },
    { label: "Nail Salon", value: "nail_salon" },
    { label: "Beauty Salon", value: "beauty_salon" },
    { label: "Wellness Center", value: "wellness_center" },
    { label: "Fitness Center", value: "fitness_center" },
    { label: "Other", value: "other" }
];

export default function BusinessInfoPage() {
    const router = useRouter();
    const { businessId, setBusinessId, setBusinessInfo } = useOnboardingStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);

    // Get all countries
    const allCountries = Country.getAllCountries();
    const countryOptions = allCountries.map(c => ({ label: c.name, value: c.isoCode }));

    // Local state for form inputs
    const [formData, setFormData] = useState({
        businessName: '',
        phone: '',
        address: '',
        addressNote: '',
        businessTypeCode: '',
        description: '',
        cacNumber: '',
    });

    // Address selection state
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>('');
    const [selectedStateCode, setSelectedStateCode] = useState<string>('');
    const [selectedCityName, setSelectedCityName] = useState<string>('');
    const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
    const [selectedState, setSelectedState] = useState<IState | null>(null);
    const [selectedCity, setSelectedCity] = useState<ICity | null>(null);

    // Get states and cities based on selection
    const states = selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
    const stateOptions = states.map(s => ({ label: s.name, value: s.isoCode }));

    const cities = (selectedCountryCode && selectedStateCode) ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : [];
    const cityOptions = cities.map(c => ({ label: c.name, value: c.name }));

    // Load existing business data if businessId exists
    useEffect(() => {
        const loadBusinessData = async () => {
            try {
                // Always use getMyBusinesses to get the user's business
                // This is more reliable than using businessId directly
                const businesses = await businessService.getMyBusinesses();

                if (businesses && businesses.length > 0) {
                    const business = businesses[0];
                    setBusinessId(business.id);

                    // Load existing data - use addressRelation if available (new structure), otherwise fall back to legacy fields
                    const businessData = business as any;
                    const addressData = business.addressRelation || {
                        country: business.country,
                        state: business.state,
                        city: business.city,
                        address: business.address,
                        note: business.addressNote
                    };

                    setFormData({
                        businessName: business.businessName || '',
                        phone: business.phone || '',
                        address: addressData?.address || '',
                        addressNote: addressData?.note || '',
                        businessTypeCode: business.businessTypeCode || '',
                        description: business.description || '',
                        cacNumber: business.cacNumber || '',
                    });

                    // Set address selections if they exist (from addressRelation or legacy fields)
                    if (addressData?.country?.isoCode) {
                        setSelectedCountryCode(addressData.country.isoCode);
                        setSelectedCountry(addressData.country);
                    }
                    if (addressData?.state?.isoCode) {
                        setSelectedStateCode(addressData.state.isoCode);
                        setSelectedState(addressData.state);
                    }
                    if (addressData?.city?.name) {
                        setSelectedCityName(addressData.city.name);
                        setSelectedCity(addressData.city);
                    }
                } else if (businessId) {
                    // If we have a businessId but getMyBusinesses didn't return it,
                    // try to fetch it directly (but handle 404 gracefully)
                    try {
                        const business = await businessService.getBusiness(businessId);
                        const businessData = business as any;
                        const addressData = business.addressRelation || {
                            country: business.country,
                            state: business.state,
                            city: business.city,
                            address: business.address,
                            note: business.addressNote
                        };
                        setFormData({
                            businessName: business.businessName || '',
                            phone: business.phone || '',
                            address: addressData?.address || '',
                            addressNote: addressData?.note || '',
                            businessTypeCode: business.businessTypeCode || '',
                            description: business.description || '',
                            cacNumber: business.cacNumber || '',
                        });

                        // Set address selections if they exist
                        if (addressData?.country?.isoCode) {
                            setSelectedCountryCode(addressData.country.isoCode);
                            setSelectedCountry(addressData.country);
                        }
                        if (addressData?.state?.isoCode) {
                            setSelectedStateCode(addressData.state.isoCode);
                            setSelectedState(addressData.state);
                        }
                        if (addressData?.city?.name) {
                            setSelectedCityName(addressData.city.name);
                            setSelectedCity(addressData.city);
                        }
                    } catch (fetchError) {
                        // If business doesn't exist (404), that's okay - it's a new business
                        const error = fetchError as any;
                        if (error.response?.status !== 404) {
                            console.error('Failed to load business:', error);
                        }
                    }
                }
            } catch (error) {
                // If getMyBusinesses fails, it might be because the business doesn't exist yet
                // This is normal for new registrations, so we'll just continue with empty form
                const err = error as any;
                if (err.response?.status !== 404) {
                    console.error('Failed to load businesses:', err);
                }
            } finally {
                setIsLoadingBusiness(false);
            }
        };

        loadBusinessData();
    }, [businessId, setBusinessId]);

    // Handle country selection
    const handleCountryChange = (isoCode: string) => {
        setSelectedCountryCode(isoCode);
        const country = allCountries.find(c => c.isoCode === isoCode);
        setSelectedCountry(country || null);
        // Reset state and city when country changes
        setSelectedStateCode('');
        setSelectedState(null);
        setSelectedCityName('');
        setSelectedCity(null);
    };

    // Handle state selection
    const handleStateChange = (isoCode: string) => {
        setSelectedStateCode(isoCode);
        const state = states.find(s => s.isoCode === isoCode);
        setSelectedState(state || null);
        // Reset city when state changes
        setSelectedCityName('');
        setSelectedCity(null);
    };

    // Handle city selection
    const handleCityChange = (cityName: string) => {
        setSelectedCityName(cityName);
        const city = cities.find(c => c.name === cityName);
        setSelectedCity(city || null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!formData.businessName || !formData.businessTypeCode || !formData.phone || !formData.description || !formData.address) {
            toaster.create({ title: "Validation Error", description: "Please fill all required fields", type: "error" });
            return;
        }

        // Validate address fields
        if (!selectedCountry || !selectedState || !selectedCity) {
            toaster.create({ title: "Validation Error", description: "Please select country, state, and city", type: "error" });
            return;
        }

        if (!businessId) {
            toaster.create({ title: "Error", description: "Business ID not found. Please try logging in again.", type: "error" });
            return;
        }

        setIsLoading(true);

        // Send the exact objects from the country-state-city package
        // The backend validates these objects strictly - must match package structure exactly
        // Use JSON serialization to ensure clean plain objects without any prototype methods
        const countryObject = JSON.parse(JSON.stringify({
            name: selectedCountry.name,
            isoCode: selectedCountry.isoCode,
            flag: selectedCountry.flag,
            phonecode: selectedCountry.phonecode,
            currency: selectedCountry.currency,
            latitude: selectedCountry.latitude,
            longitude: selectedCountry.longitude,
            timezones: selectedCountry.timezones || [],
        }));

        const stateObject = JSON.parse(JSON.stringify({
            name: selectedState.name,
            isoCode: selectedState.isoCode,
            countryCode: selectedState.countryCode,
            latitude: selectedState.latitude,
            longitude: selectedState.longitude,
        }));

        const cityObject = JSON.parse(JSON.stringify({
            name: selectedCity.name,
            countryCode: selectedCity.countryCode,
            stateCode: selectedCity.stateCode,
            latitude: selectedCity.latitude,
            longitude: selectedCity.longitude,
        }));

        // Build the payload, only including fields that have values
        const payload: Partial<UpdateProfileDto> = {
            businessTypeCode: formData.businessTypeCode.toLowerCase(), // Ensure lowercase
            businessName: formData.businessName,
            phone: formData.phone,
            description: formData.description,
            country: countryObject,
            state: stateObject,
            city: cityObject,
            address: formData.address,
        };

        // Only include optional fields if they have values
        if (formData.cacNumber && formData.cacNumber.trim()) {
            payload.cacNumber = formData.cacNumber;
        }
        if (formData.addressNote && formData.addressNote.trim()) {
            payload.addressNote = formData.addressNote;
        }

        // Log the payload for debugging
        console.log('=== PAYLOAD DEBUG ===');
        console.log('Country object (raw from package):', JSON.stringify(selectedCountry, null, 2));
        console.log('Country object (sending):', JSON.stringify(countryObject, null, 2));
        console.log('State object (raw from package):', JSON.stringify(selectedState, null, 2));
        console.log('State object (sending):', JSON.stringify(stateObject, null, 2));
        console.log('City object (raw from package):', JSON.stringify(selectedCity, null, 2));
        console.log('City object (sending):', JSON.stringify(cityObject, null, 2));
        console.log('Full payload:', JSON.stringify(payload, null, 2));

        try {
            // Use PUT /spas/:id/profile endpoint with complete address objects
            await businessService.updateProfile(businessId, payload);

            // Update Store
            setBusinessInfo(formData);

            toaster.create({ title: "Success", description: "Business Information Saved", type: "success" });
            // Skip business-hours (optional) and go directly to services
            router.push('/onboarding/business-hours');
        } catch (error) {
            const err = error as any;
            // Log the full error for debugging
            console.error('Profile update error:', err);
            console.error('Error response:', err.response?.data);
            console.error('Payload sent:', payload);

            const message = err.response?.data?.message || err.response?.data?.error || "Failed to update business profile";
            const errors = err.response?.data?.errors || [];
            const errorDetails = errors.map((e: { field: string; messages?: string[]; message?: string }) =>
                `${e.field}: ${e.messages?.join(', ') || e.message || 'Invalid'}`
            ).join('; ');

            toaster.create({
                title: "Error",
                description: errorDetails ? `${message} - ${errorDetails}` : message,
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingBusiness) {
        return (
            <div className="w-full max-w-[900px] flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[900px]">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Business Information</h1>
                    <p className="text-gray-500 font-medium">Please fill in the correct information of your business</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Business Type */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-medium text-gray-400">Business Type *</Label>
                        <Select
                            className="h-[56px] rounded-lg border-gray-200 focus:border-[#E59622] transition-colors"
                            options={businessTypes}
                            value={formData.businessTypeCode}
                            onChange={(e) => setFormData({ ...formData, businessTypeCode: e.target.value })}
                        />
                    </div>

                    {/* Business Name */}
                    <CustomInput
                        label="Business Name *"
                        placeholder="wellnesspro"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                    />

                    {/* Phone Number */}
                    <CustomInput
                        label="Phone Number *"
                        placeholder="000 000 000"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />

                    {/* CAC Number - Optional */}
                    <CustomInput
                        label="CAC Number"
                        placeholder="RC1254323 (Optional)"
                        name="cacNumber"
                        value={formData.cacNumber}
                        onChange={handleInputChange}
                    />

                    {/* Business Description */}
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                        <Label className="text-sm font-medium text-gray-400">Business Description *</Label>
                        <textarea
                            name="description"
                            className="min-h-[120px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-300 focus:border-[#E59622] focus:ring-1 focus:ring-[#E59622] transition-all outline-none"
                            placeholder="A premium wellness center offering therapeutic massages, facial treatments, and holistic body therapies. Located in the heart of Lagos with certified therapists and relaxing ambiance."
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Country */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-medium text-gray-400">Country *</Label>
                        <Select
                            className="h-[56px] rounded-lg border-gray-200 focus:border-[#E59622] transition-colors"
                            options={countryOptions}
                            value={selectedCountryCode}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            placeholder="Select a country"
                        />
                    </div>

                    {/* State */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-medium text-gray-400">State *</Label>
                        <Select
                            className="h-[56px] rounded-lg border-gray-200 focus:border-[#E59622] transition-colors"
                            options={stateOptions}
                            value={selectedStateCode}
                            onChange={(e) => handleStateChange(e.target.value)}
                            disabled={!selectedCountryCode}
                            placeholder={selectedCountryCode ? "Select a state" : "Select country first"}
                        />
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-medium text-gray-400">City *</Label>
                        <Select
                            className="h-[56px] rounded-lg border-gray-200 focus:border-[#E59622] transition-colors"
                            options={cityOptions}
                            value={selectedCityName}
                            onChange={(e) => handleCityChange(e.target.value)}
                            disabled={!selectedStateCode}
                            placeholder={selectedStateCode ? "Select a city" : "Select state first"}
                        />
                    </div>

                    {/* Address */}
                    <CustomInput
                        label="Street Address *"
                        placeholder="No. 82 Yaya Abatan Rd, College Rd, Ogba"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                    />

                    {/* Address Note - Optional */}
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                        <Label className="text-sm font-medium text-gray-400">Address Note</Label>
                        <CustomInput
                            placeholder="Additional address information (e.g., Floor, Building name) - Optional"
                            name="addressNote"
                            value={formData.addressNote}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-12">
                <Button
                    className="h-[60px] rounded-lg bg-[#E59622] px-10 text-lg font-bold hover:bg-[#d48a1f] transition-colors text-white flex items-center gap-2"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : "Continue"}
                    {!isLoading && <FiArrowRight className="h-5 w-5" />}
                </Button>
            </div>
        </div>
    );
}
