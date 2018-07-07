const { join } = require('path');
const {
  FuseBox,
  BabelPlugin,
  WebIndexPlugin,
  QuantumPlugin,
} = require('fuse-box');

const dir = process.argv[2];
const isProduction = process.env.NODE_ENV === 'production';

const fuse = FuseBox.init({
  homeDir: 'src',
  output: join('docs', dir, '$name.js'),
  sourceMaps: !isProduction,
  plugins: [
    BabelPlugin({
      config: {
        sourceMaps: !isProduction,
        presets: [
          [
            'env',
            {
              targets: {
                browsers: ['last 3 versions', 'not < 0.25%', 'not Android < 5'],
              },
              useBuiltIns: true,
            },
          ],
          ['stage-0'],
        ],
      },
    }),
    WebIndexPlugin({
      title: dir,
      template: join('src', dir, 'index.html'),
    }),
    isProduction &&
      QuantumPlugin({
        target: 'browser',
        bakeApiIntoBundle: 'bundle',
        containedAPI: true,
        treeshake: true,
        uglify: { mangle: false },
      }),
  ],
});

if (isProduction) {
  fuse.bundle('bundle').instructions(`>${dir}/bundle.js`);
} else {
  fuse
    .bundle('bundle')
    .instructions(`>${dir}/bundle.js`)
    .hmr({ reload: true })
    .watch();
  fuse.dev({
    root: join('docs', dir),
    httpServer: true,
  });
}

fuse.run();
