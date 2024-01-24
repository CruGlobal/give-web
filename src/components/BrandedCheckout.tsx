import * as React from 'react';

interface BrandedCheckoutProps {
  designationNumber: string;
  showCoverFees?: boolean;
}

export const BrandedCheckout: React.FC<BrandedCheckoutProps> = ({
  designationNumber,
  showCoverFees = false,
}) => (
  <div>
    <h1>Branded Checkout for {designationNumber}</h1>
    {showCoverFees ? 'Showing' : 'Not showing'} cover fees
  </div>
);
