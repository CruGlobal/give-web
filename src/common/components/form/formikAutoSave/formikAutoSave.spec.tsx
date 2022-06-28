import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { renderHook } from 'react-hooks-testing-library';
import { act } from 'react-dom/test-utils';
import { useFormikContext } from 'formik';

import FormikAutoSave from './';

jest.mock('formik');

const debounceMs = 600;
const submitForm = jest.fn();
//const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext');

describe('FormikAutoSave', () => {
  beforeEach(() => {
    submitForm.mockClear();

    useFormikContext.mockReturnValue({
      submitForm,
      values: {},
    } as unknown as any);
  });

  it('Submits Form When Values Change', async () => {
    const { rerender } = render(
      <FormikAutoSave debounceMs={debounceMs} />
    );

    expect(submitForm).not.toHaveBeenCalled();

    useFormikContext.mockReturnValueOnce({
      submitForm,
      values: { newValue: 'new' },
    } as unknown as any);
    
    expect(submitForm).toHaveBeenCalledWith();
  });
});
