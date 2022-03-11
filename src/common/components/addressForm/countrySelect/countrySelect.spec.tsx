import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CountrySelect from './';

const countries = [
  { name: '1', displayName: 'Country 1' },
  { name: '2', displayName: 'Country 2' },
];
const value = '1';
const error = 'Error';

const onChange = jest.fn();
const onBlur = jest.fn();
const onSelectCountry = jest.fn();
const refreshCountries = jest.fn();

describe('CountrySelect', () => {
  beforeEach(() => {
    onChange.mockClear();
    onBlur.mockClear();
    onSelectCountry.mockClear();
    refreshCountries.mockClear();
  });

  it('Responds to Change', () => {
    const { getByTestId } = render(
      <CountrySelect
        countries={countries}             
        onChange={onChange}
        onBlur={onBlur}
        onSelectCountry={onSelectCountry}
        refreshCountries={refreshCountries}
        value={value}
      />
    );

    const selectInput = getByTestId('SelectInputField') as HTMLSelectElement;

    fireEvent.change(selectInput, { target: { value: '2' } });

    expect(onChange).toHaveBeenCalled();
    expect(onSelectCountry).toHaveBeenCalled();
  });

  it('Responds to Blur', () => {
    const { getByTestId } = render(
      <CountrySelect
        countries={countries}             
        onChange={onChange}
        onBlur={onBlur}
        onSelectCountry={onSelectCountry}
        refreshCountries={refreshCountries}
        value={value}
      />
    );

    const selectInput = getByTestId('SelectInputField') as HTMLSelectElement;

    fireEvent.focus(selectInput);
    fireEvent.blur(selectInput);
    
    expect(onBlur).toHaveBeenCalled();
  });

  it('Retries Loading Countries', () => {
    const { getByTestId } = render(
      <CountrySelect
        countries={countries}             
        onChange={onChange}
        onBlur={onBlur}
        onSelectCountry={onSelectCountry}
        refreshCountries={refreshCountries}
        value={value}
        error={error}
        canRetry={true}
      />
    );

    const retryButton = getByTestId('SelectInputRetryButton') as HTMLSelectElement;

    userEvent.click(retryButton);
    
    expect(refreshCountries).toHaveBeenCalled();
  });
});
