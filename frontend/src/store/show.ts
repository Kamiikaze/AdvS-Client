import { acceptHMRUpdate, defineStore } from 'pinia';
import {
  type Episode,
  type EpisodeHoster,
  type GetEpisodeHosterResponse,
  type HosterLanguage,
  type Show,
  type WatchHistoryItem,
  type WatchHistoryListItem,
} from '@/lib/electron';

interface ShowState {
  selections: {
    season: string;
    episode: string;
    language: string | null;
    hoster: string | null;
  };
  availableLanguages: HosterLanguage[];
  shows: Show[];
  currentShow: Show | null;
  episodes: Episode[];
  currentEpisode: Episode | null;
  episodeHosters: EpisodeHoster[];
  watchHistory: WatchHistoryListItem[];
}

export const useShowStore = defineStore('show', {
  state: (): ShowState => ({
    selections: {
      season: '1',
      episode: '1',
      language: '1',
      hoster: 'voe',
    },
    availableLanguages: [
      { label: 'Deutsch', value: '1' },
      { label: 'Deutsch (Sub)', value: '3' },
      { label: 'Englisch (Sub)', value: '2' },
    ],
    shows: [],
    currentShow: null,
    episodes: [],
    currentEpisode: null,
    episodeHosters: [],
    watchHistory: [],
  }),
  getters: {},
  actions: {
    getEpisodeByNumber(seasonNum: string, episodeNum: string) {
      return this.episodes.find(
        (episode) =>
          episode.season_number == seasonNum &&
          episode.episode_number == episodeNum
      )!;
    },
    async fetchShows() {
      this.shows = await window.glxApi.invoke('get-show-list');
    },
    async fetchShowDetails(showId: string) {
      const [updatedShow, episodes]: [Show, Episode[]] =
        await window.glxApi.invoke('get-show', showId);
      this.currentShow = updatedShow;
      this.episodes = episodes;
      this.currentEpisode =
        this.getEpisodeByNumber(
          this.selections.season,
          this.selections.episode
        ) || {};

      this.updateShow(updatedShow);
      return true;
    },
    updateShow(show: Show) {
      const index = this.shows.findIndex((s) => s.e_id == show.e_id);
      if (index !== -1) {
        this.shows[index] = show;
      }
    },
    async fetchEpisodeHosters() {
      const episode: Episode = this.getEpisodeByNumber(
        this.selections.season,
        this.selections.episode
      );

      if (!episode) return;

      const episodeDetails: GetEpisodeHosterResponse =
        await window.glxApi.invoke('get-episode-details', episode.e_id);

      console.log('Adding EpisodeHosters', episode, episodeDetails.hosterList.length);

      this.episodeHosters = episodeDetails.hosterList || [];

      if (episodeDetails.episodeDescription) {
        this.updateEpisodeDescription(
          episode,
          episodeDetails.episodeDescription
        );
      }
    },
    updateEpisodeDescription(episode: Episode, newDescription: string) {
      const index = this.episodes.findIndex((e) => e.e_id == episode.e_id);
      if (index !== -1) {
        const currDesc = this.episodes[index].episode_description;

        if (currDesc === newDescription) return;

        console.log('Updating episode_description',newDescription);
        this.episodes[index].episode_description = newDescription;
      }
    },
    async fetchWatchHistory() {
      this.watchHistory = await window.glxApi.invoke('get-watch-history');
    },
    async updateWatchHistory(currentTime: number, duration: number) {
      console.log("updateWatchHistory", currentTime, duration)
      const currEp = this.currentEpisode

      if (!currEp) {
        console.warn('No current episode available for watch history update')
        return;
      }

      const historyItem:WatchHistoryItem = {
        show_id: currEp.show_id,
        episode_id: currEp.e_id,
        progressSeconds: currentTime.toString(),
        progressPercent: ((currentTime / duration) * 100).toString()
      }

      await window.glxApi.invoke('set-watch-history', historyItem);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useShowStore, import.meta.hot));
}
