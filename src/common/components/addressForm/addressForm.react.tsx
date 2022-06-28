import React, { useEffect, useState } from 'react';
import angular from 'angular';
import { react2angular } from 'react2angular';
import { Formik } from 'formik';
import * as Yup from 'yup';
import find from 'lodash/find';

import CountrySelect from './countrySelect';
import RegionSelect from './regionSelect';
import TextInput from '../form/textInput';
import FormikAutoSave from '../form/formikAutoSave';

interface AddressFormProps {
  address: Address,
  addressDisabled?: boolean,
  onAddressChanged: (updatedAddress: Address) => void,
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

export interface GeographiesItem {
  "display-name": string,
  links: GeographiesLink[],
  name: string,
}

const componentName = 'reactAddressForm';

export const AddressForm = ({
  address,
  addressDisabled = false,
  onAddressChanged,
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

  const AddressSchema = Yup.object().shape({
    country: Yup.string()
      .required('You must select a country'),
    streetAddress: Yup.string()
      .max(200, 'This field cannot be longer than 200 characters')
      .required('You must enter an address'),
    extendedAddress: Yup.string()
      .max(100, 'This field cannot be longer than 100 characters'),
    intAddressLine3: Yup.string()
      .max(100, 'This field cannot be longer than 100 characters'),
    intAddressLine4: Yup.string()
      .max(100, 'This field cannot be longer than 100 characters'),
    locality: Yup.string()
      .max(50, 'This field cannot be longer than 100 characters')
      .required('You must enter a city'),
    region: Yup.string()
      .required('You must select a state / region'),
    postalCode: Yup.string()
      .test(
        'is-postal-code',
        () => 'You must enter a valid US zip code',
        (value) => value == null || /^\d{5}(?:[-\s]\d{4})?$/.test(value)
      )
      .required('You must enter a zip / postal code')
  });

  const handleAddressChanged = (values: Address) => {
    onAddressChanged(values);
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

  const onSelectCountry = (newCountryName?: string) => {
    setCountryName(newCountryName);

    const countryContext = newCountryName && findCountry(countries, newCountryName);
    countryContext && loadRegions(countryContext);
  }

  return (
    <Formik
      initialValues={address}
      validationSchema={AddressSchema}
      onSubmit={handleAddressChanged}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
      }) => (
        <>
          <FormikAutoSave debounceMs={600} />
          <div className="row">
            <div className="col-sm-12">
              <CountrySelect
                addressDisabled={addressDisabled}
                countries={countries.map(country => ({ name: country.name, displayName: country['display-name']}))}             
                onChange={handleChange}
                onBlur={handleBlur}
                onSelectCountry={onSelectCountry}
                refreshCountries={loadCountries}
                value={values.country}
                error={loadingCountriesError
                  ? 'There was an error loading the list of countries. If you continue to see this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.'
                  : touched.country && errors.country 
                    ? errors.country
                    : undefined
                }
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
                      error={loadingRegionsError
                        ? 'There was an error loading the list of regions/state. If you continue to see this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.'
                        : touched.region && errors.region 
                          ? errors.region
                          : undefined
                      }
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
  .component(componentName, react2angular(AddressForm, ['address', 'addressDisabled', 'onAddressChanged'], ['geographiesService', '$log']))
