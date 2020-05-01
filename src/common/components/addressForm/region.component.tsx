import React, { useState } from 'react'
import SelectInput, {Option} from "../form/SelectInput";
import {Address} from "./addressForm.react.component";

interface RegionInterface {
  addressDisabled: boolean,
  regions: Option[],
  address: Address,
  loadingRegionsError: boolean,
  refreshRegions: any
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
