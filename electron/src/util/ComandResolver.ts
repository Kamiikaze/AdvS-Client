export default function resolveCommand(cmd?: string) {
  if (!cmd) {
    return null;
  }
  const start = cmd.substring(6);

  const parts = start.split('?');
  let [p] = parts;
  const [, s] = parts;
  if (p?.endsWith('/')) {
    p = p.substring(0, p.length - 1);
  }

  const map = new Map<string, string>();
  if (s) {
    s.split('&').forEach((kv) => {
      const [key, val] = kv.split('=');
      if (key && val) {
        map.set(key, val);
      }
    });
  }

  return {
    path: p,
    search: map,
  };
}
