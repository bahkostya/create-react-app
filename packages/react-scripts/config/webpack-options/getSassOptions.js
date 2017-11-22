const path = require('path');
const HappyPack = require('happypack');
const paths = require('../paths');
const getClientEnvironment = require('../env');

const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const isSassEnabled = env.raw.REACT_APP_SASS;

const plugin = new HappyPack({
	id: 'sass-styles',
	threads: 3,
	loaders: [
		{
			loader: require.resolve('style-loader'),
			query: {
				sourceMap: true,
			},
		},
		{
			loader: require.resolve('css-loader'),
			query: {
				// modules: true,
				importLoaders: 1,
				sourceMap: true,
				// localIdentName: '[name]__[local]___[hash:base64:5]'
			},
		},
		{
			loader: require.resolve('postcss-loader'),
			query: {
				sourceMap: true,
				config: {
					path: path.resolve(
						process.cwd(),
						'config/postcss.config.js'
					),
				},
			},
		},
		{
			loader: require.resolve('sass-loader'),
			query: {
				sourceMap: true,
				sourceComments: true,
				includePaths: [
					paths.appSrc,
					path.resolve(
						process.cwd(),
						'node_modules/sass-mq/_mq.scss'
					),
					require('node-bourbon').includePaths,
				],
			},
		},
	],
});

const rule = {
	test: /\.scss$/,
	exclude: /node_modules/,
	include: paths.appSrc,
	loader: 'happypack/loader?id=sass-styles',
};

module.exports = function getSassOptions() {
	if (!isSassEnabled) {
		return {
			plugins: [],
			rules: [],
		};
	}

	return {
		plugins: [plugin],
		rules: [rule],
	};
};
