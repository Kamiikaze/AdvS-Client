type Tblock = 'top' | 'bottom';
type Tinline = 'start' | 'end' | 'left' | 'right';
export type Anchor =
  | Tblock
  | Tinline
  | 'center'
  | 'center center'
  | `${Tblock} ${Tinline | 'center'}`
  | `${Tinline} ${Tblock | 'center'}`;

export interface DiscordConfig {
  state: boolean;
  display: { show: boolean; episode: boolean };
}
