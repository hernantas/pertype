export function resolvePath(...keys: (string | undefined)[]): string {
  return keys
    .filter((key): key is string => key !== undefined)
    .flatMap((key) => key.split('.'))
    .filter((key) => key !== '')
    .join('.')
}
