import React, { useState, useRef } from 'react';
import Input from './ui/Input';
import debounce from 'lodash/debounce';
import axiosInstance from '../api/axiosInstance';
import { Plus } from 'lucide-react';

const AddAttendee = ({ attendees, setAttendees, userEmail, attendeeError, setAttendeeError }) => {
  const [email, setEmail] = useState('');
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  //const [attendeeError, setAttendeeError] = useState('');
  // Debounced function to handle email input changes
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (query.trim() !== '') {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/email/search-email?query=${query}`);
          setEmailSuggestions(response.data);
        } catch (error) {
          setEmailSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setEmailSuggestions([]);
      }
    }, 500)
  ).current;

  const handleInputChange = (e) => {
    const query = e.target.value;
    setEmail(query);
    setAttendeeError('');
    debouncedSearch(query);
  };

  const validateAndAdd = async (newEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail) {
      setAttendeeError('Please enter an email address before adding.');
      return;
    }
    if (!emailRegex.test(newEmail)) {
      setAttendeeError('Please enter a valid email address.');
      return;
    }
    if (attendees.includes(newEmail)) {
      setAttendeeError('This email is already added.');
      return;
    }
    if (newEmail === userEmail) {
      setAttendeeError('You cannot add yourself as an attendee.');
      return;
    }
    try {
      const res = await axiosInstance.get(`/users/check-email?email=${newEmail}&context=attendee-check`);
      if (res.status === 200 && res.data.exists) {
        setAttendees([...attendees, newEmail]);
        setEmail('');
        setEmailSuggestions([]);
        setAttendeeError('');
      } else {
        setAttendeeError('Email does not exist in the system.');
      }
    } catch {
      setAttendeeError('Email does not exist in the system.');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    validateAndAdd(suggestion);
  };

  const handleAddEmail = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await validateAndAdd(email.trim());
    }
  };
  const handleAddAttendee = async() => {
    const newEmail = attendees[attendees.length - 1].trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newEmail) {
      setAttendeeError('Please enter an email address before adding another.');
      return;
    }

    if (!emailRegex.test(newEmail)) {
      setAttendeeError('Please enter a valid email address.');
      return;
    }

    if (attendees.slice(0, -1).includes(newEmail)) {
      setAttendeeError('This email is already added.');
      return;
    }

    if (newEmail === userEmail) {
      setAttendeeError('You cannot add yourself as an attendee.');
      return;
    }

    try {
      const res = await axiosInstance.get(`/users/check-email?email=${newEmail}&context=attendee-check`);
      if (res.status === 200 && res.data.exists) {
        setAttendees([...attendees, '']);
        setAttendeeError('');
      } else {
        setAttendeeError('Email does not exist in the system.');
      }
    } catch (err) {
      console.error("Error checking email:", err);
      setAttendeeError('email does not exist');
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        value={email}
        onChange={handleInputChange}
        onKeyDown={handleAddEmail}
        placeholder="Search for emails"
        className="border p-2 rounded-md w-full"
        
      />
      <button
                type="button"
                onClick={handleAddAttendee}
                className="absolute inset-y-0 right-2 flex items-center justify-center text-blue-600 hover:text-blue-800"
              >
                <Plus size={20} />
              </button> 
      {isLoading && <p className="text-gray-500">Loading...</p>}
      {emailSuggestions.length > 0 && (
        <ul className="border rounded-md shadow-lg max-h-40 overflow-y-auto">
          {emailSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer p-2 hover:bg-gray-200"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddAttendee;
// ... existing code ...