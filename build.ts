import arg from 'arg'
import { exec } from 'child_process'
import { BuildOptions, Plugin, build } from 'esbuild'
import { glob } from 'glob'
import { join } from 'node:path'

const args = arg({
  '--src': String,
  '--out': String,
})

const src = args['--src'] ?? './src'
const out = args['--out'] ?? './dist'

const entryPoints = glob.sync(join(src, '**/*.ts'), {
  ignore: join(src, '**/*.test.ts'),
})

const addExtension = (): Plugin => ({
  name: 'add-extension',
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) =>
      args.importer ? { path: `${args.path}.js`, external: true } : undefined,
    )
  },
})

const baseOptions: BuildOptions = {
  entryPoints,
  logLevel: 'info',
  platform: 'node',
  sourcemap: true,
}

const cjsBuild = () =>
  build({
    ...baseOptions,
    outbase: src,
    outdir: join(out, 'cjs'),
    format: 'cjs',
  })

const esmBuild = () =>
  build({
    ...baseOptions,
    bundle: true,
    outbase: src,
    outdir: join(out, 'esm'),
    format: 'esm',
    plugins: [addExtension()],
  })

const typesBuild = () =>
  exec(`tsc --declaration --emitDeclarationOnly --outDir ${join(out, 'types')}`)

Promise.all([cjsBuild(), esmBuild(), typesBuild()])
