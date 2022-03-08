import React, { ChangeEvent, FocusEvent } from 'react';
import SelectInput, { Option } from '../../form/selectInput';

interface CountrySelectProps {
  addressDisabled: boolean,
  countries: Option[],
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void,
  onBlur: (event: FocusEvent<HTMLSelectElement>) => void,
  onSelectCountry: (country?: string, initial?: boolean) => void,
  refreshCountries: () => void,
  value: string,
  error?: string,
  canRetry: boolean,
}

const CountrySelect = ({
  addressDisabled,
  countries,
  onChange,
  onBlur,
  onSelectCountry,
  refreshCountries,
  value,
  error,
  canRetry,
}: CountrySelectProps) => {

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event);
    onSelectCountry(event.target.value);
  };

  const handleRetry = () => {
    refreshCountries();
  };

  return (
    <SelectInput
      title="Country"
      name="country"
      required={true}
      disabled={addressDisabled}
      options={countries}
      onChange={handleChange}
      onBlur={onBlur}
      value={value}
      error={error}
      retry={error && canRetry ? handleRetry : undefined}
    />
  );
};

export default CountrySelect;
