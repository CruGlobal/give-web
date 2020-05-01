import React, { useState } from 'react'
import SelectInput, {Option} from '../form/SelectInput'

interface CountryInterface {
  addressDisabled: boolean,
  countries: Option[],
  address: Address,
  loadingCountriesError: boolean,
  loadCountries: () => void,
  refreshRegions: any
}

interface Address {
  country: string,
  locality: string,
  postalCode: string,
  streetAddress: string,
  extendedAddress: string,
  intAddressLine3: string,
  intAddressLine4: string
}

const CountrySelect = (props: CountryInterface) => {
  const [ country, setCountry ] = useState()

  const updateCountry = (event: any) => {
    const _country = event.target.value
    setCountry(_country)
    props.refreshRegions(_country)
  }

  return (
    <SelectInput name={'addressCountry'}
                 required={true}
                 disabled={props.addressDisabled}
                 data={props.countries}
                 default={country || props.address.country}
                 onChange={updateCountry}
                 loadingError={props.loadingCountriesError}
                 retryError={'COUNTRY_LIST_ERROR'}
                 retry={props.loadCountries} />
  )
}

export default CountrySelect
