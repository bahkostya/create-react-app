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
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HappyPack = require('happypack');
const happyPackThreadPool = HappyPack.ThreadPool({ size: 5 });
const CircularDependencyPlugin = require('circular-dependency-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');

const getBabelPlugins = require('./webpack-options/getBabelPlugins');

// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = '';
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);
// This is the base configuration.
const configuration = {
	// These are the "entry points" to our application.
	// This means they will be the "root" imports that are included in JS bundle.
	// The first two entry points enable "hot" CSS and auto-refreshes for JS.
	entry: [
		// We ship a few polyfills by default:
		require.resolve('./polyfills'),
	],
	output: {
		// Add /* filename */ comments to generated require()s in the output.
		pathinfo: true,
		// There are also additional JS chunk files if you use code splitting.
		chunkFilename: '[name].[chunkHash:8].chunk.js',
	},
	resolve: {
		// This allows you to set a fallback for where Webpack should look for modules.
		// We placed these paths second because we want `node_modules` to "win"
		// if there are any conflicts. This matches Node resolution mechanism.
		// https://github.com/facebookincubator/create-react-app/issues/253
		modules: ['node_modules', paths.appNodeModules, paths.appSrc].concat(
			// It is guaranteed to exist because we tweak it in `env.js`
			process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
		),
		// These are the reasonable defaults supported by the Node ecosystem.
		// We also include JSX as a common component filename extension to support
		// some tools, although we do not recommend using it, see:
		// https://github.com/facebookincubator/create-react-app/issues/290
		// `web` extension prefixes have been added for better support
		// for React Native Web.
		extensions: [
			'.mjs',
			'.js',
			'.json',
			'.jsx',
			'.ts',
			'.tsx',
			'.d.ts',
			'.scss',
			'.css',
			'.svg',
			'.gql',
		],
		alias: {
			// @remove-on-eject-begin
			// Resolve Babel runtime relative to react-scripts.
			// It usually still works on npm 3 without this but it would be
			// unfortunate to rely on, as react-scripts could be symlinked,
			// and thus babel-runtime might not be resolvable from the source.
			'babel-runtime': path.dirname(
				require.resolve('babel-runtime/package.json')
			),
			// @remove-on-eject-end
			// Support React Native Web
			// https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
			'react-native': 'react-native-web',
		},
		plugins: [
			// Prevents users from importing files from outside of src/ (or node_modules/).
			// This often causes confusion because we only process files within src/ with babel.
			// To fix this, we prevent you from importing files out of src/ -- if you'd like to,
			// please link the files into your node_modules/ and let module-resolution kick in.
			// Make sure your source files are compiled, as they will not be processed in any way.
			new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
		],
	},
	module: {
		strictExportPresence: true,
		rules: [
			// TODO: Disable require.ensure as it's not a standard language feature.
			// We are waiting for https://github.com/facebookincubator/create-react-app/issues/2176.
			// { parser: { requireEnsure: false } },

			{
				test: /\.(ts|tsx)$/,
				include: paths.appSrc,
				loader: require.resolve('happypack/loader'),
				options: {
					id: 'ts-and-babel',
				},
			},
			// "url" loader works like "file" loader except that it embeds assets
			// smaller than specified limit in bytes as data URLs to avoid requests.
			// A missing `test` is equivalent to a match.
			{
				test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
				loader: require.resolve('url-loader'),
				options: {
					limit: 10000,
					name: '[name].[hash:8].[ext]',
				},
			},
			// Process JS with Babel.
			{
				test: /\.(js|jsx|mjs)$/,
				include: paths.appSrc,
				loader: require.resolve('babel-loader'),
				options: {
					// @remove-on-eject-begin
					babelrc: false,
					presets: [require.resolve('babel-preset-react-app')],
					// @remove-on-eject-end
					// This is a feature of `babel-loader` for webpack (not Babel itself).
					// It enables caching results in ./node_modules/.cache/babel-loader/
					// directory for faster rebuilds.
					cacheDirectory: true,
				},
			},
		],
	},
	plugins: [
		// Makes some environment variables available in index.html.
		// The public URL is available as %PUBLIC_URL% in index.html, e.g.:
		// <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
		// In development, this will be an empty string.
		new InterpolateHtmlPlugin(env.raw),
		// Makes some environment variables available to the JS code, for example:
		// if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
		new webpack.DefinePlugin(env.stringified),

		//////////////////////
		// Our own plugins: //
		//////////////////////
		new webpack.NoEmitOnErrorsPlugin(),

		// ForkTsCheckerWebpackPlugin - plugin to run tslint in additional thread
		new ForkTsCheckerWebpackPlugin({
			tslint: paths.appTsLintConfig,
			tsconfig: paths.appTsConfig,
			watch: paths.appSrc,
			// don't use workers more than 1, baceuse it breaks tslint
			workers: ForkTsCheckerWebpackPlugin.ONE_CPU,
			checkSyntacticErrors: true,
			memoryLimit: 2048,
			ignoreDiagnostics: [
				2307, // Cannot find module (hmr issue)
				2688, // Cannot find type definition file for (node)
			],
		}),
		// plugin for running loaders in several threads
		new HappyPack({
			id: 'ts-and-babel',
			threadPool: happyPackThreadPool,
			loaders: [
				{
					loader: require.resolve('babel-loader'),
					query: {
						cacheDirectory: true,
						plugins: getBabelPlugins(),
					},
				},
				{
					loader: require.resolve('ts-loader'),
					query: {
						happyPackMode: true,
						transpileOnly: true,
						configFile: paths.appTsConfig,
						colors: true,
					},
				},
			],
		}),

		new CircularDependencyPlugin({
			// exclude detection of files based on a RegExp
			exclude: /a\.js|node_modules/,
			// add errors to webpack instead of warnings
			failOnError: true,
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

const isSvgSpriteEnabled = env.raw.REACT_APP_SVG_SPRITE;
if (isSvgSpriteEnabled) {
	const getSvgSpriteLoader = require('./webpack-options/getSvgSpriteLoader');
	configuration.module.rules.push(getSvgSpriteLoader());
}

const isGraphqlLoaderEnabled = env.raw.REACT_APP_GRAPHQL;
if (isGraphqlLoaderEnabled) {
	const graphQlLoader = {
		test: /\.(graphql|gql)$/,
		exclude: /node_modules/,
		loader: env.raw.REACT_APP_GRAPHQL,
	};

	configuration.module.rules.push(graphQlLoader);
}

const isPngSpriteEnabled = env.raw.REACT_APP_PNG_SPRITE;
if (isPngSpriteEnabled) {
	const pngSpritePlugin = new SpritesmithPlugin({
		src: {
			cwd: path.resolve(paths.appSrc, 'assets/sprite'),
			glob: '*.png',
		},
		target: {
			image: path.resolve(paths.appSrc, 'assets/sprite.png'),
			css: path.resolve(paths.appSrc, 'styles/sprite.scss'),
		},
		apiOptions: {
			cssImageRef: 'assets/sprite.png',
		},
	});

	configuration.plugins.push(pngSpritePlugin);
}

module.exports = configuration;
