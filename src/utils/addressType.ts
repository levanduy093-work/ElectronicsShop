import { AddressType } from '../types';

export type AddressTypeKey = 'home' | 'office';

const HOME_ALIASES = ['home', 'nha', 'nha rieng', 'trang chu'];
const OFFICE_ALIASES = ['office', 'van phong', 'work'];

const normalizeText = (value?: string) =>
  (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function normalizeAddressType(value?: string): AddressTypeKey {
  const normalized = normalizeText(value);
  if (HOME_ALIASES.includes(normalized)) return 'home';
  if (OFFICE_ALIASES.includes(normalized)) return 'office';
  return 'home';
}

export function toAddressTypeValue(type: AddressTypeKey): AddressType {
  return type as AddressType;
}

export function toBackendAddressType(value?: string): string {
  return normalizeAddressType(value) === 'office' ? 'Văn phòng' : 'Nhà riêng';
}

export function getAddressTypeLabel(
  value: string | undefined,
  translate: (key: string) => string,
): string {
  return normalizeAddressType(value) === 'office'
    ? translate('address_office')
    : translate('address_home');
}

export function getAddressTypeIcon(value?: string): 'home' | 'briefcase' {
  return normalizeAddressType(value) === 'office' ? 'briefcase' : 'home';
}
