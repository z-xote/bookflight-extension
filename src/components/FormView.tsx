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

export function FormView({ onSubmit, onSkip }: FormViewProps) {
  const { context, setContext } = useBookingContext();
  const [formData, setFormData] = useState<BookingContext>(context);
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const departInput = document.getElementById('departDate') as HTMLInputElement;
    const returnInput = document.getElementById('returnDate') as HTMLInputElement;
    if (departInput) departInput.min = today;
    if (returnInput) returnInput.min = today;
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContext(formData);
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
          <div className="form-row">
            <Input
              label="First Name"
              id="firstName"
              placeholder="e.g. Arun"
              value={formData.firstName || ''}
              onChange={handleChange}
            />
            <Input
              label="Last Name"
              id="lastName"
              placeholder="e.g. Kumar"
              value={formData.lastName || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <Select
              label="Title"
              id="title"
              value={formData.title || ''}
              onChange={handleChange}
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