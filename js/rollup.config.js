import babel from 'rollup-plugin-babel'

export default {
  input: 'blokus.js',
  output: {
      file: '../dist/bundle.js',
      format: 'iife',
      name: 'blokus'
  },
  plugins: [
    babel()
  ]
}
