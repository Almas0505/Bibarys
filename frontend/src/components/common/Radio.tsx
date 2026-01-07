/**
 * Radio Button Component
 */

import { InputHTMLAttributes, forwardRef } from 'react';

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="radio"
            className={`w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 ${className}`}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label htmlFor={props.id} className="text-sm font-medium text-gray-700">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export default Radio;
