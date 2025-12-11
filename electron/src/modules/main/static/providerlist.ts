import type { ICoreAnyModule, ICoreKernelModule } from '@grandlinex/e-kernel';
import AniworldProvider from '../class/AniworldProvider';
import StoProvider from '../class/StoProvider';

const providerList = [
  {
    name: 'aniworld',
  },
  {
    name: 'sto',
  },
];

export default providerList;

export const providerRegistry = {
  aniworld: AniworldProvider,
  sto: StoProvider,
} as const;

export type ProviderKey = keyof typeof providerRegistry;
export type ProviderInstance = InstanceType<
  (typeof providerRegistry)[ProviderKey]
>;

export function createProvider<K extends ProviderKey>(
  key: K,
  module: ICoreAnyModule
): InstanceType<(typeof providerRegistry)[K]> {
  const ProviderClass = providerRegistry[key];
  return new ProviderClass(module) as InstanceType<
    (typeof providerRegistry)[K]
  >;
}
