const getClientEnvironment = require('../env');

const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const isSassEnabled = env.raw.REACT_APP_CSS_MODULES;
const isDev = env.raw.NODE_ENV === 'development';

const plugins = [
	'lodash',
	'transform-react-jsx',
	'transform-react-constant-elements',
	'syntax-dynamic-import',
];

module.exports = function getBabelPlugins() {
	if (isDev) {
		plugins.push('react-hot-loader/babel');
	}

	if (isSassEnabled) {
		const reactCssModules = [
			'react-css-modules',
			{
				context: process.cwd(),
				webpackHotModuleReloading: true,
				filetypes: { '.scss': { syntax: 'postcss-scss' } },
				generateScopedName: '[name]__[local]___[hash:base64:5]',
				exclude: 'node_modules',
			},
		];
		plugins.push(reactCssModules);
	}

	return plugins;
};
