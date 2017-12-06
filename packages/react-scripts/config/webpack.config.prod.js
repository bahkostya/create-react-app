// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const { existsSync } = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');
const baseWebpackConfig = require('./webpack.config.base');
const getStylesLoaders = require('./webpack-options/getStylesLoaders');

const BabelMinifyPlugin = require('babel-minify-webpack-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
	.BundleAnalyzerPlugin;

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath;
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = publicPath === './';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1);
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
	throw new Error('Production builds must have NODE_ENV=production.');
}

// Note: defined here because it will be used more than once.
const cssFilename = 'static/css/[name]__[local]___[hash:base64:5].css';

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.
// To have this structure working with relative paths, we have to use custom options.
const extractTextPluginOptions = shouldUseRelativeAssetPaths
	? // Making sure that the publicPath goes back to to build folder.
		{ publicPath: Array(cssFilename.split('/').length).join('../') }
	: {};
const styleLoaders = getStylesLoaders();
const isSassEnabled = env.raw.REACT_APP_SASS;
// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
const configuration = {
	// Don't attempt to continue if there are any errors.
	bail: true,
	// We generate sourcemaps in production. This is slow but gives good results.
	// You can exclude the *.map files from the build during deployment.
	devtool: 'source-map',
	// In production, we only want to load the polyfills and the app code.
	entry: [paths.appIndexJs],
	output: {
		// The build folder.
		path: paths.appBuild,
		// Generated JS file names (with nested folders).
		// There will be one main bundle, and one file per asynchronous chunk.
		// We don't currently advertise code splitting but Webpack supports it.
		filename: 'static/js/[name].[chunkhash:8].js',
		// We inferred the "public path" (such as / or /my-project) from homepage.
		publicPath: publicPath,
		// Point sourcemap entries to original disk location (format as URL on Windows)
		devtoolModuleFilenameTemplate: info =>
			path
				.relative(paths.appSrc, info.absoluteResourcePath)
				.replace(/\\/g, '/'),
	},
	module: {
		rules: [
			// rules for styles
			{
				test: isSassEnabled ? /\.(css|scss)$/ : /\.css$/,
				exclude: /node_modules/,
				include: paths.appSrc,
				loader: ExtractTextPlugin.extract(
					Object.assign(
						{
							fallback: require.resolve('style-loader'),
							use: styleLoaders,
						},
						extractTextPluginOptions
					)
				),
			},
		],
	},
	plugins: [
		// Generates an `index.html` file with the <script> injected.
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appHtml,
			// chunksSortMode: (a, b) => {
			// 	const order = deferOrderedScripts;
			// 	return order.indexOf(a.names[0]) - order.indexOf(b.names[0]);
			// },
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			},
		}),
		// Minify the code.
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
				// Disabled because of an issue with Uglify breaking seemingly valid code:
				// https://github.com/facebookincubator/create-react-app/issues/2376
				// Pending further investigation:
				// https://github.com/mishoo/UglifyJS2/issues/2011
				screw_ie8: true,
				conditionals: true,
				unused: true,
				comparisons: true,
				sequences: true,
				dead_code: true,
				pure_getters: true,
				evaluate: true,
				if_return: true,
				join_vars: true,
				negate_iife: false,
				drop_debugger: true,
				drop_console: false,
				booleans: true,
			},
			mangle: {
				safari10: true,
				screw_ie8: true,
				keep_fnames: true,
			},
			output: {
				comments: false,
				// Turned on because emoji and regex is not minified properly using default
				// https://github.com/facebookincubator/create-react-app/issues/2488
				ascii_only: true,
			},
			sourceMap: true,
			exclude: [/\.min\.js$/gi],
		}),
		new BabelMinifyPlugin(),
		new OptimizeCssAssetsPlugin({
			cssProcessorOptions: { discardComments: { removeAll: true } },
			canPrint: false,
		}),
		new webpack.LoaderOptionsPlugin({
			debug: false,
			// Need false for correct  work of BabelMinifyPlugin
			minify: false,
		}),
		new WebpackAssetsManifest({
			writeToDisk: true,
			customize: (key, value, originalValue, manifest) => {
				let [name, hash, ext, map] = value.split('.');
				if (map) {
					ext = ext + '.' + map;
				}
				const resultKey = `${name}.${ext}`;
				const resultValue = `${resultKey}?v=${hash}`;
				return {
					key,
					value: resultValue,
				};
			},
		}),
		// Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
		new ExtractTextPlugin({
			filename: cssFilename,
			allChunks: true,
		}),
		// Moment.js is an extremely popular library that bundles large locale files
		// by default due to how Webpack interprets its code. This is a practical
		// solution that requires the user to opt into importing specific locales.
		// https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
		// You can remove this if you don't use Moment.js:
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

		new BundleAnalyzerPlugin({
			// Can be `server`, `static` or `disabled`.
			// In `server` mode analyzer will start HTTP server to show bundle report.
			// In `static` mode single HTML file with bundle report will be generated.
			// In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
			analyzerMode: 'server',
			// Host that will be used in `server` mode to start HTTP server.
			analyzerHost: '127.0.0.1',
			// Port that will be used in `server` mode to start HTTP server.
			analyzerPort: 7777,
			// Path to bundle report file that will be generated in `static` mode.
			// Relative to bundles output directory.
			reportFilename: 'report.html',
			// Module sizes to show in report by default.
			// Should be one of `stat`, `parsed` or `gzip`.
			// See "Definitions" section for more information.
			defaultSizes: 'parsed',
			// Automatically open report in default browser
			openAnalyzer: true,
			// If `true`, Webpack Stats JSON file will be generated in bundles output directory
			generateStatsFile: true,
			// Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
			// Relative to bundles output directory.
			statsFilename: 'stats.json',
			// Options for `stats.toJson()` method.
			// For example you can exclude sources of your modules from stats file with `source: false` option.
			// See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
			statsOptions: null,
			// Log level. Can be 'info', 'warn', 'error' or 'silent'.
			logLevel: 'info',
		}),
	],
	// Some libraries import Node modules but don't use them in the browser.
	// Tell Webpack to provide empty mocks for them so importing them works.
	node: {
		dgram: 'empty',
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
		child_process: 'empty',
	},
};

let config = webpackMerge.smart(baseWebpackConfig, configuration);

if (existsSync(paths.appOptionalWebpackProdConfig)) {
	config = webpackMerge.smart(
		baseWebpackConfig,
		configuration,
		require(paths.appOptionalWebpackProdConfig)
	);
}

module.exports = config;
