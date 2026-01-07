/**
 * Checkout Stepper Component
 */

interface Step {
  id: number;
  label: string;
  description: string;
}

interface CheckoutStepperProps {
  currentStep: number;
  steps: Step[];
}

export default function CheckoutStepper({ currentStep, steps }: CheckoutStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 relative">
            {/* Step */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : currentStep === step.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > step.id ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.label}
                </div>
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {step.description}
                </div>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute top-6 left-1/2 w-full h-1 -translate-y-1/2 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                }`}
                style={{ width: 'calc(100% - 3rem)', marginLeft: '1.5rem' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
