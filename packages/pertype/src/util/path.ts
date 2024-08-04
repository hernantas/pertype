/**
 * Resolves a path by joining multiple path segments together.
 *
 * @param paths The path segments to join.
 * @returns The resolved path.
 */
export function resolvePath(...paths: (string | undefined)[]): string {
  return paths
    .filter((path): path is string => path !== undefined)
    .flatMap((path) => path.split('.'))
    .filter((path) => path !== '')
    .join('.')
}
