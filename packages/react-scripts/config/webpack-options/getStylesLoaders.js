const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPack = require('happypack');
const paths = require('../paths');
const getClientEnvironment = require('../env');

const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const isSassEnabled = env.raw.REACT_APP_SASS;
const isProduction = env.raw.NODE_ENV === 'production';

const happyPackLoaders = [
	{
		loader: require.resolve('css-loader'),
		options: {
			importLoaders: 1,
			sourceMap: true,
			modules: true,
			localIdentName: '[name]__[local]___[hash:base64:5]',
		},
	},
	{
		loader: require.resolve('postcss-loader'),
		options: {
			sourceMap: true,
			config: {
				path: paths.appPostCssConfig,
			},
		},
	},
];

if (isSassEnabled) {
	happyPackLoaders.push({
		loader: require.resolve('sass-loader'),
		options: {
			sourceMap: true,
			sourceComments: true,
			includePaths: [
				paths.appSrc,
				path.resolve(process.cwd(), 'node_modules/sass-mq/_mq.scss'),
				require('node-bourbon').includePaths,
			],
		},
	});
}

if (!isProduction) {
	happyPackLoaders.unshift({
		loader: require.resolve('style-loader'),
		options: {
			sourceMap: true,
		},
	});
}

const getLoader = () =>
	isProduction
		? ExtractTextPlugin.extract(
				Object.assign(
					{
						fallback: require.resolve('style-loader'),
						loader: require.resolve('happypack/loader'),
					},
					extractTextPluginOptions
				)
			)
		: require.resolve('happypack/loader');

module.exports = function getStylesLoaders(extractTextPluginOptions = {}) {
	return {
		plugin: new HappyPack({
			id: 'styles',
			threads: 3,
			loaders: happyPackLoaders,
		}),
		rule: {
			test: isSassEnabled ? /\.(css|scss)$/ : /\.css$/,
			exclude: /node_modules/,
			include: paths.appSrc,
			loader: getLoader(extractTextPluginOptions),
			options: {
				id: 'styles',
			},
		},
	};
};
