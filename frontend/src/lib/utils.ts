import type { Episode } from '@/lib/electron';
import moment from 'moment/min/moment-with-locales';

type Callback = () => void;

export function splitEpisodeTitle(episode: Episode): {
  german: string;
  english: string;
} {
  if (!episode || !episode.episode_name) return { german: '', english: '' };

  const title = episode.episode_name;
  const lastDashIndex = title.lastIndexOf(' - ');
  if (lastDashIndex === -1) {
    return { german: title, english: '' };
  }

  const middleDash = [...title.matchAll(/-/g)].at(
    Math.floor([...title.matchAll(/-/g)].length / 2)
  )!.index;

  const german = decodeHtml(title.substring(0, middleDash).trim());
  const english = decodeHtml(title.substring(middleDash + 1).trim());

  return { german, english };
}

function decodeHtml(html: string) {
  const textarea = document.createElement('textarea');
  let decoded = html;
  let prev;

  do {
    prev = decoded;
    textarea.innerHTML = decoded;
    decoded = textarea.value;
  } while (decoded !== prev);

  return decoded;
}

export function useInactivityTracker(
  timeout: number,
  onInactive: Callback,
  onActive?: Callback
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inactive = false;

  const resetTimer = () => {
    console.debug('Detected activity');
    if (inactive) {
      inactive = false;
      onActive?.();
    }

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      console.log('isInactive');
      inactive = true;
      onInactive();
    }, timeout);
  };

  const events: (keyof WindowEventMap)[] = [
    'mousemove',
    'keydown',
    'touchstart',
    'mousedown',
    'scroll',
    'wheel',
  ];

  const start = () => {
    console.log(
      'Starting inactivity tracker with timeout:',
      timeout / 60 / 60 / 1000,
      'h'
    );
    inactive = false;
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
  };

  const stop = () => {
    console.log('Stopped inactivity tracker');
    events.forEach((e) => window.removeEventListener(e, resetTimer));
    if (timer) clearTimeout(timer);
  };

  return {
    start,
    stop,
  };
}

export function getRelativeTime(date: Date) {
  moment.locale('de');
  return moment(date).fromNow();
}

// Displays 00:00
export function convertSecToMin(sec: number) {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.floor(sec % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export async function c2c(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for non-HTTPS or older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // avoid scroll jump
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    return true;
  } catch (err) {
    console.error('copyToClipboard failed:', err);
    return false;
  }
}
