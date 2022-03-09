import React, { useCallback, useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { debounce } from 'lodash';

interface FormikAutoSaveProps {
  debounceMs: number,
}

const FormikAutoSave = ({ debounceMs }: FormikAutoSaveProps) => {
  const { submitForm, values } = useFormikContext();

  const [initialValues] = useState(values);

  const debouncedSubmit = useCallback(
    debounce(() => submitForm(), debounceMs),
    [debounceMs, submitForm]
  );

  useEffect(() => {
    if (values != initialValues) {
      debouncedSubmit();
    }
  }, [debouncedSubmit, values]);
  
  return (<></>);
};

export default FormikAutoSave;