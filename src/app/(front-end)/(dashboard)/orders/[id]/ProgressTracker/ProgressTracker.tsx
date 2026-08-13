import { OrderStatus } from '@/lib/types';
import { CheckCircle, Clock, CreditCard, LucideProps, Package, Truck } from 'lucide-react';
import { FC, ForwardRefExoticComponent, RefAttributes } from 'react';

const PROGRESS_STEPS: {
  status: OrderStatus;
  label: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
}[] = [
  { status: 'PENDING', label: 'Order Placed', icon: Clock },
  { status: 'PAID', label: 'Payment Confirmed', icon: CreditCard },
  { status: 'PROCESSING', label: 'Processing', icon: Package },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

type Props = {
  currentStep: number;
};

const ProgressTracker: FC<Props> = ({ currentStep }) => {
  return (
    <div className="mb-6 rounded-lg border bg-white p-5">
      <div className="relative flex justify-between">
        {/* progress line */}
        <div className="absolute left-0 top-5 h-0.5 w-full bg-gray-200" />
        <div
          className="absolute left-0 top-5 h-0.5 bg-blue-600 transition-all"
          style={{ width: `${(currentStep / (PROGRESS_STEPS.length - 1)) * 100}%` }}
        />

        {PROGRESS_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isDone = currentStep >= i;
          const isCurrent = currentStep === i;

          return (
            <div key={step.status} className="relative flex flex-col items-center">
              <div
                className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  isDone
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`mt-2 text-center text-xs ${
                  isCurrent
                    ? 'font-semibold text-blue-600'
                    : isDone
                      ? 'text-gray-600'
                      : 'text-gray-300'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
