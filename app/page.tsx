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

interface ParsedInput {
  data: string[];
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

  const validateInput = (parsedInput: ParsedInput): string | null => {
    if (!parsedInput.data) {
      return 'Input must contain a "data" property';
    }

    if (!Array.isArray(parsedInput.data)) {
      return 'The "data" property must be an array';
    }

    for (const item of parsedInput.data) {
      if (typeof item !== 'string') {
        return 'All array elements must be strings';
      }

      if (/^[A-Za-z]+$/.test(item) && item.length > 1) {
        return 'Alphabets must be single characters';
      }

      if (!/^\d+$/.test(item) && !/^[A-Za-z]$/.test(item)) {
        return 'Array elements must be either numbers or single alphabets';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    try {
      let parsedInput: ParsedInput;
      try {
        parsedInput = JSON.parse(jsonInput);
      } catch {
        setError('Invalid JSON format. Please check your input syntax.');
        return;
      }

      const validationError = validateInput(parsedInput);
      if (validationError) {
        setError(validationError);
        return;
      }

      const res = await fetch('/api/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedInput),
      });

      const data = await res.json();
      
      if (!data.is_success) {
        setError(data.error || 'An error occurred while processing your request');
        return;
      }

      setResponse(data);
      setSelectedFilters([
        { value: 'numbers', label: 'Numbers' },
        { value: 'highest_alphabet', label: 'Highest Alphabet' }
      ]);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const getFilteredResponse = () => {
    if (!response) return null;

    const result: Partial<Record<keyof ApiResponse, unknown>> = {};
    selectedFilters.forEach(filter => {
      if (response[filter.value]) {
        result[filter.value] = response[filter.value];
      }
    });
    return result;
  };

  const formatFilteredResponse = (filteredData: Partial<Record<keyof ApiResponse, unknown>>) => {
    return Object.entries(filteredData).map(([key, value]) => (
      <div key={key} className="mb-2">
        <span className="font-semibold capitalize text-gray-700">{key.replace('_', ' ')}: </span>
        <span className="text-gray-800">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
      </div>
    ));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          BFHL - Assignment
        </h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">API Input</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="jsonInput" className="block text-sm font-medium text-gray-700">
                JSON Data
              </label>
              <textarea
                id="jsonInput"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={'Enter JSON (e.g., {"data": ["M", "1", "334", "4", "B"]})'}
                className="w-full p-4 border border-gray-200 rounded-lg font-mono text-sm min-h-[120px] 
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                          text-gray-800 placeholder-gray-400 bg-white"
              />
              <p className="text-sm text-gray-500">
                Array elements must be either numbers or single alphabets. Example: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">[&quot;A&quot;, &quot;1&quot;, &quot;B&quot;, &quot;2&quot;]</code>
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 
                       transition-colors font-medium shadow-sm hover:shadow-md 
                       active:transform active:scale-[0.98]"
            >
              Process Data
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-100 text-red-700 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {response && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Results</h2>
              <Select
                isMulti
                options={filterOptions}
                value={selectedFilters}
                onChange={(selected) => setSelectedFilters(selected as FilterOption[])}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select filters..."
              />
            </div>

            {selectedFilters.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Filtered Response</h3>
                <div className="space-y-2 text-base">
                  {formatFilteredResponse(getFilteredResponse() || {})}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
