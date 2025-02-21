'use client';

import { useState } from 'react';
import Select from 'react-select';

interface ApiResponse {
  is_success: boolean;
  user_id: string;
  email: string;
  roll_number: string;
  numbers: string[];
  alphabets: string[];
  highest_alphabet: string[];
  error?: string;
}

interface FilterOption {
  value: keyof ApiResponse;
  label: string;
}

const filterOptions: FilterOption[] = [
  { value: 'numbers', label: 'Numbers' },
  { value: 'alphabets', label: 'Alphabets' },
  { value: 'highest_alphabet', label: 'Highest Alphabet' }
];

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    try {
      // Validate JSON input
      const parsedInput = JSON.parse(jsonInput);
      
      const res = await fetch('/api/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedInput),
      });

      const data = await res.json();
      
      if (!data.is_success) {
        setError(data.error || 'An error occurred');
        return;
      }

      setResponse(data);
      // Set default filters
      setSelectedFilters([
        { value: 'numbers', label: 'Numbers' },
        { value: 'highest_alphabet', label: 'Highest Alphabet' }
      ]);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const getFilteredResponse = () => {
    if (!response) return null;

    const result: Partial<Record<keyof ApiResponse, any>> = {};
    selectedFilters.forEach(filter => {
      if (response[filter.value]) {
        result[filter.value] = response[filter.value];
      }
    });
    return result;
  };

  const formatFilteredResponse = (filteredData: any) => {
    return Object.entries(filteredData).map(([key, value]) => (
      <div key={key} className="mb-2">
        <span className="font-semibold capitalize">{key.replace('_', ' ')}: </span>
        <span>{Array.isArray(value) ? value.join(', ') : value}</span>
      </div>
    ));
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Enter JSON (e.g., {"data": ["M", "1", "334", "4", "B"]})'
            className="w-full p-3 border rounded-lg min-h-[100px] font-mono text-sm"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-6 space-y-4">
          <Select
            isMulti
            options={filterOptions}
            value={selectedFilters}
            onChange={(selected) => setSelectedFilters(selected as FilterOption[])}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select filters..."
          />

          <div className="p-4 bg-gray-50 rounded-lg">
            {formatFilteredResponse(getFilteredResponse())}
          </div>
        </div>
      )}
    </main>
  );
}
