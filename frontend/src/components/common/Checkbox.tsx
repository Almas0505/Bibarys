/**
 * Checkbox Component
 */

import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 ${className}`}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3">
            <label htmlFor={props.id} className="text-sm font-medium text-gray-700">
              {label}
            </label>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
