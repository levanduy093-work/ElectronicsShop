import { AddressFormValues } from '../types/models';

export const buildFullAddress = (data: Partial<Pick<AddressFormValues, 'detailedAddress' | 'ward' | 'district' | 'city'>>) => {
  return [data.detailedAddress, data.ward, data.district, data.city]
    .filter(Boolean)
    .join(', ');
};
