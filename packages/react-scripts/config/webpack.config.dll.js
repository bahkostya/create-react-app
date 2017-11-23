const { join } = require('path');
const webpack = require('webpack');
const paths = require('./paths');
const pkg = require(paths.appPackageJson);
const dllPlugin = pkg.dllPlugin;

if (!dllPlugin) {
	process.exit(0);
}

const outputPath = join(process.cwd(), dllPlugin.path);

const excludedDeps = dllPlugin.exclude;

const libs = Object.keys(pkg.dependencies).filter(
	depName => !excludedDeps.includes(depName)
);

module.exports = {
	context: process.cwd(),
	entry: { libs },
	devtool: 'eval',
	output: {
		filename: '[name].js',
		path: outputPath,
		library: '[name]',
	},
	plugins: [
		new webpack.DllPlugin({
			name: '[name]',
			path: join(outputPath, '[name]-manifest.json'),
		}),
	],
	performance: {
		hints: false,
	},
};
