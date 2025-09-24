"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAddressAutocomplete } from '@/hooks/useGeocoding';
import type { GeocodeResult } from '@/lib/geocoding';

export interface AddressAutocompleteProps {
  value?: string;
  onChange?: (address: string) => void;
  onSelect?: (result: GeocodeResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  country?: string;
  proximity?: [number, number];
  limit?: number;
}

/**
 * AddressAutocomplete component with Mapbox geocoding
 * Provides real-time address suggestions with caching
 */
export function AddressAutocomplete({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Enter an address...',
  className,
  disabled = false,
  country,
  proximity,
  limit = 5,
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { query, search, clear, results, isLoading, error } = useAddressAutocomplete(300, {
    country,
    proximity,
    limit,
    autocomplete: true,
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    
    if (newValue.trim()) {
      search(newValue);
      setIsOpen(true);
    } else {
      clear();
      setIsOpen(false);
    }
  };

  // Handle result selection
  const handleSelect = (result: GeocodeResult) => {
    setInputValue(result.place_name);
    onChange?.(result.place_name);
    onSelect?.(result);
    setIsOpen(false);
    clear();
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    clear();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-20"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {inputValue && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Results dropdown */}
      {isOpen && (results.length > 0 || error) && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto">
          <CardContent className="p-0">
            {error ? (
              <div className="p-3 text-sm text-destructive">
                {error}
              </div>
            ) : (
              <div className="py-1">
                {results.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-start gap-2"
                    onClick={() => handleSelect(result)}
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {result.place_name}
                      </div>
                      {result.place_type.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {result.place_type.join(', ')}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Simple address input with geocoding validation
 * For cases where you just need address validation without autocomplete
 */
export interface AddressInputProps {
  value?: string;
  onChange?: (address: string, coordinates?: [number, number]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  country?: string;
  validateOnBlur?: boolean;
}

export function AddressInput({
  value = '',
  onChange,
  placeholder = 'Enter an address...',
  className,
  disabled = false,
  country,
  validateOnBlur = true,
}: AddressInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { geocode } = useAddressAutocomplete(0, { country, limit: 1 });

  const validateAddress = async (address: string) => {
    if (!address.trim() || !validateOnBlur) return;

    setIsValidating(true);
    setValidationError(null);

    try {
      const results = await geocode(address);
      if (results.length > 0) {
        const [lng, lat] = results[0].center;
        onChange?.(address, [lng, lat]);
      } else {
        setValidationError('Address not found');
        onChange?.(address);
      }
    } catch (error) {
      setValidationError('Failed to validate address');
      onChange?.(address);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setValidationError(null);
    onChange?.(newValue);
  };

  const handleBlur = () => {
    validateAddress(inputValue);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={className}>
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            validationError && "border-destructive",
            "pr-10"
          )}
        />
        
        {isValidating && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      
      {validationError && (
        <p className="text-sm text-destructive mt-1">{validationError}</p>
      )}
    </div>
  );
}
