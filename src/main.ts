import { dirname } from 'path';
import {
  info, addPath, debug, setFailed,
} from '@actions/core';
import { inputs } from './context';
import {
  install,
} from './releaser';

async function run() {
  try {
    const bin = await install(inputs.version);
    info(`shopware-cli ${inputs.version} installed successfully`);

    const releaser = dirname(bin);
    addPath(releaser);
    debug(`Added ${releaser} to PATH`);
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    }

    setFailed('Error is not an instance of Error');
  }
}

run();
