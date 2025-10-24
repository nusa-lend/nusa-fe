export const APP_URL: string = process.env.NEXT_PUBLIC_URL!;

export const APP_NAME = 'Nusa';
export const APP_DESCRIPTION = 'Nusa is a local stablecoin lending hub.';
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_OG_IMAGE_URL = `${APP_URL}/og-image.png`;
export const APP_BUTTON_TEXT = 'Launch Nusa';
export const APP_SPLASH_URL = `${APP_URL}/splash.png`;
export const APP_SPLASH_BACKGROUND_COLOR = '#F8FAFC';
export const APP_PRIMARY_CATEGORY = 'finance';
export const APP_TAGS = ['lending', 'borrowing', 'collateral', 'cross-chain', 'stablecoins'];
export const APP_WEBHOOK_URL = `${APP_URL}/webhook`;

export const APP_SUBTITLE = 'Local Stablecoin Lending Hub';
export const APP_TAGLINE = 'Lending for local stablecoins';
export const APP_HERO_IMAGE_URL = APP_OG_IMAGE_URL;
export const APP_SCREENSHOT_URLS = [`${APP_URL}/screenshot.png`];
export const APP_CAST_SHARE_URL = `${APP_URL}/share`;

export const APP_ACCOUNT_ASSOCIATION = {
  header: 'BASE64URL_HEADER',
  payload: 'BASE64URL_PAYLOAD',
  signature: 'BASE64URL_SIGNATURE',
};
