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

  const german = title.substring(0, lastDashIndex).trim();
  const english = title.substring(lastDashIndex + 3).trim(); // +3 to skip ' - '

  return { german, english };
}

export function useInactivityTracker(
  timeout: number,
  onInactive: Callback,
  onActive?: Callback
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inactive = false;

  const resetTimer = () => {
    console.log('Detected activity');
    if (inactive) {
      inactive = false;
      onActive?.();
    }

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
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
    console.log('Starting inactivity tracker with timeout:', timeout);
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
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);

  return `${minutes.toString().padStart(2, '0')}:${seconds < 10 ? '0' : ''}${seconds}`;
}
