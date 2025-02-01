#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { generateSchema, validateSchema } from './commands';
import { showWelcome } from './utils/welcome';
import { version } from '../package.json';

const program = new Command();

// 显示欢迎信息
showWelcome();

program
  .name('json-sage')
  .description('CLI tool for generating JSON Schema using natural language')
  .version(version);

// 生成 Schema 命令
program
  .command('generate')
  .description('Generate JSON Schema from natural language description')
  .option('-i, --interactive', 'Use interactive mode', false)
  .option('-d, --description <description>', 'Natural language description of the schema')
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --format', 'Format the output JSON', false)
  .action(async (options) => {
    try {
      if (options.interactive || !options.description) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'description',
            message: 'Please describe your data structure:',
            validate: (input) => input.length > 0 || 'Description cannot be empty'
          },
          {
            type: 'confirm',
            name: 'format',
            message: 'Would you like to format the output?',
            default: true
          },
          {
            type: 'input',
            name: 'output',
            message: 'Where would you like to save the schema? (Press enter for stdout)',
            default: ''
          }
        ]);
        options = { ...options, ...answers };
      }

      const spinner = ora('Generating schema...').start();
      const schema = await generateSchema(options.description);
      spinner.succeed('Schema generated successfully!');

      if (options.output) {
        // 保存到文件
        await saveSchema(schema, options.output, options.format);
        console.log(chalk.green(`\nSchema saved to ${options.output}`));
      } else {
        // 输出到控制台
        console.log('\nGenerated Schema:');
        console.log(boxen(
          JSON.stringify(schema, null, options.format ? 2 : 0),
          { padding: 1, borderColor: 'green' }
        ));
      }
    } catch (error) {
      console.error(chalk.red(`\nError: ${error.message}`));
      process.exit(1);
    }
  });

// 验证 Schema 命令
program
  .command('validate')
  .description('Validate an existing JSON Schema')
  .argument('<file>', 'JSON Schema file to validate')
  .action(async (file) => {
    try {
      const spinner = ora('Validating schema...').start();
      const result = await validateSchema(file);
      spinner.succeed('Schema validation completed!');

      if (result.valid) {
        console.log(chalk.green('\nSchema is valid! ✨'));
      } else {
        console.log(chalk.yellow('\nSchema validation failed:'));
        result.errors.forEach((error) => {
          console.log(chalk.red(`- ${error}`));
        });
      }
    } catch (error) {
      console.error(chalk.red(`\nError: ${error.message}`));
      process.exit(1);
    }
  });

// 示例命令
program
  .command('examples')
  .description('Show example usage')
  .action(() => {
    console.log(boxen(
      chalk.cyan(`
Example Usage:

1. Generate schema interactively:
   $ json-sage generate -i

2. Generate schema from description:
   $ json-sage generate -d "Create a product object with name, price and description"

3. Generate and save to file:
   $ json-sage generate -d "User profile with email and age" -o schema.json

4. Validate existing schema:
   $ json-sage validate schema.json
      `),
      { padding: 1, borderColor: 'blue' }
    ));
  });

program.parse();
