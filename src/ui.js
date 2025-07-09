import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import { t } from './i18n.js';
import { COMMIT_TYPES } from './config.js';

export function printTitle() {
  const asciiTitle = figlet.textSync(t('mainTitle'), {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    whitespaceBreak: true,
  });
  console.log(asciiTitle);
  console.log(chalk.blue(`\n${t('exitMessage')}\n`));
}

export function validateMessage(msg, config) {
  const subject = msg.trim();

  if (subject.length > config.maxSubjectLength) {
    console.log(
      chalk.red(
        t('subjectTooLong', {
          maxLength: config.maxSubjectLength,
          length: subject.length,
        })
      )
    );
    return false;
  }

  const commitType = COMMIT_TYPES.map((type) => type.name).find(
    (type) => type === subject.split(':')[0].trim()
  );

  const commitRegex = new RegExp(`^${commitType}(?:\\([^)]+\\))?:\\s+.+`);

  if (!commitRegex.test(subject)) {
    console.log(chalk.red(t('invalidFormat')));
    return false;
  }

  return true;
}

export async function selectFilesToStage(modifiedFiles) {
    if (modifiedFiles.length === 1) {
      console.log(chalk.blue(t('fileModified', { file: modifiedFiles[0] })));
      return modifiedFiles;
    }
  
    console.log(
      chalk.blue(
        t('filesModified', {
          count: modifiedFiles.length,
          files: modifiedFiles.join('\n'),
        })
      )
    );
  
    const { selectedFiles } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedFiles',
        message: t('selectFiles'),
        choices: modifiedFiles.map((file) => ({
          name: file,
          checked: true,
        })),
      },
    ]);
  
    return selectedFiles;
  }
  
  export async function confirmReview() {
    const { wantReview } = await inquirer.prompt({
      type: 'confirm',
      name: 'wantReview',
      message: t('askForReview'),
      default: true,
    });
    return wantReview;
  }
  
  export async function confirmProceed(scoreValue) {
    console.log(chalk.red(t('reviewScoreLow', { score: scoreValue })));
    const { proceedAnyway } = await inquirer.prompt({
      type: 'confirm',
      name: 'proceedAnyway',
      message: t('proceedAnyway'),
      default: false,
    });
    return proceedAnyway;
  }
  
  export async function getEditedCommitMessage(commitMessage, config) {
    console.log(chalk.blue(t('modifyingCommitMessage')));
    const { commitType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'commitType',
        message: t('selectCommitType'),
        default: config.defaultCommitType,
        validate: (input) =>
          COMMIT_TYPES.some((type) => type.name === input) || t('invalidCommitType'),
        choices: COMMIT_TYPES.map((type) => ({
          name: `${type.name.padEnd(8)} - ${type.description}`,
          value: type.name,
        })),
      },
    ]);
    const { newMessage } = await inquirer.prompt({
      type: 'input',
      name: 'newMessage',
      message: t('newCommitMessage'),
      default: commitMessage.split(':')[1]?.trim() || '',
    });
    return `${commitType}: ${newMessage}`;
  }
  
  export async function confirmCommit(commitMessage, isProposed) {
    console.log(
      chalk.green(
        isProposed ? t('proposedCommitPreview') : t('modifiedCommitPreview')
      )
    );
    console.log(chalk.cyan(t('commitPreviewLine')));
    console.log(chalk.cyan(commitMessage));
    console.log(chalk.cyan(t('commitPreviewLine')));
  
    const { confirmCommit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmCommit',
        message: t('confirmCommit'),
        default: true,
      },
    ]);
    return confirmCommit;
  }
  
  export async function confirmPush() {
    console.log(chalk.blue(`\n${t('readyToPush')}`));
    const { confirmPush } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmPush',
        message: t('confirmPush'),
        default: true,
      },
    ]);
    return confirmPush;
  }
  
  export function printMessage(msg, color = 'yellow') {
    console.log(chalk[color](msg));
  }
  
  export function printError(msg) {
    console.error(chalk.red(msg));
  }
