var Metadocs = require('../lib/metadocs');

new Metadocs({
	src: './docs-src',
	dest: '../docs',
	theme: 'bootstrap'
}).gen();