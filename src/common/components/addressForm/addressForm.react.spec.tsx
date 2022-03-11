import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

import { AddressForm, Address, GeographiesItem } from './addressForm.react';
import userEvent from '@testing-library/user-event';
import { JsxElement } from 'typescript';

const address: Address = {
  country: '',
  locality: '',
  region: '',
  postalCode: '',
  streetAddress: '',
  extendedAddress: '',
  intAddressLine3: '',
  intAddressLine4: '',
};
const countries: GeographiesItem[] = [
  { name: 'US', "display-name": 'Country 1', links: [] },
  { name: 'UK', "display-name": 'Country 2', links: [] },
];
const regions: GeographiesItem[] = [
  { name: 'A', "display-name": 'Region 1', links: [] },
  { name: 'B', "display-name": 'Region 1', links: [] },
];

const onAddressChanged = jest.fn();
const geographiesService = { getCountries: jest.fn(), getRegions: jest.fn() };

const log = { error: () => {} };

describe('AddressForm', () => {
  beforeEach(() => {
    onAddressChanged.mockClear();
    geographiesService.getCountries.mockImplementation(() => {
      const subscribe = (func: (data: any[]) => void) => func(countries);
      return { subscribe };
    });
    geographiesService.getRegions.mockImplementation(() => {
      const subscribe = (func: (data: any[]) => void) => func(regions);
      return { subscribe };
    });
  });

  it('Loads Countries and Regions on Initialize for US', () => {
    render(
      <AddressForm
        address={{ ...address, country: 'US' }}
        onAddressChanged={onAddressChanged}
        geographiesService={geographiesService}
        $log={log}
      />
    );

    expect(geographiesService.getCountries).toHaveBeenCalledWith();
    expect(geographiesService.getRegions).toHaveBeenCalledWith(countries[0]);
  });

  it('Renders Form for US', () => {
    const { getAllByTestId } = render(
      <AddressForm
        address={{ ...address, country: 'US' }}
        onAddressChanged={onAddressChanged}
        geographiesService={geographiesService}
        $log={log}
      />
    );

    const selectInputs = getAllByTestId('SelectInputField') as HTMLSelectElement[];
    const textInputs = getAllByTestId('TextInputField') as HTMLInputElement[];

    expect(selectInputs.length).toBe(2);
    expect(selectInputs[0].name).toBe('country');
    expect(selectInputs[0].value).toBe('US');
    expect(selectInputs[1].name).toBe('region');
    expect(selectInputs[1].value).toBe('A');

    expect(textInputs.length).toBe(4);
    expect(textInputs[0].name).toBe('streetAddress');
    expect(textInputs[0].value).toBe(address.streetAddress);
    expect(textInputs[1].name).toBe('extendedAddress');
    expect(textInputs[1].value).toBe(address.extendedAddress);
    expect(textInputs[2].name).toBe('locality');
    expect(textInputs[2].value).toBe(address.locality);
    expect(textInputs[3].name).toBe('postalCode');
    expect(textInputs[3].value).toBe(address.postalCode);
  });

  it('Renders Form for International', () => {
   const { getAllByTestId } = render(
      <AddressForm
        address={{ ...address, country: 'UK' }}
        onAddressChanged={onAddressChanged}
        geographiesService={geographiesService}
        $log={log}
      />
    );

    const selectInputs = getAllByTestId('SelectInputField') as HTMLSelectElement[];
    const textInputs = getAllByTestId('TextInputField') as HTMLInputElement[];

    expect(selectInputs.length).toBe(1);
    expect(selectInputs[0].name).toBe('country');
    expect(selectInputs[0].value).toBe('UK');

    expect(textInputs.length).toBe(4);
    expect(textInputs[0].name).toBe('streetAddress');
    expect(textInputs[0].value).toBe(address.streetAddress);
    expect(textInputs[1].name).toBe('extendedAddress');
    expect(textInputs[1].value).toBe(address.extendedAddress);
    expect(textInputs[2].name).toBe('intAddressLine3');
    expect(textInputs[2].value).toBe(address.intAddressLine3);
    expect(textInputs[3].name).toBe('intAddressLine4');
    expect(textInputs[3].value).toBe(address.intAddressLine4);
  });

  it('Triggers Callback to Parent Component on Change', async () => {
    const { getAllByTestId } = render(
      <AddressForm
        address={{ ...address, country: 'US' }}
        onAddressChanged={onAddressChanged}
        geographiesService={geographiesService}
        $log={log}
      />
    );

    const selectInputs = getAllByTestId('SelectInputField') as HTMLSelectElement[];
    const textInputs = getAllByTestId('TextInputField') as HTMLInputElement[];    

    expect(selectInputs.length).toBe(2);
    expect(textInputs.length).toBe(4);

    fireEvent.change(selectInputs[0], { target: { value: countries[1].name } });
    userEvent.type(textInputs[0], 'New Value');

    await waitFor(() => 
      expect(onAddressChanged).toHaveBeenCalledTimes(2),
    );
  });

  describe('Error Handling', () => {
    it('Displays Error For Loading Countries', () => {
      geographiesService.getCountries.mockImplementation(() => {
        const subscribe = (
          func: (data: any[]) => void,
          errorFunc: (error: any) => void
        ) => errorFunc({});

        return { subscribe };
      });

      const { getAllByTestId } = render(
        <AddressForm
          address={{ ...address, country: 'US' }}
          onAddressChanged={onAddressChanged}
          geographiesService={geographiesService}
          $log={log}
        />
      );
      
      const errors = getAllByTestId('SelectInputError');
      const retryButtons = getAllByTestId('SelectInputRetryButton') as HTMLButtonElement[];

      expect(errors.length).toBe(1);
      expect(retryButtons.length).toBe(1);
      expect(errors[0].textContent).toBe('There was an error loading the list of countries. If you continue to see this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.');
    });

    it('Retries Loading Countries After Error', () => {
      geographiesService.getCountries.mockImplementation(() => {
        const subscribe = (
          func: (data: any[]) => void,
          errorFunc: (error: any) => void
        ) => errorFunc({});

        return { subscribe };
      });

      const { getAllByTestId } = render(
        <AddressForm
          address={{ ...address, country: 'US' }}
          onAddressChanged={onAddressChanged}
          geographiesService={geographiesService}
          $log={log}
        />
      );
      
      const errors = getAllByTestId('SelectInputError');
      const retryButtons = getAllByTestId('SelectInputRetryButton') as HTMLButtonElement[];

      expect(errors.length).toBe(1);
      expect(retryButtons.length).toBe(1);
      expect(geographiesService.getCountries).toHaveBeenCalledTimes(1);

      userEvent.click(retryButtons[0]);

      expect(geographiesService.getCountries).toHaveBeenCalledTimes(2);
    });

    it('Displays Error For Loading Regions', () => {
      geographiesService.getRegions.mockImplementation(() => {
        const subscribe = (
          func: (data: any[]) => void,
          errorFunc: (error: any) => void
        ) => errorFunc({});

        return { subscribe };
      });

      const { getAllByTestId } = render(
        <AddressForm
          address={{ ...address, country: 'US' }}
          onAddressChanged={onAddressChanged}
          geographiesService={geographiesService}
          $log={log}
        />
      );
      
      const errors = getAllByTestId('SelectInputError');
      const retryButtons = getAllByTestId('SelectInputRetryButton') as HTMLButtonElement[];

      expect(errors.length).toBe(1);
      expect(retryButtons.length).toBe(1);
      expect(errors[0].textContent).toBe('There was an error loading the list of regions/state. If you continue to see this message, contact <a href="mailto:eGift@cru.org">eGift@cru.org</a> for assistance.');
    });

    it('Retries Loading Regions After Error', () => {
      geographiesService.getRegions.mockImplementation(() => {
        const subscribe = (
          func: (data: any[]) => void,
          errorFunc: (error: any) => void
        ) => errorFunc({});

        return { subscribe };
      });

      const { getAllByTestId } = render(
        <AddressForm
          address={{ ...address, country: 'US' }}
          onAddressChanged={onAddressChanged}
          geographiesService={geographiesService}
          $log={log}
        />
      );
      
      const errors = getAllByTestId('SelectInputError');
      const retryButtons = getAllByTestId('SelectInputRetryButton') as HTMLButtonElement[];

      expect(errors.length).toBe(1);
      expect(retryButtons.length).toBe(1);
      expect(geographiesService.getCountries).toHaveBeenCalledTimes(1);
      expect(geographiesService.getRegions).toHaveBeenCalledTimes(1);

      userEvent.click(retryButtons[0]);

      expect(geographiesService.getCountries).toHaveBeenCalledTimes(1);
      expect(geographiesService.getRegions).toHaveBeenCalledTimes(2);
    });
  });
});
