// No need to build the DLL in production
if (process.env.NODE_ENV === 'production') {
	process.exit(0);
}

const webpack = require('webpack');
const chalk = require('chalk');
const config = require('../config/webpack.config.dll');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

function build() {
	console.log('Creating dlls...');

	let compiler = webpack(config);
	return new Promise((resolve, reject) => {
		compiler.run((err, stats) => {
			if (err) {
				return reject(err);
			}
			const messages = formatWebpackMessages(stats.toJson({}, true));
			if (messages.errors.length) {
				// Only keep the first error. Others are often indicative
				// of the same problem, but confuse the reader with noise.
				if (messages.errors.length > 1) {
					messages.errors.length = 1;
				}
				return reject(new Error(messages.errors.join('\n\n')));
			}
			return resolve({
				stats,
				warnings: messages.warnings,
			});
		});
	});
}

build().then(({ stats, warnings }) => {
	if (warnings.length) {
		console.log(chalk.yellow('DLLS compiled with warnings.\n'));
		console.log(warnings.join('\n\n'));
	} else {
		console.log(chalk.green('DLLS compiled successfully.\n'));
	}
});
