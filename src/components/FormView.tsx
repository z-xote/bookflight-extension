'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { useBookingContext } from '@/hooks/useBookingContext';
import { cn } from '@/lib/utils';
import type { BookingContext } from '@/types';

interface FormViewProps {
  onSubmit: () => void;
  onSkip: () => void;
}

interface Passenger {
  id: number;
  title: string;
  firstName: string;
  lastName: string;
}

export function FormView({ onSubmit, onSkip }: FormViewProps) {
  const { context, setContext } = useBookingContext();
  const [formData, setFormData] = useState<BookingContext>(context);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: 1, title: '', firstName: '', lastName: '' }
  ]);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const formViewRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  
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
      
      // Consider "near bottom" when within 100px
      setIsNearBottom(distanceFromBottom < 100);
    };
    
    const handleScroll = () => {
      // Debounce scroll handler to prevent flickering
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(checkScrollPosition, 50);
    };
    
    formView.addEventListener('scroll', handleScroll);
    checkScrollPosition(); // Check initial position
    
    return () => {
      formView.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, passengerId?: number) => {
    const { id, value } = e.target;
    
    if (passengerId !== undefined) {
      // Update specific passenger
      setPassengers(prev => prev.map(p => 
        p.id === passengerId ? { ...p, [id]: value } : p
      ));
    } else {
      // Update main form data (non-passenger fields)
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
    
    // Store first passenger in main context for backward compatibility
    const updatedFormData = { ...formData };
    if (passengers[0]) {
      updatedFormData.title = passengers[0].title;
      updatedFormData.firstName = passengers[0].firstName;
      updatedFormData.lastName = passengers[0].lastName;
    }
    
    setContext(updatedFormData);
    onSubmit();
  };
  
  const handleFormSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    handleSubmit(e as React.FormEvent);
  };
  
  return (
    <div ref={formViewRef} className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-0 bg-gray-50">
      {/* Form Intro */}
      <div className="bg-gradient-soft border-b border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-1.5">New Booking Enquiry</h2>
        <p className="text-[13px] text-gray-600 leading-normal">
          Fill in the customer details below to start your booking. All fields are optional — skip to chat anytime.
        </p>
      </div>
      
      <form className="flex flex-col gap-4 p-5 pb-24">{/* Note: pb-24 creates space for fixed footer */}
        {/* Customer Details Section */}
        <div className="flex flex-col gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-red-600 pb-1 border-b-2 border-red-100">
            Customer Details
          </div>
          
          {passengers.map((passenger, index) => (
            <div key={passenger.id} className="mb-3 last:mb-0">
              <div className="flex items-end gap-2">
                <div className="min-w-[85px] shrink-0 basis-[85px]">
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
          <div className="flex gap-3">
            <Input
              label="From (Origin)"
              id="origin"
              placeholder="e.g. SUV"
              maxLength={3}
              className="uppercase"
              value={formData.origin || ''}
              onChange={handleChange}
            />
            <Input
              label="To (Destination)"
              id="destination"
              placeholder="e.g. NAN"
              maxLength={3}
              className="uppercase"
              value={formData.destination || ''}
              onChange={handleChange}
            />
          </div>
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
        <Button type="button" variant="secondary" onClick={onSkip}>
          Skip to Chat
        </Button>
        <Button type="button" variant="primary" onClick={handleFormSubmit}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
          Start Booking
        </Button>
      </div>
    </div>
  );
}