const path = require('path');
const HappyPack = require('happypack');
const paths = require('../paths');
const getClientEnvironment = require('../env');

const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const isSassEnabled = env.raw.REACT_APP_SASS;

const loaders = [
	{
		loader: require.resolve('style-loader'),
		options: {
			sourceMap: true,
		},
	},
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
				path: path.resolve(process.cwd(), 'config/postcss.config.js'),
			},
		},
	},
];

if (isSassEnabled) {
	loaders.push({
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

module.exports = function getStylesLoaders() {
	return {
		plugin: new HappyPack({
			id: 'styles',
			threads: 3,
			loaders,
		}),
		rule: {
			test: isSassEnabled ? /\.(css|scss)$/ : /\.css$/,
			exclude: /node_modules/,
			include: paths.appSrc,
			loader: 'happypack/loader?id=styles',
		},
	};
};
