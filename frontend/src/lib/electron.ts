export interface Show {
  e_id: string;
  show_type: string;
  show_name: string;
  show_slug: string;
  show_category: string;
  show_start_year: number | null;
  show_end_year: number | null;
  show_meta: ShowMeta;
  createdAt: Date;
  updatedAt: Date | null;
}
interface ShowMeta {
  alternativeTitles: string;
  imdbId: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Episode {
  e_id: string;
  show_id: string;
  season_number: string;
  episode_number: string;
  episode_name: string;
  episode_description: string | null;
  createdAt: Date;
}

export interface EpisodeHoster {
  e_id: string;
  episode_id: string;
  hoster_language: string;
  hoster_label: string;
  hoster_key: string;
  hoster_redirect: string;
  hoster_resolved: ScraperLink | null;
  createdAt: Date;
  resolvedAt: Date | null;
}

export interface HosterLanguage {
  label: string;
  value: string;
}

export interface GetEpisodeHosterResponse {
  episodeDescription: string | null;
  hosterList: EpisodeHoster[];
}

export type ScraperLink = { redirect: string; mediaLink: string | null };

export interface WatchHistoryItem {
  show_id: string;
  episode_id: string;
  progressSeconds: string;
  progressPercent: string;
}

export interface WatchHistoryListItem extends WatchHistoryItem {
  e_id: string;
  createdAt: Date;
  updatedAt: Date;
  showName: string;
  showType: string;
  seasonNum: number;
  episodeNum: number;
}
