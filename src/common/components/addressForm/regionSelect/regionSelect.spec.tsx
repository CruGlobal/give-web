import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RegionSelect from './';

const regions = [
  { name: '1', displayName: 'Region 1' },
  { name: '2', displayName: 'Region 2' },
];
const value = '1';
const error = 'Error';

const onChange = jest.fn();
const onBlur = jest.fn();
const refreshRegions = jest.fn();

describe('RegionSelect', () => {
  beforeEach(() => {
    onChange.mockClear();
    onBlur.mockClear();
    refreshRegions.mockClear();
  });

  it('Responds to Change', () => {
    const { getByTestId } = render(
      <RegionSelect
        regions={regions}             
        onChange={onChange}
        onBlur={onBlur}
        refreshRegions={refreshRegions}
        value={value}
      />
    );

    const selectInput = getByTestId('SelectInputField') as HTMLSelectElement;

    fireEvent.change(selectInput, { target: { value: '2' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('Responds to Blur', () => {
    const { getByTestId } = render(
      <RegionSelect
        regions={regions}             
        onChange={onChange}
        onBlur={onBlur}
        refreshRegions={refreshRegions}
        value={value}
      />
    );

    const selectInput = getByTestId('SelectInputField') as HTMLSelectElement;

    fireEvent.focus(selectInput);
    fireEvent.blur(selectInput);
    
    expect(onBlur).toHaveBeenCalled();
  });

  it('Retries Loading Regions', () => {
    const { getByTestId } = render(
      <RegionSelect
        regions={regions}             
        onChange={onChange}
        onBlur={onBlur}
        refreshRegions={refreshRegions}
        value={value}
        error={error}
        canRetry={true}
      />
    );

    const retryButton = getByTestId('SelectInputRetryButton') as HTMLSelectElement;

    userEvent.click(retryButton);
    
    expect(refreshRegions).toHaveBeenCalled();
  });
});
