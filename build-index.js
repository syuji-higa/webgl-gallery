const { readdir, readFile, writeFile, watch } = require('fs');
const { promisify } = require('util');
const pug = require('pug');
const stylus = require('stylus');
const browserSync = require('browser-sync');

const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

const isProduction = process.env.NODE_ENV === 'production';

const createHtml = async () => {
	const files = await readdirAsync('src/works');
	const dirs = files.filter(file => !file.match(/^\./));
	const orgTmp = await readFileAsync('src/index.pug', 'utf-8');
	const tmp = orgTmp.replace('{{dirs}}', JSON.stringify(dirs));
	writeFileAsync('docs/index.html', pug.render(tmp, { pretty: !isProduction }));
};

const createCss = async () => {
	const tmp = await readFileAsync('src/style.styl', 'utf-8');
	stylus(tmp)
		.set('filename', 'docs/style.css')
		.set('compress', isProduction)
		.render((err, css) => {
			if (err) throw err;
			writeFileAsync('docs/style.css', css);
		});
};

createHtml();
createCss();

if (!isProduction) {
	// sarever
	browserSync({
		server: 'docs',
		ui: false,
		open: false,
		notify: false,
		reloadOnRestart: true,
		scrollProportionally: false
	});

	// watch
	watch('src/index.pug', createHtml);
	watch('src/style.styl', createCss);

	// realad
	browserSync.watch('docs/(index.html|style.css)').on('change', browserSync.reload);
}
