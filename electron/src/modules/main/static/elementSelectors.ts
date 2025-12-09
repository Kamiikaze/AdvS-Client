/**
 * Object containing CSS selectors for specific elements within a hoster site.
 *
 * @param {string} Episode_Description CSS selector targeting the element containing the episode description with potential spoilers.
 * @param {string} Episode_Hoster_List CSS selector targeting the list items within the hoster site's video list.
 */
const BaseElementSelector = {
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
};

export const ElementSelector = BaseElementSelector;

export const AniworldElementSelector = {
  ...BaseElementSelector,
};

export const StoElementSelector = {
  ...BaseElementSelector,
};
