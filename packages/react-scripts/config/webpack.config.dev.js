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
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const paths = require('./paths');
const baseWebpackConfig = require('./webpack.config.base');

const pkg = require(paths.appPackageJson);
const dllPlugin = pkg.dllPlugin;

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/';
// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
const configuration = {
	// You may want 'eval' instead if you prefer to see the compiled output in DevTools.
	// See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
	devtool: 'cheap-module-source-map',
	// These are the "entry points" to our application.
	// This means they will be the "root" imports that are included in JS bundle.
	// The first two entry points enable "hot" CSS and auto-refreshes for JS.
	entry: [
		'react-hot-loader/patch',
		// Include an alternative client for WebpackDevServer. A client's job is to
		// connect to WebpackDevServer by a socket and get notified about changes.
		// When you save a file, the client will either apply hot updates (in case
		// of CSS changes), or refresh the page (in case of JS changes). When you
		// make a syntax error, this client will display a syntax error overlay.
		// Note: instead of the default WebpackDevServer client, we use a custom one
		// to bring better experience for Create React App users. You can replace
		// the line below with these two lines if you prefer the stock client:
		// require.resolve('webpack-dev-server/client') + '?/',
		// require.resolve('webpack/hot/dev-server'),
		require.resolve('react-dev-utils/webpackHotDevClient'),
		// Finally, this is your app's code:
		paths.appIndexJs,
		// We include the app code last so that if there is a runtime error during
		// initialization, it doesn't blow up the WebpackDevServer client, and
		// changing JS code would still trigger a refresh.
	],
	output: {
		// This does not produce a real file. It's just the virtual path that is
		// served by WebpackDevServer in development. This is the JS bundle
		// containing code from all our entry points, and the Webpack runtime.
		filename: 'static/js/bundle.js',
		// This is the URL that app is served from. We use "/" in development.
		publicPath: publicPath,
		// Point sourcemap entries to original disk location (format as URL on Windows)
		devtoolModuleFilenameTemplate: info =>
			path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
	},
	module: {
		rules: [],
	},
	plugins: [
		// Generates an `index.html` file with the <script> injected.
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appHtml,
		}),
		// Add module names to factory functions so they appear in browser profiler.
		new webpack.NamedModulesPlugin(),
		// This is necessary to emit hot updates (currently CSS only):
		new webpack.HotModuleReplacementPlugin(),
		// Watcher doesn't work well if you mistype casing in a path so we use
		// a plugin that prints an error when you attempt to do this.
		// See https://github.com/facebookincubator/create-react-app/issues/240
		new CaseSensitivePathsPlugin(),
		// If you require a missing module and then `npm install` it, you still have
		// to restart the development server for Webpack to discover it. This plugin
		// makes the discovery automatic so you don't have to restart.
		// See https://github.com/facebookincubator/create-react-app/issues/186
		new WatchMissingNodeModulesPlugin(paths.appNodeModules),
		// Moment.js is an extremely popular library that bundles large locale files
		// by default due to how Webpack interprets its code. This is a practical
		// solution that requires the user to opt into importing specific locales.
		// https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
		// You can remove this if you don't use Moment.js:
		// new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
	],
	// Turn off performance hints during development because we don't do any
	// splitting or minification in interest of speed. These warnings become
	// cumbersome.
	performance: {
		hints: false,
	},
};

if (dllPlugin) {
	const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
	const dllsPath = path.join(process.cwd(), dllPlugin.path);

	// create dlls from dependencies
	const dllReferencePlugin = new webpack.DllReferencePlugin({
		context: process.cwd(),
		manifest: require(path.join(dllsPath, 'libs-manifest.json')),
	});

	// plugin for adding scripts with dll to html file
	const assetsPlugin = new HtmlWebpackIncludeAssetsPlugin({
		assets: ['libs.js'],
		append: false,
	});

	configuration.plugins.push(dllReferencePlugin, assetsPlugin);
}

module.exports = webpackMerge.smart(baseWebpackConfig, configuration);
