const paths = require('../paths');

module.exports = function getSvgSpriteLoader() {
	return {
		test: /\.svg$/,
		exclude: /node_modules/,
		include: paths.appSrc,
		use: [
			{
				loader: require.resolve('svg-sprite-loader'),
				options: {
					name: '[name]_[hash]',
					esModule: true,
				},
			},
			{
				loader: require.resolve('svgo-loader'),
				options: {
					plugins: [
						{ removeTitle: true },
						{ removeDimensions: true },
						{ removeUnknownsAndDefaults: true },
						{ removeUselessStrokeAndFill: true },
						{ convertColors: { shorthex: false } },
						{ convertPathData: false },
					],
				},
			},
		],
	};
};
