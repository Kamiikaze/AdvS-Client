import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';

export interface LinkedAccount {
  e_id: string;
  provider: string;
  token: string;
  status: string;
  meta: Record<string, any>;
  updatedAt: string;
}

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
  status: AccountStatus;

  @Column({
    dataType: 'json',
  })
  meta: Record<string, any>;

  @Column({
    dataType: 'int',
  })
  updatedAt: number;

  constructor(props?: EProperties<LinkedAccounts>) {
    super();
    this.provider = props?.provider ?? '';
    this.token = props?.token ?? null;
    this.meta = props?.meta ?? {};
    this.status = props?.status ?? AccountStatus.NOT_SYNCED;
    this.updatedAt = props?.updatedAt ?? Date.now();
  }
}
