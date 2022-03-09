import React, { useEffect, useState } from 'react';
import angular from 'angular';
import { react2angular } from 'react2angular';
import { Formik, FormikErrors } from 'formik';
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

  const validator = (values: Address): FormikErrors<Address> => {
    const errors: FormikErrors<Address> = {};

    if (loadingCountriesError) {
      errors.country = 'COUNTRY_LIST_ERROR';
    } else if (!values.country) {
      errors.country = 'COUNTRY_SELECT_ERROR';
    }
    if (!values.streetAddress) {
      errors.streetAddress = 'ADDRESS_ERROR';
    } else if (values.streetAddress.length > 200) {
      errors.streetAddress = 'MAX_LENGTH_ADDRESS_ERROR';
    }
    if (values.extendedAddress && values.extendedAddress.length > 100) {
      errors.extendedAddress = 'MAX_LENGTH_ADDRESS_OTHERS_ERROR';
    }
    if (values.intAddressLine3 && values.intAddressLine3.length > 100) {
      errors.intAddressLine3 = 'MAX_LENGTH_ADDRESS_OTHERS_ERROR';
    }
    if (values.intAddressLine4 && values.intAddressLine4.length > 100) {
      errors.intAddressLine4 = 'MAX_LENGTH_ADDRESS_OTHERS_ERROR';
    }
    if (!values.locality) {
      errors.locality = 'CITY_ERROR';
    } else if (values.locality.length > 50) {
      errors.locality = 'MAX_LENGTH_CITY_ERROR';
    }
    if (loadingRegionsError) {
      errors.country = 'REGIONS_LOADING_ERROR';
    } else if (!values.region) {
      errors.region = 'SELECT_STATE_ERROR';
    }
    if (!values.postalCode) {
      errors.postalCode = 'ZIP_CODE_ERROR';
    } else if (!/^\d{5}(?:[-\s]\d{4})?$/.test(values.postalCode)) {
      errors.postalCode = 'INVALID_US_ZIP_ERROR';
    }

    return errors;
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
    <Formik
      initialValues={address}
      validate={validator}
      onSubmit={}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
      }) => (
        <>
          <div className="row">
            <div className="col-sm-12">
              <CountrySelect
                addressDisabled={addressDisabled}
                countries={countries.map(country => ({ name: country.name, displayName: country['display-name']}))}             
                onChange={handleChange}
                onBlur={handleBlur}
                onSelectCountry={setCountryName}
                refreshCountries={loadCountries}
                value={values.country}
                error={touched.country && errors.country || undefined}
                canRetry={loadingCountriesError}
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
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.streetAddress}
                error={touched.streetAddress && errors.streetAddress || undefined}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <TextInput
                name="extendedAddress"
                maxLength={100}
                disabled={addressDisabled}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.extendedAddress}
                error={touched.extendedAddress && errors.extendedAddress || undefined}
              />
            </div>
          </div>
          {
            countryName && countryName !== 'US'
            ? (
              <>
                <div className="row">
                  <div className="col-sm-12">
                    <TextInput
                      name="intAddressLine3"
                      maxLength={100}
                      disabled={addressDisabled}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.intAddressLine3}
                      error={touched.intAddressLine3 && errors.intAddressLine3 || undefined}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12">
                    <TextInput
                      name="intAddressLine4"
                      maxLength={100}
                      disabled={addressDisabled}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.intAddressLine4}
                      error={touched.intAddressLine4 && errors.intAddressLine4 || undefined}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="row">
                  <div className="col-sm-12">
                    <TextInput
                      title="City"
                      name="locality"
                      required
                      maxLength={50}
                      disabled={addressDisabled}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.locality}
                      error={touched.locality && errors.locality || undefined}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-6">
                    <RegionSelect
                      addressDisabled={addressDisabled}
                      regions={regions.map(region => ({ name: region.name, displayName: region['display-name']}))}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      refreshRegions={refreshRegions}
                      value={values.region}
                      error={touched.region && errors.region || undefined}
                      canRetry={loadingRegionsError}
                    />
                  </div>
                  <div className="col-sm-6">
                    <TextInput
                      title="Zip / Postal Code"
                      name="postalCode"
                      required
                      disabled={addressDisabled}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.postalCode}
                      error={touched.postalCode && errors.postalCode || undefined}
                    />
                  </div>
                </div>
              </>
            )
          }
        </>
      )}
    </Formik>
  );
};

export default angular
  .module(componentName, [])
  .component(componentName, react2angular(AddressForm, ['address', 'addressDisabled'], ['geographiesService', '$log']))

export { AddressForm }
