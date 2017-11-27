const chalk = require('chalk');
const argv = require('yargs').argv;
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

process.env.NODE_ENV = 'codegeneration';
const getClientEnvironment = require('../config/env');
const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const url = env.raw.REACT_APP_GRAPHQL_SERVER_URL;

const binPath = path.resolve(
	process.cwd(),
	'node_modules',
	'react-scripts',
	'node_modules',
	'.bin'
);
process.env.PATH += path.delimiter + binPath;

if (!url) {
	console.error(chalk.red('--url argument is required!'));
	console.log(
		'Please enter url of GraphQL server endpoint to fetch the introspection from.'
	);
	console.log();

	process.exit(0);
}

let { token, apiOutput, schemaOutput, typesOutput } = argv;

apiOutput = apiOutput || './src/types/api.ts';
schemaOutput = schemaOutput || './.temp/gql-schema.json';
typesOutput = typesOutput || './src/types/gql.ts';

const header = token ? ` --header 'x-auth-token: ${token}'` : '';

const commands = {
	genApiTypes: `gql-gen --url ${url}${header} --template typescript --out ${apiOutput} **/*.gql`,
	genGqlSchema: `apollo-codegen introspect-schema ${url} ${header} --output ${schemaOutput}`,
	genGqlTypes: `apollo-codegen generate **/*.gql --schema ${schemaOutput} --target typescript --output ${typesOutput}`,
};

Promise.all([
	exec(commands.genGqlSchema).then(() => exec(commands.genGqlTypes)),
	exec(commands.genApiTypes),
])
	.then(() => {
		console.log();
		console.log(chalk.green('Succefully generated:'));
		console.log();
		console.log(' - GraphQl schema in ', schemaOutput);
		console.log(' - API types in ', apiOutput);
		console.log(' - GraphQl types in ', typesOutput);
		console.log();
	})
	.catch(e => {
		console.log();
		console.error(
			chalk.red('GraphQL codegeneration failed in command: '),
			e.cmd
		);
		console.log();
		console.error(chalk.red(e.stderr || e.stdout));
	});
