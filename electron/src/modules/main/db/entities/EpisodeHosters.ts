import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';
import { ScraperLink } from '../../lib';

// export interface EpisodeHoster {
//   episode_id: string;
//   hoster_language: HosterLanguage;
//   hoster_label: string;
//   hoster_key: string;
//   hoster_redirect: string;
//   hoster_resolved: ScraperLink | null;
//   createdAt: Date;
//   resolvedAt: Date | null;
// }

export enum HosterLanguage {
  'Deutsch' = '1',
  'Englisch (Sub)' = '2',
  'Deutsch (Sub)' = '3',
}

@Entity('EpisodeHosters')
export default class EpisodeHosters extends CoreEntity {
  @Column({ dataType: 'string' })
  episode_id: string;

  @Column({ dataType: 'string' })
  hoster_language: HosterLanguage;

  @Column({ dataType: 'string' })
  hoster_label: string;

  @Column({ dataType: 'string' })
  hoster_key: string;

  @Column({ dataType: 'string' })
  hoster_redirect: string;

  @Column({ dataType: 'json', canBeNull: true })
  hoster_resolved: ScraperLink | null;

  @Column({ dataType: 'date' })
  createdAt: Date;

  @Column({ dataType: 'date', canBeNull: true })
  resolvedAt: Date | null;

  constructor(prop?: EProperties<EpisodeHosters>) {
    super();
    this.episode_id = prop?.episode_id ?? '';
    this.hoster_language = prop?.hoster_language ?? HosterLanguage.Deutsch;
    this.hoster_label = prop?.hoster_label ?? '';
    this.hoster_key = prop?.hoster_key ?? '';
    this.hoster_redirect = prop?.hoster_redirect ?? '';
    this.hoster_resolved = prop?.hoster_resolved ?? null;
    this.createdAt = prop?.createdAt ?? new Date();
    this.resolvedAt = prop?.resolvedAt ?? null;
  }
}
