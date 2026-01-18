import fallback from '../constants/locations.json';

const BASE_URL = 'https://provinces.open-api.vn/api';

export type LocationOption = {
  code: number;
  name: string;
};

type FallbackProvince = {
  code: number;
  name: string;
  districts: { code: number; name: string; wards: { code: number; name: string }[] }[];
};

const fallbackProvinces: FallbackProvince[] = Array.isArray(fallback) ? (fallback as FallbackProvince[]) : [];

let provinceCache: LocationOption[] | null = null;
const districtCache = new Map<number, LocationOption[]>();
const wardCache = new Map<number, LocationOption[]>();

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const mapFallbackProvince = (item: FallbackProvince): LocationOption => ({
  code: item.code,
  name: item.name,
});

const mapFallbackDistricts = (provinceCode: number): LocationOption[] => {
  const province = fallbackProvinces.find(p => p.code === provinceCode);
  if (!province) return [];
  return (province.districts || []).map(d => ({ code: d.code, name: d.name }));
};

const mapFallbackWards = (districtCode: number): LocationOption[] => {
  for (const province of fallbackProvinces) {
    const district = province.districts?.find(d => d.code === districtCode);
    if (district) {
      return (district.wards || []).map(w => ({ code: w.code, name: w.name }));
    }
  }
  return [];
};

export async function getProvinces(): Promise<LocationOption[]> {
  if (provinceCache) return provinceCache;
  try {
    const data = await fetchJson<{ code: number; name: string }[]>(`${BASE_URL}/p`);
    provinceCache = data.map(item => ({ code: item.code, name: item.name }));
    return provinceCache;
  } catch (error) {
    provinceCache = fallbackProvinces.map(mapFallbackProvince);
    return provinceCache;
  }
}

export async function getDistricts(provinceCode: number): Promise<LocationOption[]> {
  if (districtCache.has(provinceCode)) {
    return districtCache.get(provinceCode)!;
  }
  try {
    const data = await fetchJson<{ districts: { code: number; name: string }[] }>(
      `${BASE_URL}/p/${provinceCode}?depth=2`,
    );
    const mapped = (data.districts || []).map(d => ({ code: d.code, name: d.name }));
    districtCache.set(provinceCode, mapped);
    return mapped;
  } catch (error) {
    const mapped = mapFallbackDistricts(provinceCode);
    districtCache.set(provinceCode, mapped);
    return mapped;
  }
}

export async function getWards(districtCode: number): Promise<LocationOption[]> {
  if (wardCache.has(districtCode)) {
    return wardCache.get(districtCode)!;
  }
  try {
    const data = await fetchJson<{ wards: { code: number; name: string }[] }>(
      `${BASE_URL}/d/${districtCode}?depth=2`,
    );
    const mapped = (data.wards || []).map(w => ({ code: w.code, name: w.name }));
    wardCache.set(districtCode, mapped);
    return mapped;
  } catch (error) {
    const mapped = mapFallbackWards(districtCode);
    wardCache.set(districtCode, mapped);
    return mapped;
  }
}
