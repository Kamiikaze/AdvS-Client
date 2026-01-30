import {
  type CoreModule,
  type IBaseKernelModule,
  type IKernel,
  type InMemCache,
  StoreGlobal,
} from '@grandlinex/e-kernel';
import { BaseClient, KernelWindowName } from '@grandlinex/e-kernel';
import type { HTMLElement as njsParserReturn } from 'node-html-parser';
import * as njsParser from 'node-html-parser';
import { ElectronBlocker } from '@ghostery/adblocker-electron';
import fetch from 'cross-fetch';
import path from 'node:path';
import { promises as fs } from 'fs';
import type MainDB from '../db/MainDB';
import type ShowList from '../db/entities/ShowList';
import type Episodes from '../db/entities/Episodes';
import type { Episode } from '../db/entities/Episodes';
import type { HosterLanguage } from '../db/entities/EpisodeHosters';
import EpisodeHosters from '../db/entities/EpisodeHosters';
import { axiosGet } from '../../../util/routedRequest';
import type WatchHistory from '../db/entities/WatchHistory';
import type { WatchHistoryListItem } from '../db/entities/WatchHistory';
import type LinkedAccounts from '../db/entities/LinkedAccounts';
import {
  AniworldElementSelector,
  StoElementSelector,
} from '../static/elementSelectors';

export interface FetchedShow {
  seasons: string[];
  episodes: Episode[];
  startYear: number;
  endYear: number;
  imdbId: string | null;
}

export default class MainClient extends BaseClient<IKernel, MainDB> {
  constructor(mod: IBaseKernelModule<MainDB, MainClient, InMemCache>) {
    super('main', mod);
  }

  async attachElectronBlocker(eSession: Electron.Session) {
    const store = this.getKernel().getConfigStore();
    const data = store.get(StoreGlobal.GLOBAL_PATH_DATA)!;

    const blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch, {
      path: path.join(data, 'engine.bin'),
      read: async (...args) => (await fs.readFile(...args)) as any,
      write: async (...args) => fs.writeFile(...args),
    });
    blocker.enableBlockingInSession(eSession);
    this.log('ElectronBlocker: Enabled');

    blocker.on('request-blocked', (request) => {
      this.log(`ElectronBlocker: Blocked(${request.tabId})`, request.url);
    });
  }

  static getBaseUrl(showType: string) {
    return showType === 'anime' ? 'https://aniworld.to' : 'https://s.to';
  }

  async fetchShowList(type: 'anime' | 'serie') {
    const url = type === 'anime' ? 'https://aniworld.to' : 'https://s.to';
    const listPath = type === 'anime' ? 'animes' : 'serien';

    this.log('fetchShowList', type, url, listPath);
    const response = await axiosGet(`${url}/${listPath}?by=genre`);

    if (!response) {
      this.error('Failed to fetch show list');
      return [];
    }

    const body: njsParserReturn = njsParser.parse(response.data);

    if (type === 'anime') {
      const genres = body.querySelectorAll(
        AniworldElementSelector.SHOW_LIST.GENRE.LIST
      );

      return genres
        .map((genre) => {
          const genreName = genre
            .querySelector(AniworldElementSelector.SHOW_LIST.GENRE.NAME)!
            .textContent?.trim();
          return genre
            .querySelectorAll(AniworldElementSelector.SHOW_LIST.SHOW)
            .map((el) => ({
              name: el.textContent!.trim(),
              genre: genreName,
              type,
              slug: el.getAttribute('href')!.replace(`/${type}/stream/`, ''),
              meta: {
                alternativeTitles:
                  el.getAttribute('data-alternative-title') || '',
              },
            }));
        })
        .flat();
    }

    if (type === 'serie') {
      const genres = body.querySelectorAll(
        StoElementSelector.SHOW_LIST.GENRE.LIST
      );

      return genres
        .map((genre) => {
          const genreName = genre.textContent?.trim();

          const shows = genre.parentNode.nextElementSibling!;

          return shows
            .querySelectorAll(StoElementSelector.SHOW_LIST.SHOW)
            .map((el) => ({
              name: el.textContent!.trim(),
              genre: genreName,
              type,
              slug: el.getAttribute('href')!.replace(`/${type}/`, ''),
              meta: {
                alternativeTitles:
                  el.parentNode.getAttribute('data-search')?.trim() || '',
              },
            }));
        })
        .flat();
    }

    return [];
  }

  async fetchShowDetails(show: ShowList): Promise<FetchedShow | null> {
    this.log('fetchShowDetails', show.e_id);

    const showSlug = show.show_slug;
    const showType = show.show_type;

    const baseUrl =
      showType === 'anime' ? 'https://aniworld.to' : 'https://s.to';
    const prePath =
      showType === 'anime'
        ? `${showType}/stream/${showSlug}`
        : `${showType}/${showSlug}`;

    const response = await axiosGet(`${baseUrl}/${prePath}/staffel-1`);
    if (!response) {
      this.error('Failed to fetch show details');
      return null;
    }
    const showBody: njsParserReturn = njsParser.parse(response.data);

    let seasonsSelector;
    let episodesSelector;
    let showMetaSelector;
    let imdbSelector;
    let startYear;
    let endYear;
    let imdbId;

    let episodeNameSelector;

    if (showType === 'anime') {
      seasonsSelector = AniworldElementSelector.SHOW.SEASON_LIST;
      episodesSelector = AniworldElementSelector.SHOW.EPISODE_LIST;
      showMetaSelector = AniworldElementSelector.SHOW.YEARS;
      imdbSelector = AniworldElementSelector.SHOW.IMDB;

      [startYear, endYear] = showBody
        .querySelectorAll(showMetaSelector)
        .map((el) => el.textContent);

      imdbId =
        showBody.querySelector(imdbSelector)?.getAttribute('data-imdb') || null;

      episodeNameSelector =
        AniworldElementSelector.SHOW.SEASON_PAGE.EPISODE_NAME;
    } else {
      seasonsSelector = StoElementSelector.SHOW.SEASON_LIST;
      episodesSelector = StoElementSelector.SHOW.EPISODE_LIST;
      showMetaSelector = StoElementSelector.SHOW.META;

      const showMeta = showBody.querySelector(showMetaSelector)!.children;
      startYear = showMeta[0].textContent;
      endYear = showMeta[1].textContent;

      const href = showMeta[2]?.getAttribute('href') ?? '';
      const match = href.match(/title\/(tt\d+)\//);
      imdbId = match?.[1] ?? null;

      episodeNameSelector = StoElementSelector.SHOW.SEASON_PAGE.EPISODE_NAME;
    }

    const seasonList = showBody
      .querySelectorAll(seasonsSelector)
      .map((s) => (s.textContent === 'Filme' ? '0' : s.textContent.trim()));

    const episodes: Episode[] = [];

    await Promise.all(
      seasonList.map(async (season) => {
        const seasonPage = await axiosGet(
          `${baseUrl}/${prePath}/staffel-${season}`
        );
        if (!seasonPage) {
          this.error(
            `Failed to fetch season ${season} for show ${showType} ${showSlug}`
          );
          return;
        }
        const seasonBody = njsParser.parse(seasonPage.data);
        const episodesList = seasonBody
          .querySelectorAll(episodesSelector)
          .map((el) => {
            const epNum =
              showType === 'anime'
                ? el.textContent.trim()
                : el
                    .querySelector(
                      StoElementSelector.SHOW.SEASON_PAGE.EPISODE_NUMBER
                    )!
                    .textContent.trim();

            // ToDo: EpisodeId not available for non-loggedin user
            const epId =
              showType === 'anime' ? el.getAttribute('data-episode-id')! : '';

            const episode: Episode = {
              show_id: show.e_id,
              season_number: season,
              episode_number: epNum,
              episode_name: seasonBody
                .querySelectorAll(episodeNameSelector)
                [Number(epNum) - 1].innerText.trim()
                .replace('\n', ' - '),
              episode_description: null,
              episode_meta: {
                externalEpId: epId,
              },
              createdAt: new Date(),
            };
            return episode;
          });
        episodes.push(...episodesList);
      })
    );

    return {
      seasons: seasonList,
      episodes,
      startYear: Number(startYear),
      endYear: Number(endYear),
      imdbId,
    } as FetchedShow;
  }

  async fetchEpisodeDetails(episode: Episodes) {
    const show = await this.getModule().getDb().showList.findObj({
      e_id: episode.show_id,
    });

    if (!show) {
      throw new Error('Show not found');
    }

    const showSlug = show.show_slug;
    const showType = show.show_type;

    const baseUrl = MainClient.getBaseUrl(showType);
    const prePath =
      showType === 'anime'
        ? `${showType}/stream/${showSlug}`
        : `${showType}/${showSlug}`;

    const episodeUrl = `${baseUrl}/${prePath}/staffel-${episode.season_number}/episode-${episode.episode_number}`;

    const response = await axiosGet(episodeUrl);

    if (!response) {
      this.error('Failed to fetch episode details');
      return null;
    }

    const body: njsParserReturn = njsParser.parse(response.data);

    let episodeDescriptionSelector;

    if (showType === 'anime') {
      episodeDescriptionSelector = AniworldElementSelector.EPISODE.DESCRIPTION;
    } else {
      episodeDescriptionSelector = StoElementSelector.EPISODE.DESCRIPTION;
    }

    const episodeDescription =
      body.querySelector(episodeDescriptionSelector)?.textContent.trim() ||
      null;
    this.log('episodeDescription', episodeDescription);

    const hosterList = await this.fetchEpisodeHosters(
      body,
      episode.e_id,
      showType
    );

    return {
      episodeDescription,
      hosterList,
    };
  }

  async fetchEpisodeHosters(body: njsParserReturn, epId: string, type: string) {
    const episodeHosters: EpisodeHosters[] = [];

    let hosterListSelector;
    let hosterNameSelector;

    if (type === 'anime') {
      hosterListSelector = AniworldElementSelector.EPISODE.HOSTER.LIST;
      hosterNameSelector = AniworldElementSelector.EPISODE.HOSTER.NAME;
    } else {
      hosterListSelector = StoElementSelector.EPISODE.HOSTER.LIST;
      hosterNameSelector = StoElementSelector.EPISODE.HOSTER.NAME;
    }

    const hosterElements = body.querySelectorAll(hosterListSelector);

    if (hosterElements.length === 0) {
      this.warn('No Hosters found');
      return null;
    }

    this.log('Hosters found', hosterElements.length);

    const hosterPromises = Array.from(hosterElements).map(async (host) => {
      const linkId = host.getAttribute('data-link-id');
      const name =
        type === 'anime'
          ? host.querySelector(hosterNameSelector)!.textContent.trim()
          : host.getAttribute('data-provider-name');

      const language =
        type === 'anime'
          ? (host.getAttribute('data-lang-key') as HosterLanguage)
          : (host.getAttribute('data-language-id') as HosterLanguage);

      if (linkId && name && language) {
        const redirectUrl =
          type === 'anime'
            ? `${MainClient.getBaseUrl(type)}/redirect/${linkId}`
            : `${MainClient.getBaseUrl(type)}${host.getAttribute(
                'data-play-url'
              )}`;

        return new EpisodeHosters({
          episode_id: epId,
          hoster_language: language,
          hoster_label: name,
          hoster_key: name.toLowerCase(),
          hoster_redirect: redirectUrl,
          createdAt: new Date(),
          hoster_resolved: null,
          resolvedAt: null,
        });
      }

      return null;
    });

    const results = await Promise.all(hosterPromises);
    episodeHosters.push(
      ...results.filter((item): item is EpisodeHosters => item !== null)
    );

    return episodeHosters;
  }

  updatePreloadMsg(message: string) {
    const eKernel = this.getKernel();
    const preloadWindow = eKernel
      .getWindowManager()
      .get(KernelWindowName.PRELOAD);
    if (preloadWindow) {
      // preloadWindow.webContents.openDevTools();
      preloadWindow.webContents.send('preload-msg-update', message);
    } else {
      this.error('Not Found preloadWindow');
    }
  }

  async filterWatchHistoryByShow(history: WatchHistory[]) {
    const db = this.getModule().getDb();
    // return a show once and only for the highest season and episode number. episode and season num can be get from fetching episode by episode_id

    const result: WatchHistoryListItem[] = [];

    await Promise.all(
      history.map(async (curr) => {
        const currShow = await db.showList.getObjById(curr.show_id);
        const currEp = await db.episodes.findObj({ e_id: curr.episode_id });

        if (!currShow || !currEp) return;

        result.push({
          ...curr,
          showName: currShow.show_name,
          showType: currShow.show_type,
          seasonNum: Number(currEp.season_number),
          episodeNum: Number(currEp.episode_number),
        });
      })
    );

    return result;
  }

  async getAccountToken(acc: LinkedAccounts) {
    if (!acc.token) return null;
    const cc = this.getKernel().getCryptoClient()!;
    return cc.keyStoreLoad(acc.token);
  }

  async setAccountToken(acc: LinkedAccounts, token: string) {
    const db = this.getModule().getDb();
    const cc = this.getKernel().getCryptoClient()!;
    if (acc.token) {
      const mod = this.getKernel().getCoreModule() as CoreModule;
      const modDB = mod.getDb();
      await modDB.deleteKey(acc.token);
    }
    const ks = await cc.keyStoreSave(token);
    return db.linkedAccounts.updateObject(acc.e_id, { token: ks });
  }
}
