import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';

export interface Show {
  show_type: string;
  show_name: string;
  show_slug: string;
  show_category: string;
  show_start_year: number | null;
  show_end_year: number | null;
  show_meta: ShowMeta | object;
  createdAt: Date;
  updatedAt: Date | null;
}
interface ShowMeta {
  alternativeTitles: string;
  imdbId: string;

  [key: string]: any;
}

@Entity('ShowList')
export default class ShowList extends CoreEntity {
  @Column({ dataType: 'string' })
  show_type: string;

  @Column({ dataType: 'string' })
  show_name: string;

  @Column({ dataType: 'string' })
  show_slug: string;

  @Column({ dataType: 'string' })
  show_category: string;

  @Column({ dataType: 'int', canBeNull: true })
  show_start_year: number | null;

  @Column({ dataType: 'int', canBeNull: true })
  show_end_year: number | null;

  @Column({ dataType: 'json' })
  show_meta: ShowMeta | object;

  @Column({ dataType: 'date' })
  createdAt: Date;

  @Column({ dataType: 'date', canBeNull: true })
  updatedAt: Date | null;

  constructor(prop?: EProperties<ShowList>) {
    super();
    this.show_type = prop?.show_type ?? '';
    this.show_name = prop?.show_name ?? '';
    this.show_slug = prop?.show_slug ?? '';
    this.show_category = prop?.show_category ?? '';
    this.show_start_year = prop?.show_start_year ?? null;
    this.show_end_year = prop?.show_end_year ?? null;
    this.show_meta = prop?.show_meta ?? {};
    this.createdAt = prop?.createdAt ?? new Date();
    this.updatedAt = prop?.updatedAt ?? null;
  }
}
