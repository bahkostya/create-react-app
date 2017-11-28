const getClientEnvironment = require('../env');

const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const isSassEnabled = env.raw.REACT_APP_CSS_MODULES;

module.exports = function getCssModulesOptions() {
	if (!isSassEnabled) {
		return [
			'lodash',
			'transform-react-jsx',
			'transform-react-constant-elements',
			'syntax-dynamic-import',
		];
	}

	return [
		'lodash',
		'transform-react-jsx',
		'transform-react-constant-elements',
		'syntax-dynamic-import',
		[
			'react-css-modules',
			{
				context: process.cwd(),
				webpackHotModuleReloading: true,
				filetypes: { '.scss': { syntax: 'postcss-scss' } },
				generateScopedName: '[name]__[local]___[hash:base64:5]',
				exclude: 'node_modules',
			},
		],
	];
};
