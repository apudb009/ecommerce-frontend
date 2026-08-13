import { Truck, ShieldCheck, Package } from 'lucide-react';

const TrustBadges = () => {
  return (
    <div className="mt-6 grid grid-cols-3 gap-3 border-t pt-6">
      <div className="flex flex-col items-center text-center">
        <Truck className="mb-1 h-5 w-5 text-gray-400" />
        <span className="text-xs text-gray-500">Fast Delivery</span>
      </div>
      <div className="flex flex-col items-center text-center">
        <ShieldCheck className="mb-1 h-5 w-5 text-gray-400" />
        <span className="text-xs text-gray-500">Secure Payment</span>
      </div>
      <div className="flex flex-col items-center text-center">
        <Package className="mb-1 h-5 w-5 text-gray-400" />
        <span className="text-xs text-gray-500">Easy Returns</span>
      </div>
    </div>
  );
};

export default TrustBadges;
