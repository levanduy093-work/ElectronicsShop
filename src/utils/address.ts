import { AddressFormValues } from '../types/models';

export const buildFullAddress = (data: Partial<Pick<AddressFormValues, 'detailedAddress' | 'ward' | 'district' | 'city'>>) => {
  const districtOrWard = data.district || data.ward;
  return [data.detailedAddress, data.ward, districtOrWard, data.city]
    .filter(Boolean)
    .join(', ');
};
