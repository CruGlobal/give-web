import React, { ChangeEvent, FocusEvent } from 'react';
import SelectInput, { Option } from '../../form/SelectInput';

interface RegionSelectProps {
  addressDisabled?: boolean,
  regions: Option[],
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void,
  onBlur: (event: FocusEvent<HTMLSelectElement>) => void,
  refreshRegions: () => void,
  value: string,
  error?: string,
  canRetry?: boolean,
}

const RegionSelect = ({
  addressDisabled = false,
  regions,
  onChange,
  onBlur,
  refreshRegions,
  value,
  error,
  canRetry = false,
}: RegionSelectProps) => {

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event);
  };

  const handleRetry = () => {
    refreshRegions();
  };

  return (
    <div className={`form-group is-required'${error && ' has-error' || ''}`}>
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
    </div>
  );
};

export default RegionSelect;
