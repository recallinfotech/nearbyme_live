import { Capacitor } from '@capacitor/core';

export const LIVE_APP_DOMAIN = "https://nearby.recallinfotech.com";

export interface ShareContent {
  title: string;
  text?: string;
  path: string;
}

/**
 * Returns the proper live canonical URL for sharing,
 * so even when sharing from Android APK / localhost, the recipient gets the live link.
 */
export const getShareableUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    
    if (!isLocalhost && window.location.origin && window.location.origin.startsWith('http')) {
      return `${window.location.origin}${cleanPath}`;
    }
  }

  return `${LIVE_APP_DOMAIN}${cleanPath}`;
};

/**
 * Universal Share helper:
 * 1. Tries Web Share API on mobile / supported devices
 * 2. Fallbacks to copying to clipboard with status return
 */
export const shareItem = async (content: ShareContent): Promise<{ success: boolean; copiedToClipboard: boolean; shareUrl: string }> => {
  const shareUrl = getShareableUrl(content.path);
  const shareText = content.text
    ? `${content.text}\n\n👉 View details on Nearby Me: ${shareUrl}`
    : `Check out "${content.title}" on Nearby Me:\n👉 ${shareUrl}`;

  // 1. Try Native Web Share API
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: content.title,
        text: shareText,
        url: shareUrl,
      });
      return { success: true, copiedToClipboard: false, shareUrl };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User closed share sheet
        return { success: false, copiedToClipboard: false, shareUrl };
      }
      console.warn('Web Share failed, fallback to clipboard:', err);
    }
  }

  // 2. Clipboard copy fallback
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(`${content.title}\n${shareUrl}`);
      return { success: true, copiedToClipboard: true, shareUrl };
    }
  } catch (err) {
    console.warn('Clipboard writeText failed, trying execCommand:', err);
  }

  // 3. Fallback textarea copy
  try {
    const el = document.createElement('textarea');
    el.value = `${content.title}\n${shareUrl}`;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return { success: true, copiedToClipboard: true, shareUrl };
  } catch (err) {
    console.error('Copy fallback failed:', err);
    return { success: false, copiedToClipboard: false, shareUrl };
  }
};
