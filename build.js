const { writeFile, copyFile } = require('fs');
const { join } = require('path');
const pug = require('pug');
const {
  FuseBox,
  BabelPlugin,
} = require('fuse-box');

const dir = process.argv[2];

writeFile(
  join('docs', dir, 'index.html'),
  pug.compileFile(join('src', dir, 'index.pug'))(),
);

const fuse = FuseBox.init({
  homeDir: 'src',
  output: join('docs', dir, '$name.js'),
  sourceMaps: true,
  plugins: [
    BabelPlugin({
      config: {
        sourceMaps: true,
        presets: [
          [
            'env',
            {
              targets: {
                browsers: [
                  'last 3 versions',
                  'not < 0.25%',
                  'not Android < 5',
                ],
              },
              useBuiltIns: 'usage',
            },
          ],
          [
            'stage-0',
          ],
        ],
      },
    }),
  ],
});

fuse
  .bundle('bundle')
  .instructions(`>${dir}/bundle.js`)
  .hmr({ reload: true })
  .watch();

fuse.dev({
  root: join('docs', dir),
  httpServer: true,
});

fuse.run();
