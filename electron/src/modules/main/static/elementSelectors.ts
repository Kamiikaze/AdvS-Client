export const AniworldElementSelector = {
  EPISODE: {
    DESCRIPTION: '.hosterSiteTitle .descriptionSpoiler',
    HOSTER: {
      LIST: '.hosterSiteVideo ul li',
      NAME: 'h4',
    },
  },
  SHOW_LIST: {
    GENRE: {
      LIST: '.genre',
      NAME: 'h3',
    },
    SHOW: 'li a',
  },
  SHOW: {
    SEASON_LIST: '#stream ul:nth-child(1) li a',
    EPISODE_LIST: '#stream ul:nth-child(4) li a',
    YEARS: '.series-title small span',
    IMDB: 'a.imdb-link',
    SEASON_PAGE: {
      EPISODE_NAME: '.seasonEpisodesList tbody tr .seasonEpisodeTitle',
    },
  },
};

export const StoElementSelector = {
  EPISODE: {
    DESCRIPTION: '.text-body',
    HOSTER: {
      LIST: '#episode-links button',
      NAME: 'h4',
    },
  },
  SHOW_LIST: {
    GENRE: {
      LIST: 'h3',
    },
    SHOW: 'li a',
  },
  SHOW: {
    SEASON_LIST: '#season-nav .nav-link',
    EPISODE_LIST: '.episode-row',
    META: 'p.text-muted',
    SEASON_PAGE: {
      EPISODE_NAME: '.episode-title-cell',
      EPISODE_NUMBER: '.episode-number-cell',
      EPISODE_ID: '.episode-eye',
    },
  },
};
