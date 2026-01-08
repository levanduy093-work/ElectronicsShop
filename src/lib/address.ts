export type AddressType = 'Nhà riêng' | 'Văn phòng';

export interface AddressFormValues {
  name: string;
  phone: string;
  detailedAddress: string;
  ward?: string;
  district?: string;
  city?: string;
  type: AddressType;
  isDefault: boolean;
}

export interface Address extends AddressFormValues {
  id: string;
  address: string;
}

export const buildFullAddress = (data: Partial<Pick<AddressFormValues, 'detailedAddress' | 'ward' | 'district' | 'city'>>) => {
  return [data.detailedAddress, data.ward, data.district, data.city]
    .filter(Boolean)
    .join(', ');
};

export const DEFAULT_ADDRESSES: Address[] = [];
