import type {
  CoreModule,
  IBaseKernelModule,
  IKernel,
  InMemCache,
} from '@grandlinex/e-kernel';
import { BaseClient, KernelWindowName } from '@grandlinex/e-kernel';
import type { HTMLElement as njsParserReturn } from 'node-html-parser';
import * as njsParser from 'node-html-parser';
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
import { ElementSelector } from '../static/elementSelectors';

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

  static getBaseUrl(showType: string) {
    return showType === 'anime' ? 'https://aniworld.to' : 'https://s.to';
  }

  async fetchShowList(type: 'anime' | 'serie') {
    const url = type === 'anime' ? 'https://aniworld.to' : 'https://s.to';
    const listPath = type === 'anime' ? 'animes' : 'serien';

    this.log('fetchShowList', type, url, listPath);
    const response = await axiosGet(`${url}/${listPath}`);

    if (!response) {
      this.error('Failed to fetch show list');
      return [];
    }

    const body: njsParserReturn = njsParser.parse(response.data);

    const genres = body.querySelectorAll(ElementSelector.SHOW_LIST.GENRE.LIST);

    return genres
      .map((genre) => {
        const genreName = genre
          .querySelector(ElementSelector.SHOW_LIST.GENRE.NAME)!
          .textContent?.trim();
        return genre
          .querySelectorAll(ElementSelector.SHOW_LIST.SHOW)
          .map((el) => ({
            name: el.textContent!.trim(),
            genre: genreName,
            type,
            slug: el.getAttribute('href')!.replace(`/${type}/stream/`, ''),
            meta: {
              alternativeTitles: el.getAttribute('data-alternative-title'),
            },
          }));
      })
      .flat();
  }

  async fetchShowDetails(show: ShowList): Promise<FetchedShow | null> {
    this.log('fetchShowDetails', show.e_id);

    const showSlug = show.show_slug;
    const showType = show.show_type;

    const url = showType === 'anime' ? 'https://aniworld.to' : 'https://s.to';

    const response = await axiosGet(
      `${url}/${showType}/stream/${showSlug}/staffel-1`
    );
    if (!response) {
      this.error('Failed to fetch show details');
      return null;
    }
    const showBody: njsParserReturn = njsParser.parse(response.data);

    const seasonsSelector = '#stream ul:nth-child(1) li a';
    const episodesSelector = '#stream ul:nth-child(4) li a';
    const yearsSelector = '.series-title small span';
    const imdbSelector = 'a.imdb-link';

    const [startYear, endYear] = showBody
      .querySelectorAll(yearsSelector)
      .map((el) => el.textContent);

    const imdbId =
      showBody.querySelector(imdbSelector)?.getAttribute('data-imdb') || null;

    const seasonList = showBody
      .querySelectorAll(seasonsSelector)
      .map((s) => (s.textContent === 'Filme' ? '0' : s.textContent.trim()));

    const episodes: Episode[] = [];

    await Promise.all(
      seasonList.map(async (season) => {
        const seasonPage = await axiosGet(
          `${url}/${showType}/stream/${showSlug}/staffel-${season}`
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
            const episode: Episode = {
              show_id: show.e_id,
              season_number: season,
              episode_number: el.textContent.trim(),
              episode_name: seasonBody
                .querySelectorAll(
                  '.seasonEpisodesList tbody tr .seasonEpisodeTitle'
                )
                [Number(el.textContent.trim()) - 1].innerText.trim(),
              episode_description: null,
              episode_meta: {
                externalEpId: el.getAttribute('data-episode-id')!,
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
    const episodeUrl = `${baseUrl}/${showType}/stream/${showSlug}/staffel-${episode.season_number}/episode-${episode.episode_number}`;

    const response = await axiosGet(episodeUrl);

    if (!response) {
      this.error('Failed to fetch episode details');
      return null;
    }

    const body: njsParserReturn = njsParser.parse(response.data);

    const episodeDescription =
      body
        .querySelector(ElementSelector.EPISODE.DESCRIPTION)
        ?.textContent.trim() || null;
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

    const hosterElements = body.querySelectorAll(
      ElementSelector.EPISODE.HOSTER.LIST
    );

    if (hosterElements.length === 0) {
      this.warn('No Hosters found');
      return null;
    }

    this.log('Hosters found', hosterElements.length);

    const hosterPromises = Array.from(hosterElements).map(async (host) => {
      const linkId = host.getAttribute('data-link-id');
      const name = host
        .querySelector(ElementSelector.EPISODE.HOSTER.NAME)!
        .textContent.trim();
      const language = host.getAttribute('data-lang-key') as HosterLanguage;

      if (linkId && name && language) {
        const redirectUrl = `${MainClient.getBaseUrl(type)}/redirect/${linkId}`;

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

        const existing = result.find((h) => h.show_id === curr.show_id);

        if (!existing) {
          result.push({
            ...curr,
            showName: currShow.show_name,
            showType: currShow.show_type,
            seasonNum: Number(currEp.season_number),
            episodeNum: Number(currEp.episode_number),
          });
          return;
        }

        const existingEp = await db.episodes.findObj({
          e_id: existing.episode_id,
        });

        if (!existingEp) return;

        if (
          currEp.season_number > existingEp.season_number ||
          (currEp.season_number === existingEp.season_number &&
            currEp.episode_number > existingEp.episode_number)
        ) {
          // Replace existing with current since current is higher
          const index = result.indexOf(existing);
          result[index] = {
            ...curr,
            showName: currShow.show_name,
            showType: currShow.show_type,
            seasonNum: Number(currEp.season_number),
            episodeNum: Number(currEp.episode_number),
          };
        }
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
