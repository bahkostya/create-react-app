const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPack = require('happypack');
const paths = require('../paths');
const getClientEnvironment = require('../env');

const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const isSassEnabled = env.raw.REACT_APP_SASS;
const isProduction = env.raw.NODE_ENV === 'production';

const styleLoaders = [
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

module.exports = function getStylesLoaders() {
	if (isSassEnabled) {
		styleLoaders.push({
			loader: require.resolve('sass-loader'),
			options: {
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
		});
	}

	if (!isProduction) {
		styleLoaders.unshift({
			loader: require.resolve('style-loader'),
			options: {
				sourceMap: true,
			},
		});
	}

	return styleLoaders;
};
