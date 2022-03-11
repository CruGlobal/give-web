import React, { useCallback, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { debounce } from 'lodash';

//Based on https://itnext.io/formik-introduction-autosave-react-19d4c15cfb90

interface FormikAutoSaveProps {
  debounceMs: number,
}

const FormikAutoSave = ({ debounceMs }: FormikAutoSaveProps) => {
  const { submitForm, values } = useFormikContext();

  const debouncedSubmit = useCallback(
    debounce(() => submitForm(), debounceMs),
    [debounceMs, submitForm]
  );

  useEffect(() => {
    debouncedSubmit();
  }, [debouncedSubmit, values]);
  
  return null;
};

export default FormikAutoSave;