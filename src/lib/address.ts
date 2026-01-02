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

export const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    detailedAddress: '123 Đường Lê Lợi',
    ward: 'Phường Bến Thành',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    address: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    isDefault: true,
    type: 'Nhà riêng',
  },
  {
    id: 'addr-2',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    detailedAddress: 'Toà nhà TechHub, 456 Đường Nguyễn Huệ',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    address: 'Toà nhà TechHub, 456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    isDefault: false,
    type: 'Văn phòng',
  },
];
