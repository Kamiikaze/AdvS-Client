import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';

export interface Episode {
  show_id: string;
  season_number: string;
  episode_number: string;
  episode_name: string;
  episode_description: string | null;
  episode_meta: EpisodeMeta | object;
  createdAt: Date;
}
interface EpisodeMeta {
  externalEpId: string;

  [key: string]: any;
}

@Entity('Episodes')
export default class Episodes extends CoreEntity {
  @Column({ dataType: 'string' })
  show_id: string;

  @Column({ dataType: 'string' })
  season_number: string;

  @Column({ dataType: 'string' })
  episode_number: string;

  @Column({ dataType: 'string' })
  episode_name: string;

  @Column({ dataType: 'string', canBeNull: true })
  episode_description: string | null;

  @Column({ dataType: 'json' })
  episode_meta: EpisodeMeta | object;

  @Column({ dataType: 'date' })
  createdAt: Date;

  constructor(prop?: EProperties<Episodes>) {
    super();
    this.show_id = prop?.show_id ?? '';
    this.season_number = prop?.season_number ?? '';
    this.episode_number = prop?.episode_number ?? '';
    this.episode_name = prop?.episode_name ?? '';
    this.episode_description = prop?.episode_description ?? null;
    this.episode_meta = prop?.episode_meta ?? {};
    this.createdAt = prop?.createdAt ?? new Date();
  }
}
