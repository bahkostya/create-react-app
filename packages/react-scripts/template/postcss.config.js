module.exports = {
	parser: require('postcss-scss'),
	plugins: [
		require('autoprefixer')({
			browsers: ['last 2 versions', 'Firefox ESR', 'Firefox >= 20'],
		}),
	],
};
