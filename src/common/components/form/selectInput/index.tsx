import React, { ChangeEvent, FocusEvent } from 'react';

interface SelectInputProps {
  title?: string,
  name: string,
  required?: boolean,
  disabled?: boolean,
  options: Option[],
  onChange: (value: ChangeEvent<HTMLSelectElement>) => void,
  onBlur: (value: FocusEvent<HTMLSelectElement>) => void,
  value: string,
  error?: string,
  retry?: () => void,
}

export interface Option {
  name: string,
  displayName: string
}

const SelectInput = ({
  title,
  name,
  required,
  disabled,
  options,
  onChange,
  onBlur,
  value,
  error,
  retry
}: SelectInputProps) => {
  const optionRow = ({ name, displayName }: Option) => (
    <option value={name} label={displayName} />
  );

  return (
    <div className={`form-group${required && ' is-required' || ''}${error && ' has-error' || ''}`}>
      { title && <label>{title}</label> }
      <div className="form-group">
        <select
          className="form-control form-control-subtle"
          name={name}
          required={required}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
        >
          { options.map(optionRow) }
        </select>
        { error && (
          <div role="alert">
            <div className="help-block">
              <span>{error}</span>
              { retry && (
                <button
                  id="retryButton"
                  type="button"
                  className="btn btn-default btn-sm"
                  onClick={retry}
                >
                  {'Retry'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectInput;
