import chalk from 'chalk';
import boxen from 'boxen';
import { version } from '../../package.json';

export function showWelcome() {
    const message = chalk.cyan(`
JsonSageAI CLI v${version}
Generate JSON Schema using natural language

Type ${chalk.green('json-sage --help')} to see available commands
    `);

    console.log(
        boxen(message, {
            padding: 1,
            margin: 1,
            borderColor: 'blue',
            borderStyle: 'round'
        })
    );
}
