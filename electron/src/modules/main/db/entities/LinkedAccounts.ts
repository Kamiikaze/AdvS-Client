import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';

export enum AccountStatus {
  SYNCED,
  NOT_SYNCED,
  ERROR,
  DISABLED,
}

@Entity('LinkedAccounts')
export default class LinkedAccounts extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  provider: string;

  @Column({
    dataType: 'string',
    canBeNull: true,
  })
  token: string | null;

  @Column({
    dataType: 'int',
  })
  updated: number;

  @Column({
    dataType: 'int',
  })
  status: AccountStatus;

  @Column({
    dataType: 'json',
  })
  meta: Record<string, any>;

  constructor(props?: EProperties<LinkedAccounts>) {
    super();
    this.provider = props?.provider ?? '';
    this.token = props?.token ?? null;
    this.updated = props?.updated ?? Date.now();
    this.meta = props?.meta ?? {};
    this.status = props?.status ?? AccountStatus.NOT_SYNCED;
  }
}
