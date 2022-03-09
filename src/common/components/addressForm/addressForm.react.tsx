import React, { useEffect, useState } from 'react';
import angular from 'angular';
import { react2angular } from 'react2angular';
import find from 'lodash/find';

import CountrySelect from './countrySelect';
import RegionSelect from './regionSelect';
import TextInput from '../form/textInput';

interface AddressFormProps {
  address: Address,
  addressDisabled?: boolean,
  geographiesService: any,
  $log: any
}

export interface Address {
  country: string,
  locality: string,
  region: string,
  postalCode: string,
  streetAddress: string,
  extendedAddress?: string,
  intAddressLine3?: string,
  intAddressLine4?: string
}

interface GeographiesLink {
  href: string,
  rel: string,
  type: string,
  uri: string,
}

interface GeographiesItem {
  "display-name": string,
  links: GeographiesLink[],
  name: string,
}

const componentName = 'reactAddressForm';

const AddressForm = ({
  address,
  addressDisabled = false,
  geographiesService,
  $log
}: AddressFormProps) => {

  const [countryName, setCountryName] = useState<string | undefined>(address.country);
  const [countries, setCountries] = useState<GeographiesItem[]>([]);
  const [regions, setRegions] = useState<GeographiesItem[]>([]);

  const [loadingCountriesError, setLoadingCountriesError] = useState<boolean>(false);
  const [loadingRegionsError, setLoadingRegionsError] = useState<boolean>(false);

  useEffect(() => {
    loadCountries();
  }, []);

  const dropdownSortComparator = (a: GeographiesItem, b: GeographiesItem) => {
    if(a['display-name'] < b['display-name']) return -1;
    if(a['display-name'] > b['display-name']) return 1;
    return 0;
  };

  const loadCountries = () => {
    setLoadingCountriesError(false);

    geographiesService.getCountries()
      .subscribe((data: GeographiesItem[]) => {
        const sortedCountries = data.sort(dropdownSortComparator);

        setCountries(sortedCountries);

        const countryContext = countryName && findCountry(sortedCountries, countryName);
        countryContext && loadRegions(countryContext);
      },
      (error: any) => {
        setLoadingCountriesError(true);
        $log.error('Error loading countries.', error);
      });
  };

  const loadRegions = (countryContext: GeographiesItem) => {
    setLoadingRegionsError(false);

    geographiesService.getRegions(countryContext)
      .subscribe((data: GeographiesItem[]) => {
        const sortedRegions = data.sort(dropdownSortComparator);

        setRegions(sortedRegions);
      },
      (error: any) => {
        setLoadingRegionsError(true);
        $log.error('Error loading regions.', error);
      });
  };

  const findCountry = (countryOptions: GeographiesItem[], countryName?: string): GeographiesItem | undefined => {
    let foundCountry: GeographiesItem | undefined = undefined;
    
    if (countryOptions.length > 0) {
      foundCountry = find(countryOptions, { name: countryName });   
    }

    return foundCountry;
  };

  const refreshRegions = () => {
    const countryContext = countryName && findCountry(countries, countryName);
    countryContext && loadRegions(countryContext);
  }

  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <CountrySelect
            addressDisabled={addressDisabled}
            countries={countries.map(country => ({ name: country.name, displayName: country['display-name']}))}
            onChange={}
            onBlur={}
            onSelectCountry={setCountryName}
            refreshCountries={loadCountries}
            value={}
            error={}
            canRetry={}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <TextInput
            title="Address"
            name="streetAddress"
            required
            maxLength={200}
            disabled={addressDisabled}
            onChange={}
            onBlur={}
            value={}
            error={}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <TextInput
            name="extendedAddress"
            maxLength={100}
            disabled={addressDisabled}
            onChange={}
            onBlur={}
            value={}
            error={}
          />
        </div>
      </div>
      {
        countryName && countryName !== 'US'
        ? (
          <div>
            <div className="row">
              <div className="col-sm-12">
                <TextInput
                  name="intAddressLine3"
                  maxLength={100}
                  disabled={addressDisabled}
                  onChange={}
                  onBlur={}
                  value={}
                  error={}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12">
                <TextInput
                  name="intAddressLine4"
                  maxLength={100}
                  disabled={addressDisabled}
                  onChange={}
                  onBlur={}
                  value={}
                  error={}
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="row">
              <div className="col-sm-12">
                <TextInput
                  title="City"
                  name="locality"
                  required
                  maxLength={50}
                  disabled={addressDisabled}
                  onChange={}
                  onBlur={}
                  value={}
                  error={}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6">
                <RegionSelect
                  addressDisabled={addressDisabled}
                  regions={regions.map(region => ({ name: region.name, displayName: region['display-name']}))}
                  onChange={}
                  onBlur={}
                  refreshRegions={refreshRegions}
                  value={}
                  error={}
                  canRetry={}
                />
              </div>
              <div className="col-sm-6">
                <TextInput
                  title="Zip / Postal Code"
                  name="postalCode"
                  required
                  disabled={addressDisabled}
                  onChange={}
                  onBlur={}
                  value={}
                  error={}
                />
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};

export default angular
  .module(componentName, [])
  .component(componentName, react2angular(AddressForm, ['address', 'addressDisabled'], ['geographiesService', '$log']))

export { AddressForm }
