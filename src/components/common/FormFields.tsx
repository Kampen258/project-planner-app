import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-white/80 mb-2">
      {label} {required && <span className="text-red-300">*</span>}
    </label>
    {children}
  </div>
);

interface TextInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ name, value, onChange, placeholder, required }) => (
  <input
    type="text"
    name={name}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
    placeholder={placeholder}
    required={required}
  />
);

interface TextAreaProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  required?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({ name, value, onChange, placeholder, rows = 3, required }) => (
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    rows={rows}
    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
    placeholder={placeholder}
    required={required}
  />
);

interface SelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ name, value, onChange, options }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
  >
    {options.map(option => (
      <option key={option.value} value={option.value} className="bg-gray-800">
        {option.label}
      </option>
    ))}
  </select>
);

interface StepContentProps {
  title: string;
  children: React.ReactNode;
}

export const StepContent: React.FC<StepContentProps> = ({ title, children }) => (
  <div className="space-y-6">
    <h4 className="text-lg font-medium text-white mb-4">{title}</h4>
    {children}
  </div>
);