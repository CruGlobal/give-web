import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TextInput from './';

const title = "Title";
const value = "Mock Value";
const error = "Input Error";

const onChange = jest.fn();
const onBlur = jest.fn();

describe('TextInput', () => {
  beforeEach(() => {
    onChange.mockClear();
    onBlur.mockClear();
  });

  it('displays value', () => {
    const { getByTestId } = render(
      <TextInput
        name="textInput"
        onChange={() => {}}
        onBlur={() => {}}
        value={value}
      />
    );

    const textInput = getByTestId('TextInputField') as HTMLInputElement;

    expect(textInput.value).toBe(value);
  });

  it('displays title', () => {
    const { getByTestId } = render(
      <TextInput
        title={title}
        name="textInput"
        onChange={() => {}}
        onBlur={() => {}}
        value={value}
      />
    );

    expect(getByTestId('TextInputLabel').textContent).toEqual(title);
  });

  it('displays error', () => {
    const { getByTestId } = render(
      <TextInput
        name="textInput"
        onChange={() => {}}
        onBlur={() => {}}
        value={value}
        error={error}
      />
    );

    expect(getByTestId('TextInputError').textContent).toEqual(error);
  });

  it('responds to change', () => {
    const { getByTestId } = render(
      <TextInput
        name="textInput"
        onChange={onChange}
        onBlur={() => {}}
        value={value}
      />
    );

    const textInput = getByTestId('TextInputField') as HTMLInputElement;

    userEvent.type(textInput, value);
    
    expect(onChange).toHaveBeenCalled();
  });

  it('responds to blur', () => {
    const { getByTestId } = render(
      <TextInput
        name="textInput"
        onChange={() => {}}
        onBlur={onBlur}
        value={value}
      />
    );

    const textInput = getByTestId('TextInputField') as HTMLInputElement;

    fireEvent.focus(textInput);
    fireEvent.blur(textInput);
    
    expect(onBlur).toHaveBeenCalled();
  });
});
