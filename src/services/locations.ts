const BASE_URL = 'https://provinces.open-api.vn/api/v2';

export type LocationOption = {
  code: number;
  name: string;
  codename?: string;
};

let provinceCache: LocationOption[] | null = null;
const wardCache = new Map<number, LocationOption[]>();

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getProvinces(): Promise<LocationOption[]> {
  if (provinceCache) return provinceCache;
  try {
    const data = await fetchJson<{ code: number; name: string; codename?: string }[]>(`${BASE_URL}/p/`);
    provinceCache = data.map(item => ({ code: item.code, name: item.name, codename: item.codename }));
    return provinceCache;
  } catch {
    provinceCache = [];
    return [];
  }
}

export async function getWards(provinceCode: number): Promise<LocationOption[]> {
  if (wardCache.has(provinceCode)) {
    return wardCache.get(provinceCode)!;
  }
  try {
    const data = await fetchJson<{ code: number; name: string; codename?: string }[]>(`${BASE_URL}/w/?province=${provinceCode}`);
    const mapped = data.map(w => ({ code: w.code, name: w.name, codename: w.codename }));
    wardCache.set(provinceCode, mapped);
    return mapped;
  } catch {
    const mapped: LocationOption[] = [];
    wardCache.set(provinceCode, mapped);
    return mapped;
  }
}
