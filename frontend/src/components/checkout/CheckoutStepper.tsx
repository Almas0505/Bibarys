interface CheckoutStepperProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: 'Адрес' },
  { number: 2, title: 'Доставка' },
  { number: 3, title: 'Оплата' },
  { number: 4, title: 'Подтверждение' },
];

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-between max-w-3xl mx-auto">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep >= step.number
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <span className="text-sm mt-2 text-center">{step.title}</span>
          </div>
          
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 ${
                currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
