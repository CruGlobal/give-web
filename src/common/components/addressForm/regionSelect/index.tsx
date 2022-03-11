import React, { ChangeEvent, FocusEvent } from 'react';
import SelectInput, { Option } from '../../form/SelectInput';

interface RegionSelectProps {
  addressDisabled: boolean,
  regions: Option[],
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void,
  onBlur: (event: FocusEvent<HTMLSelectElement>) => void,
  refreshRegions: () => void,
  value: string,
  error?: string,
  canRetry: boolean,
}

const RegionSelect = ({
  addressDisabled,
  regions,
  onChange,
  onBlur,
  refreshRegions,
  value,
  error,
  canRetry,
}: RegionSelectProps) => {

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event);
  };

  const handleRetry = () => {
    refreshRegions();
  };

  return (
    <SelectInput
      title="State"
      name="region"
      required={true}
      disabled={addressDisabled}
      options={regions}
      onChange={handleChange}
      onBlur={onBlur}
      value={value}
      error={error}
      retry={error && canRetry ? handleRetry : undefined}
    />
  );
};

export default RegionSelect;