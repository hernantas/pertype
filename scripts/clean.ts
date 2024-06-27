import { rimraf } from 'rimraf'

async function clean(
  files: string[] = ['./dist', '*.tsbuildinfo', '.rollup.*'],
) {
  await rimraf(files, { glob: true })
}
clean()
