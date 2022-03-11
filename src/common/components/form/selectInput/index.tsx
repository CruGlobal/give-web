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
      { title && <label data-testid="SelectInputLabel">{title}</label> }
      <div className="form-group">
        <select
          data-testid="SelectInputField"
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
              <span data-testid="SelectInputError">{error}</span>
              { retry && (
                <button
                  id="retryButton"
                  data-testid="SelectInputRetryButton"
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
