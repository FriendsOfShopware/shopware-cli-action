import { existsSync } from 'fs';
import { dirname } from 'path';
import yargs from 'yargs';
import {
  info, addPath, debug, setFailed, group, setOutput,
} from '@actions/core';
import { exec } from '@actions/exec';
import { inputs } from './context';
import {
  getArtifacts, getDistPath, getMetadata, install,
} from './releaser';

async function run() {
  try {
    const bin = await install(inputs.version);
    info(`shopware-cli ${inputs.version} installed successfully`);

    if (inputs.installOnly) {
      const releaser = dirname(bin);
      addPath(releaser);
      debug(`Added ${releaser} to PATH`);
      return;
    } if (!inputs.args) {
      setFailed('args input required');
      return;
    }

    if (inputs.cwd && inputs.cwd !== '.') {
      info(`Using ${inputs.cwd} as working directory`);
      process.chdir(inputs.cwd);
    }

    let yamlFile: string | unknown;
    const argv: { config: string } = yargs.parse(inputs.args) as never;
    if (argv.config) {
      yamlFile = argv.config;
    } else {
      ['.shopware-cli.yaml', '.shopware-cli.yml', 'shopware-cli.yaml', 'shopware-cli.yml'].forEach((f) => {
        if (existsSync(f)) {
          yamlFile = f;
        }
      });
    }

    await exec(`${bin} ${inputs.args}`);

    if (typeof yamlFile === 'string') {
      const artifacts = await getArtifacts(await getDistPath(yamlFile));
      if (artifacts) {
        await group('Artifacts output', async () => {
          info(artifacts);
          setOutput('artifacts', artifacts);
        });
      }
      const metadata = await getMetadata(await getDistPath(yamlFile));
      if (metadata) {
        await group('Metadata output', async () => {
          info(metadata);
          setOutput('metadata', metadata);
        });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    }

    setFailed('Error is not an instance of Error');
  }
}

run();
