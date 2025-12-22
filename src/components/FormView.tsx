'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { useBookingContext } from '@/hooks/useBookingContext';
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
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const departInput = document.getElementById('departDate') as HTMLInputElement;
    const returnInput = document.getElementById('returnDate') as HTMLInputElement;
    if (departInput) departInput.min = today;
    if (returnInput) returnInput.min = today;
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
  
  return (
    <div className="form-view active">
      <div className="form-intro">
        <h2>New Booking Enquiry</h2>
        <p>Fill in the customer details below to start your booking. All fields are optional — skip to chat anytime.</p>
      </div>
      
      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-section-title">Customer Details</div>
          
          {passengers.map((passenger, index) => (
            <div key={passenger.id} className="passenger-row-wrapper">
              <div className="passenger-row">
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
                <Input
                  label={index === 0 ? "First Name" : ""}
                  id="firstName"
                  placeholder="e.g. Arun"
                  value={passenger.firstName}
                  onChange={(e) => handleChange(e, passenger.id)}
                />
                <Input
                  label={index === 0 ? "Last Name" : ""}
                  id="lastName"
                  placeholder="e.g. Kumar"
                  value={passenger.lastName}
                  onChange={(e) => handleChange(e, passenger.id)}
                />
                {passengers.length > 1 && (
                  <button
                    type="button"
                    className="remove-passenger-btn"
                    onClick={() => handleRemovePassenger(passenger.id)}
                    title="Remove passenger"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M15 9l-6 6M9 9l6 6"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <button type="button" className="add-passenger-btn" onClick={handleAddPassenger}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
            Add Another Passenger
          </button>
        </div>
        
        <div className="form-section">
          <div className="form-section-title">Contact Information</div>
          <div className="form-group full-width">
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="e.g. customer@email.com"
              value={formData.email || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group full-width">
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
        
        <div className="form-section">
          <div className="form-section-title">Travel Details</div>
          <div className="form-row">
            <Input
              label="From (Origin)"
              id="origin"
              placeholder="e.g. SUV"
              maxLength={3}
              style={{ textTransform: 'uppercase' }}
              value={formData.origin || ''}
              onChange={handleChange}
            />
            <Input
              label="To (Destination)"
              id="destination"
              placeholder="e.g. NAN"
              maxLength={3}
              style={{ textTransform: 'uppercase' }}
              value={formData.destination || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
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
          <div className="form-group full-width">
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
        
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onSkip}>
            Skip to Chat
          </Button>
          <Button type="submit" variant="primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
            Start Booking
          </Button>
        </div>
      </form>
    </div>
  );
}