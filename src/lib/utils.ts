import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Manifest } from '@farcaster/miniapp-core/src/manifest';
import {
  APP_NAME,
  APP_DESCRIPTION,
  APP_URL,
  APP_ICON_URL,
  APP_OG_IMAGE_URL,
  APP_BUTTON_TEXT,
  APP_SPLASH_URL,
  APP_SPLASH_BACKGROUND_COLOR,
  APP_PRIMARY_CATEGORY,
  APP_TAGS,
  APP_WEBHOOK_URL,
  APP_ACCOUNT_ASSOCIATION,
  APP_SUBTITLE,
  APP_TAGLINE,
  APP_HERO_IMAGE_URL,
  APP_SCREENSHOT_URLS,
  APP_CAST_SHARE_URL,
} from '@/constants/appConstants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMiniAppEmbedMetadata(ogImageUrl?: string) {
  return {
    version: 'next',
    imageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    ogTitle: APP_NAME,
    ogDescription: APP_DESCRIPTION,
    ogImageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    button: {
      title: APP_BUTTON_TEXT,
      action: {
        type: 'launch_frame',
        name: APP_NAME,
        url: APP_URL,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
        description: APP_DESCRIPTION,
        primaryCategory: APP_PRIMARY_CATEGORY,
        tags: APP_TAGS,
      },
    },
  };
}

export async function getFarcasterDomainManifest(): Promise<Manifest> {
  return {
    accountAssociation: APP_ACCOUNT_ASSOCIATION!,
    miniapp: {
      version: '1',
      name: APP_NAME ?? 'Nusa - Local Stablecoin Lending Hub',
      homeUrl: APP_URL,
      iconUrl: APP_ICON_URL,
      imageUrl: APP_OG_IMAGE_URL,
      buttonTitle: APP_BUTTON_TEXT ?? 'Launch Nusa',
      splashImageUrl: APP_SPLASH_URL,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      webhookUrl: APP_WEBHOOK_URL,
      subtitle: APP_SUBTITLE,
      description: APP_DESCRIPTION,
      screenshotUrls: APP_SCREENSHOT_URLS,
      primaryCategory: APP_PRIMARY_CATEGORY,
      tags: APP_TAGS,
      heroImageUrl: APP_HERO_IMAGE_URL,
      tagline: APP_TAGLINE,
      ogTitle: APP_NAME,
      ogDescription: APP_DESCRIPTION,
      ogImageUrl: APP_OG_IMAGE_URL,
      castShareUrl: APP_CAST_SHARE_URL,
    } as any,
  };
}
