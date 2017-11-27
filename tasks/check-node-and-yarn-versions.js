const { execSync } = require('child_process');
const chalk = require('chalk');

try {
  const nodeVersionString = execSync('node --version');
  const nodeVersion = /(\d+)[.]/.exec(nodeVersionString);

  if (Number(nodeVersion[1]) < 8) {
    console.error(
      '\n',
      chalk.red('Node.js version >= 8.0.0 is required.'),
      'Current version is',
      nodeVersionString.toString()
    );
    process.exit(1);
  }

  const yarnVersionString = execSync('yarnpkg --version');
  const yarnVersion = /^(\d+)[.]/.exec(yarnVersionString);

  if (Number(yarnVersion[1]) < 1) {
    console.error(
      '\n',
      chalk.red('Yarn version >= 1.0.0 is required.'),
      'Current version is',
      yarnVersionString.toString()
    );
    process.exit(1);
  }
} catch (e) {
  console.log(e);
}
