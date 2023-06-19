import { platform, arch } from 'os';
import { getInput, getBooleanInput } from '@actions/core';

export const osPlat: string = platform();
export const osArch: string = arch();

export const inputs = {
  version: getInput('version') || 'latest',
  args: getInput('args'),
  cwd: getInput('cwd') || '.',
  installOnly: getBooleanInput('install-only'),
};
