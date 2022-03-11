import React, { ChangeEvent, FocusEvent, HTMLInputTypeAttribute } from 'react';

interface TextInputProps {
  title?: string,
  type?: HTMLInputTypeAttribute,
  name: string,
  required?: boolean,
  maxLength?: number,
  pattern?: string,
  disabled?: boolean,
  onChange: (event: ChangeEvent<any>) => void,
  onBlur: (event: FocusEvent<any>) => void,
  value?: string,
  error?: string,
}

const TextInput = ({
  title,
  type = 'text',
  name,
  required = false,
  maxLength,
  pattern,
  disabled,
  onChange,
  onBlur,
  value,
  error,
}: TextInputProps) => (
  <div className={`form-group${required && ' is-required' || ''}${error && ' has-error' || ''}`}>
    { title && <label data-testid="TextInputLabel">{title}</label> }
    <input
      data-testid="TextInputField"
      type={type}
      className="form-control form-control-subtle"
      name={name}
      required={required}
      maxLength={maxLength}
      pattern={pattern}
      disabled={disabled}
      onChange={onChange}
      onBlur={onBlur}
      value={value}
    />
    { error && (
      <div role="alert">
        <div className="help-block" data-testid="TextInputError">{error}</div>
      </div>
    )}
  </div>
);

export default TextInput;
