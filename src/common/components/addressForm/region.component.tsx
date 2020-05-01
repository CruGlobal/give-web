import React, { useState } from 'react'
import SelectInput, {Option} from "../form/SelectInput";

interface RegionInterface {
  addressDisabled: boolean,
  regions: Option[],
  address: Address,
  loadingRegionsError: boolean,
  loadCountries: () => void,
  refreshRegions: any
}

interface Address {
  country: string,
  locality: string,
  postalCode: string,
  region: string,
  streetAddress: string,
  extendedAddress: string,
  intAddressLine3: string,
  intAddressLine4: string
}

const RegionSelect = (props: RegionInterface) => {
  const [region, setRegion] = useState('')
  const updateRegion = (event: any) => {
    setRegion(event.target.value)
  }

  return (
    <SelectInput name={'addressRegion'}
                 required={true}
                 disabled={props.addressDisabled}
                 data={props.regions}
                 default={region || props.address.region}
                 onChange={updateRegion}
                 loadingError={props.loadingRegionsError}
                 retryError={'REGIONS_LOADING_ERROR'}
                 retry={props.refreshRegions} />
  )
}

export default RegionSelect
