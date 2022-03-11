import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SelectInput from './';

const title = "Title";
const options = [
  { name: '1', displayName: 'Option 1' },
  { name: '2', displayName: 'Option 2' },
];
const value = "1";
const error = "Input Error";

const onChange = jest.fn();
const onBlur = jest.fn();
const retry = jest.fn();

describe('SelectInput', () => {
  beforeEach(() => {
    onChange.mockClear();
    onBlur.mockClear();
    retry.mockClear();
  });

  it('Displays Value', () => {
    const { getByTestId } = render(
      <SelectInput
        name="selectInput"
        options={options}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
      />
    );

    const selectInput = getByTestId('SelectInputField') as HTMLSelectElement;

    expect(selectInput.value).toBe(value);
  });

  it('Displays Title', () => {
    const { getByTestId } = render(
      <SelectInput
        title={title}
        name="selectInput"
        options={options}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
      />
    );

    expect(getByTestId('SelectInputLabel').textContent).toEqual(title);
  });

  it('Displays Error', () => {
    const { getByTestId } = render(
      <SelectInput
        name="selectInput"
        options={options}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        error={error}
      />
    );

    expect(getByTestId('SelectInputError').textContent).toEqual(error);
  });

  it('Responds to Change', () => {
    const { getByTestId } = render(
      <SelectInput
        name="selectInput"
        options={options}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
      />
    );

    const selectInput = getByTestId('SelectInputField') as HTMLSelectElement;

    fireEvent.change(selectInput, { target: { value: '2' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('Responds to Blur', () => {
    const { getByTestId } = render(
      <SelectInput
      name="selectInput"
      options={options}
      onChange={onChange}
      onBlur={onBlur}
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
      <SelectInput
        name="selectInput"
        options={options}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        error={error}
        retry={retry}
      />
    );

    const retryButton = getByTestId('SelectInputRetryButton') as HTMLSelectElement;

    userEvent.click(retryButton);
    
    expect(retry).toHaveBeenCalled();
  });
});
