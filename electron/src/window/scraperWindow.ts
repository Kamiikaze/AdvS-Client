import { BrowserWindow } from 'electron';
import type { BaseElement, IKernel } from '@grandlinex/e-kernel';
import { randomUUID } from 'crypto';
import { axiosGet } from '../util/routedRequest';
import type EpisodeHosters from '../modules/main/db/entities/EpisodeHosters';
import type { ScraperLink } from '../modules/main/lib';
import injectScripts from '../util/injectScripts';

export default async function scraperWindow(
  episodeHost: EpisodeHosters,
  element: BaseElement<IKernel>
): Promise<ScraperLink | null> {
  const windowId = `SCRAPER-${randomUUID()}`;
  const kernel = element.getKernel();
  const window = kernel.getWindowManager().create(windowId, (w) => {
    return new BrowserWindow({
      ...w,
      show: false,
    });
  });

  const { session } = window.webContents;
  let scrapeTimeoutId: NodeJS.Timeout;

  const result = await axiosGet(episodeHost.hoster_redirect);
  const requestUrl = result?.request.res.responseUrl;

  if (!requestUrl) {
    console.error('Got no requestUrl', requestUrl);
    return null;
  }
  console.log('requestUrl', requestUrl);

  // ToDo: vidmoly has multiple stream links but only 1 works, others are cors blocked
  return new Promise((resolve) => {
    session.webRequest.onBeforeRequest((details, callback) => {
      // Regex to match common media file extensions
      const mediaPattern = /\.(mp4|webm|m4a|mkv|avi|m3u8)/i;

      const fileUrl = details.url.split('?')[0];

      if (!details.url.includes('devtools://') && mediaPattern.test(fileUrl)) {
        console.log('Media File Requested:', details.url, details.resourceType);
        clearTimeout(scrapeTimeoutId);
        kernel.getWindowManager().close(windowId);
        resolve({ redirect: requestUrl, mediaLink: details.url });
      }

      // Continue the request
      callback({});
    });

    (async () => {
      await window.loadURL(requestUrl);

      // Wait for navigation to complete (including JavaScript redirection if applicable)
      await new Promise((resFinished) => {
        window.webContents.once('did-finish-load', () => resFinished(true));
      });
      console.log('Done loading page.');

      console.log('Injecting script for', episodeHost.hoster_key);
      const injectScript: string =
        injectScripts[episodeHost.hoster_key as keyof typeof injectScripts];
      if (!injectScript) {
        console.error('No inject script found for', episodeHost.hoster_key);
        resolve({ redirect: requestUrl, mediaLink: null });
      }
      const execResult =
        await window.webContents.executeJavaScript(injectScript);

      // Log the result
      if (execResult.exists) {
        console.log(
          `Video clicked. Is video paused? ${execResult.paused}. Current time: ${execResult.currentTime}s`
        );
      } else {
        console.log('No <video> tag found on the page.');
      }
    })();

    // todo: clear if found
    scrapeTimeoutId = setTimeout(() => {
      console.error('Timeout reached, closing window');
      kernel.getWindowManager().close(windowId);
      resolve({ redirect: requestUrl, mediaLink: null });
    }, 6 * 1000);
  });
}
