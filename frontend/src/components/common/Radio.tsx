import { InputHTMLAttributes } from 'react';

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Radio({ label, className = '', ...props }: RadioProps) {
  return (
    <label className={`flex items-center cursor-pointer ${className}`}>
      <input
        type="radio"
        className="mr-2 w-4 h-4 text-primary-600 focus:ring-primary-500"
        {...props}
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}
