const DEFAULT_APP_LINK_SCHEME = 'electronicsshop';

const PLACEHOLDER_DOMAINS = new Set(['electronicsshop.app', 'www.electronicsshop.app']);

export const sanitizeAppLinkDomain = (rawDomain?: string | null): string => {
  const domain = (rawDomain || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/g, '');
  if (!domain) return '';
  if (PLACEHOLDER_DOMAINS.has(domain.toLowerCase())) return '';
  return domain;
};

export const sanitizeAppLinkScheme = (rawScheme?: string | null): string => {
  const scheme = (rawScheme || '').trim().replace(/:\/{0,2}$/, '');
  return scheme || DEFAULT_APP_LINK_SCHEME;
};

export const buildProductShareLinks = (params: {
  productId: string;
  domain?: string | null;
  scheme?: string | null;
}) => {
  const { productId, domain, scheme } = params;
  const cleanId = encodeURIComponent(String(productId || '').trim());
  const appLinkScheme = sanitizeAppLinkScheme(scheme);
  const appLinkDomain = sanitizeAppLinkDomain(domain);
  const deepLink = `${appLinkScheme}://product/${cleanId}`;
  const universalLink = appLinkDomain ? `https://${appLinkDomain}/product/${cleanId}` : '';

  return {
    deepLink,
    universalLink,
    appLinkDomain,
    appLinkScheme,
  };
};
