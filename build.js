const { accessSync } = require('fs');
const { join } = require('path');
const {
  FuseBox,
  BabelPlugin,
  WebIndexPlugin,
  QuantumPlugin,
} = require('fuse-box');

const dir = process.argv[2];
const isProduction = process.env.NODE_ENV === 'production';

const srcDir = join('src/works', dir);
const distDir = join('docs', dir);

accessSync(srcDir);

const fuse = FuseBox.init({
  homeDir: 'src',
  output: join(distDir, '$name.js'),
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
      template: join(srcDir, 'index.html'),
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
  fuse.bundle('bundle').instructions(`>works/${dir}/bundle.js`);
} else {
  fuse
    .bundle('bundle')
    .instructions(`>works/${dir}/bundle.js`)
    .hmr({ reload: true })
    .watch();
  fuse.dev({
    root: 'docs',
    httpServer: true,
  });
}

fuse.run();
