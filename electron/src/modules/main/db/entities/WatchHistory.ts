import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';

export interface WatchHistoryItem {
  show_id: string;
  episode_id: string;
  progressSeconds: string;
  progressPercent: string;
}

export interface WatchHistoryListItem extends WatchHistoryItem {
  showName: string;
  showType: string;
  seasonNum: number;
  episodeNum: number;
}

@Entity('WatchHistory')
export default class WatchHistory extends CoreEntity {
  @Column({ dataType: 'string' })
  show_id: string;

  @Column({ dataType: 'string' })
  episode_id: string;

  @Column({ dataType: 'string' })
  progressSeconds: string;

  @Column({ dataType: 'string' })
  progressPercent: string;

  @Column({ dataType: 'date' })
  createdAt: Date;

  @Column({ dataType: 'date' })
  updatedAt: Date;

  constructor(prop?: EProperties<WatchHistory>) {
    super();
    this.show_id = prop?.show_id ?? '';
    this.episode_id = prop?.episode_id ?? '';
    this.progressSeconds = prop?.progressSeconds ?? '';
    this.progressPercent = prop?.progressPercent ?? '';
    this.createdAt = prop?.createdAt ?? new Date();
    this.updatedAt = prop?.updatedAt ?? new Date();
  }
}
