import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrandedCheckout } from './components/BrandedCheckout';
import Loader from './loaders/loader';

const container = document.querySelector('branded-checkout');
if (!container) {
  throw new Error('No <branded-checkout> element found');
}

const designationNumber = container.getAttribute('designation-number');
if (!designationNumber) {
  throw new Error('No designation-number set');
}

const showCoverFees = container.getAttribute('show-cover-fees') === 'true';

Loader.start(['branded.css']).then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <BrandedCheckout
        designationNumber={designationNumber}
        showCoverFees={showCoverFees}
      />
    </React.StrictMode>,
    container,
  );
});
