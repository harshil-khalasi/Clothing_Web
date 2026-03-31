import React from 'react';

const Input = ({ label, type = 'text', placeholder, value, onChange, name, required = false, className = '', error = '' }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-pink-600">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Input;
