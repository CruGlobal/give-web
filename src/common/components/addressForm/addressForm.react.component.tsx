import angular from 'angular'
import React, { useState, useEffect } from 'react'
import CountrySelect from './country.component'
import RegionSelect from './region.component'
import { react2angular } from 'react2angular'
import find from 'lodash/find'
import {Option} from "../form/SelectInput";

interface AddressFormInterface {
  address: Address,
  parentForm: any,
  addressDisabled: boolean,
  geographiesService: any,
  $log: any
}
export interface Address {
  country: string,
  locality: string,
  region: string,
  postalCode: string,
  streetAddress: string,
  extendedAddress: string,
  intAddressLine3: string,
  intAddressLine4: string
}

const ReactAddressForm = ({ address, parentForm, addressDisabled, geographiesService, $log }: AddressFormInterface) => {
  const [country, setCountry] = useState()
  const [countries, setCountries] = useState<Option[]>([])
  const [regions, setRegions] = useState<Option[]>([])
  const [streetAddress, setStreetAddress] = useState()

  useEffect(() => {
    if (!countries || countries.length === 0) {
      loadCountries()
    }
  })

  let localCountries: Option[]
  let loadingCountriesError = false
  let loadingRegionsError = false

  const dropdownSortComparator = (a: Option, b: Option) => {
    if (a['display-name'] < b['display-name']) return -1
    if (a['display-name'] > b['display-name']) return 1
    return 0
  }

  const loadCountries = () => {
    loadingCountriesError = false
    geographiesService.getCountries()
      .subscribe((data: Option[]) => {
        const sorted = data.sort(dropdownSortComparator)
        setCountries(sorted)
        localCountries = sorted
        if (address) {
          refreshRegions(address.country, true)
        }
      },
      (error: any) => {
        loadingCountriesError = true
        $log.error('Error loading countries.', error)
      })
  }

  const refreshRegions = (c: string, initial = false) => {
    loadingRegionsError = false
    let foundCountry
    if (countries && countries.length > 0) {
      foundCountry = find(countries, { name: c })
    } else if (localCountries && localCountries.length > 0) {
      foundCountry = find(localCountries, { name: c })
    }
    if (!foundCountry) { return }
    setCountry(foundCountry)

    geographiesService.getRegions(foundCountry)
      .subscribe((data: Option[]) => {
        let _regions: Option[]
        if (data) {
          _regions = data.sort(dropdownSortComparator)
        } else {
          _regions = []
        }
        setRegions(_regions)
      },
      (error: any) => {
        loadingRegionsError = true
        $log.error('Error loading regions.', error)
      })

    if (!initial) {
      address.streetAddress = ''
      address.extendedAddress = ''
    }
  }

  const updateStreetAddress = (event: any) => {
    setStreetAddress(event.target.value)
  }

  return (
    <div className='row'>
      <div className='col-sm-12'>
        <div className='form-group is-required'>
          <label>COUNTRY</label>
          <div className='form-group'>
            <CountrySelect address={address}
              addressDisabled={addressDisabled}
              loadingCountriesError={loadingCountriesError}
              loadCountries={loadCountries}
              countries={countries}
              refreshRegions={refreshRegions} />
          </div>
          <div className='row'>
            <div className='col-sm-12'>
              <div className='form-group is-required'>
                <label>{'ADDRESS'}</label>
                <input type='text'
                  className='form-control  form-control-subtle'
                  name='addressStreetAddress'
                  onBlur={updateStreetAddress}
                  required
                  maxLength={200}
                  defaultValue={streetAddress || address.streetAddress}
                  disabled={addressDisabled} />
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-sm-12'>
              <div className='form-group'>
                <input type='text'
                  className='form-control  form-control-subtle'
                  name='addressExtendedAddress'
                  defaultValue={address.extendedAddress}
                  maxLength={100}
                  disabled={addressDisabled} />
              </div>
            </div>
          </div>
          {
            ((country && country.name !== 'US') || (address.country && address.country !== 'US')) &&
            <div>
              <div className='row'>
                <div className='col-sm-12'>
                  <div className='form-group'>
                    <input type='text'
                      className='form-control  form-control-subtle'
                      name='intAddressLine3'
                      defaultValue={address.intAddressLine3}
                      maxLength={100}
                      disabled={addressDisabled} />
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-sm-12'>
                  <div className='form-group'>
                    <input type='text'
                      className='form-control  form-control-subtle'
                      name='intAddressLine4'
                      defaultValue={address.intAddressLine4}
                      maxLength={100}
                      disabled={addressDisabled} />
                  </div>
                </div>
              </div>
            </div>
          }
          {
            ((country && country.name === 'US') || (!country && address.country && address.country === 'US')) &&
            <div>
              <div className='row'>
                <div className='col-sm-12'>
                  <div className='form-group is-required'>
                    <label>{'CITY'}</label>
                    <input type='text'
                      className='form-control  form-control-subtle'
                      name='addressLocality'
                      defaultValue={address.locality}
                      required
                      maxLength={50}
                      disabled={addressDisabled} />
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-sm-6'>
                  <div className={loadingRegionsError ? 'form-group is-required has-error' : 'form-group is-required'}>
                    <label>STATE</label>
                    <div className='form-group'>
                      <RegionSelect address={address}
                        addressDisabled={addressDisabled}
                        regions={regions}
                        loadingRegionsError={loadingRegionsError}
                        refreshRegions={refreshRegions} />
                    </div>
                  </div>
                </div>
                <div className='col-sm-6'>
                  <div className='form-group is-required'>
                    <label>{'ZIP'}</label>
                    <input type='text'
                      className='form-control  form-control-subtle'
                      name='addressPostalCode'
                      defaultValue={address.postalCode}
                      required
                      pattern={'/^\d{5}(?:[-\s]\d{4})?$/'}
                      disabled={addressDisabled} />
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

export default angular
  .module('reactAddressForm', [])
  .component('reactAddressForm', react2angular(ReactAddressForm, ['address', 'parentForm', 'addressDisabled'], ['geographiesService', '$log', 'orderByFilter']))

export { ReactAddressForm }
