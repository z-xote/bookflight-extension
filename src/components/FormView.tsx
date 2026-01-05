'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { CityAutocomplete } from './ui/CityAutocomplete';
import { useBookingContext } from '@/hooks/useBookingContext';
import { cn } from '@/lib/utils';
import type { BookingContext, FormSubmission, SubmissionType } from '@/types';

interface FormViewProps {
  onSubmit: (formData: FormSubmission) => void; 
  onSkip: (formData: FormSubmission) => void;  
}

interface Passenger {
  id: number;
  title: string;
  firstName: string;
  lastName: string;
}

// Validation: Check if Booking Guide requirements are met
const isBookingGuideReady = (
  passengers: Passenger[], 
  formData: BookingContext
): boolean => {
  const hasValidPassenger = passengers.some(
    p => p.firstName.trim() && p.lastName.trim()
  );
  const hasPhone = !!formData.phone?.trim();
  const hasTravelDetails = !!(
    formData.origin?.trim() && 
    formData.destination?.trim() && 
    formData.departDate
  );
  return hasValidPassenger && hasPhone && hasTravelDetails;
};

const buildFormSubmission = (
  passengers: Passenger[],
  formData: BookingContext,
  submissionType: SubmissionType
): FormSubmission => {
  return {
    submission_type: submissionType,
    passengers: passengers.map(p => ({
      title: p.title,
      firstName: p.firstName,
      lastName: p.lastName
    })),
    contact_info: {
      email: formData.email,
      phone: formData.phone
    },
    travel_details: {
      origin: formData.origin,
      destination: formData.destination,
      departure: formData.departDate,
      return: formData.returnDate,
      trip_type: formData.tripType
    }
  };
};

export function FormView({ onSubmit, onSkip }: FormViewProps) {
  const { context, setContext } = useBookingContext();
  const [formData, setFormData] = useState<BookingContext>(context);
  
  // Initialize passengers from context if available, otherwise default to one empty passenger
  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    if (context.passengers && context.passengers.length > 0) {
      return context.passengers.map((p, index) => ({
        id: index + 1,
        title: p.title,
        firstName: p.firstName,
        lastName: p.lastName
      }));
    }
    return [{ id: 1, title: '', firstName: '', lastName: '' }];
  });
  
  const [isNearBottom, setIsNearBottom] = useState(false);
  const formViewRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const isGuideReady = isBookingGuideReady(passengers, formData);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const departInput = document.getElementById('departDate') as HTMLInputElement;
    const returnInput = document.getElementById('returnDate') as HTMLInputElement;
    if (departInput) departInput.min = today;
    if (returnInput) returnInput.min = today;
  }, []);

  useEffect(() => {
    const formView = formViewRef.current;
    if (!formView) return;

    const checkScrollPosition = () => {
      const { scrollTop, scrollHeight, clientHeight } = formView;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsNearBottom(distanceFromBottom < 100);
    };

    const handleScroll = () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(checkScrollPosition, 50);
    };

    formView.addEventListener('scroll', handleScroll);
    checkScrollPosition();

    return () => {
      formView.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, passengerId?: number) => {
    const { id, value } = e.target;

    if (passengerId !== undefined) {
      setPassengers(prev => prev.map(p => 
        p.id === passengerId ? { ...p, [id]: value } : p
      ));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleAddPassenger = () => {
    const newId = Math.max(...passengers.map(p => p.id)) + 1;
    setPassengers(prev => [...prev, { id: newId, title: '', firstName: '', lastName: '' }]);
  };

  const handleRemovePassenger = (passengerId: number) => {
    if (passengers.length > 1) {
      setPassengers(prev => prev.filter(p => p.id !== passengerId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formSubmission = buildFormSubmission(passengers, formData, 'filled_form');

    // Update context with passengers array
    const updatedFormData: BookingContext = {
      ...formData,
      passengers: passengers.map(p => ({
        title: p.title,
        firstName: p.firstName,
        lastName: p.lastName
      }))
    };

    setContext(updatedFormData);
    onSubmit(formSubmission);
  };

  const handleSkipToChat = () => {
    const formSubmission = buildFormSubmission(passengers, formData, 'skipped_form');
    onSkip(formSubmission);
  };

  const handleFormSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    handleSubmit(e as React.FormEvent);
  };

  return (
    <div ref={formViewRef} className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-0 bg-gray-50">
      {/* Form Intro */}
      <div className="bg-gradient-soft border-b-[0.5px] border-gray-100 pb-3 pt-5 px-5">
        <h2 className="text-lg font-bold text-gray-900 mb-1.5">New Booking Enquiry</h2>
        <p className="text-[13px] text-gray-600 leading-normal">
          Fill in the customer details below to start your booking. All fields are optional — skip to chat anytime.
        </p>
      </div>

      <form className="flex flex-col gap-4 p-5 pb-28">
        {/* Customer Details Section */}
        <div className="flex flex-col gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-red-600 pb-1 border-b-2 border-red-100">
            Customer Details
          </div>

          {passengers.map((passenger, index) => (
            <div key={passenger.id} className="mb-3 last:mb-0">
              <div className="flex items-end gap-2">
                <div className="min-w-[70px] shrink-0 basis-[70px]">
                  <Select
                    label={index === 0 ? "Title" : ""}
                    id="title"
                    value={passenger.title}
                    onChange={(e) => handleChange(e, passenger.id)}
                    options={[
                      { value: '', label: 'Select' },
                      { value: 'MR', label: 'Mr' },
                      { value: 'MRS', label: 'Mrs' },
                      { value: 'MS', label: 'Ms' },
                      { value: 'MSTR', label: 'Master' },
                      { value: 'MISS', label: 'Miss' }
                    ]}
                  />
                </div>
                <div className="min-w-[100px] flex-1 basis-[110px]">
                  <Input
                    label={index === 0 ? "First Name" : ""}
                    id="firstName"
                    placeholder="e.g. Arun"
                    value={passenger.firstName}
                    onChange={(e) => handleChange(e, passenger.id)}
                  />
                </div>
                <div className="min-w-[100px] flex-1 basis-[110px]">
                  <Input
                    label={index === 0 ? "Last Name" : ""}
                    id="lastName"
                    placeholder="e.g. Kumar"
                    value={passenger.lastName}
                    onChange={(e) => handleChange(e, passenger.id)}
                  />
                </div>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    className="flex h-[42px] w-8 shrink-0 items-center justify-center rounded-md border-[1.5px] border-red-200 bg-white text-red-500 transition-all hover:bg-red-50 hover:border-red-400 hover:text-red-600"
                    onClick={() => handleRemovePassenger(passenger.id)}
                    title="Remove passenger"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M15 9l-6 6M9 9l6 6"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          <button 
            type="button" 
            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-transparent p-2.5 text-[11px] font-medium font-sans text-gray-500 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            onClick={handleAddPassenger}
          >
            <svg className="transition-transform group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
            Add Another Passenger
          </button>
        </div>

        {/* Contact Information Section */}
        <div className="flex flex-col gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-red-600 pb-1 border-b-2 border-red-100">
            Contact Information
          </div>
          <div className="flex gap-3">
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="e.g. customer@email.com"
              value={formData.email || ''}
              onChange={handleChange}
            />
            <Input
              label="Phone Number"
              id="phone"
              type="tel"
              placeholder="e.g. +679 9274730"
              value={formData.phone || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Travel Details Section */}
        <div className="flex flex-col gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-red-600 pb-1 border-b-2 border-red-100">
            Travel Details
          </div>

          {/* Origin & Destination with City Search */}
          <div className="flex gap-3">
            <CityAutocomplete
              label="From (Origin)"
              id="origin"
              placeholder="City or code"
              value={formData.origin || ''}
              onChange={handleChange}
            />
            <CityAutocomplete
              label="To (Destination)"
              id="destination"
              placeholder="City or code"
              value={formData.destination || ''}
              onChange={handleChange}
            />
          </div>

          {/* Search hint */}
          <p className="text-[10px] text-gray-400 -mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            Type city name or IATA code to search
          </p>

          <div className="flex gap-3">
            <Input
              label="Departure Date"
              id="departDate"
              type="date"
              value={formData.departDate || ''}
              onChange={handleChange}
            />
            <Input
              label="Return Date"
              id="returnDate"
              type="date"
              value={formData.returnDate || ''}
              onChange={handleChange}
            />
          </div>
          <div className="w-full">
            <Select
              label="Trip Type"
              id="tripType"
              value={formData.tripType || 'return'}
              onChange={handleChange}
              options={[
                { value: 'return', label: 'Return' },
                { value: 'oneway', label: 'One Way' },
                { value: 'multi', label: 'Multi-City' }
              ]}
            />
          </div>
        </div>
      </form>

      {/* Always-Fixed Action Buttons */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-20 flex gap-2.5 p-5 bg-white border-t border-gray-200 transition-all duration-200",
        isNearBottom ? "shadow-none" : "shadow-sticky-footer before:content-[''] before:absolute before:-top-10 before:left-0 before:right-0 before:h-10 before:bg-gradient-to-b before:from-transparent before:to-white before:pointer-events-none"
      )}>
        <Button type="button" variant="secondary" onClick={handleSkipToChat}>
          Skip to Chat
        </Button>
        <Button 
          type="button" 
          variant="primary" 
          onClick={handleFormSubmit}
          disabled={!isGuideReady}
          title={!isGuideReady ? "Fill required fields: passengers, phone, travel details" : ""}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
          Booking Guide
        </Button>
      </div>
    </div>
  );
}