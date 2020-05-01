import React from 'react'

interface SelectInterface {
  name: string,
  required: boolean,
  disabled: boolean,
  data: Option[],
  default: string,
  onChange: any,
  loadingError: boolean,
  retryError: string,
  retry: any
}

interface Option {
  name: string,
  'display-name': string
}

const SelectInput = (props: SelectInterface) => {
  const {name, required} = props;
  return (
    <>
      <select className="form-control form-control-subtle"
              name={name}
              required={required}
              onChange={props.onChange}
              disabled={props.disabled}
              defaultValue={props.default}>
        {
          props.data.map((c) => {
            return (
              <option value={c.name}
                      label={c['display-name']}
                      selected={c.name === props.default}>
                {c['display-name']}
              </option>
            )
          })
        }
      </select>
      { props.loadingError &&
      <div role="alert">
        <div className="help-block">
          <span>{props.retryError}</span>
          <button id="retryButton1"
                  type="button"
                  className="btn btn-default btn-sm"
                  onClick={props.retry}>RETRY</button>
        </div>
      </div>
      }
    </>
  )
}

export default SelectInput
