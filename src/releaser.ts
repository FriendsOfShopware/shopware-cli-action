import { existsSync, readFileSync, renameSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { info, debug } from '@actions/core';
import {
  extractZip, extractTar, downloadTool, cacheDir,
} from '@actions/tool-cache';
import { osArch, osPlat } from './context';

import { getRelease } from './github';

function getFilename() {
  let arch: string;
  switch (osArch) {
    case 'x64': {
      arch = 'x86_64';
      break;
    }
    case 'x32': {
      arch = 'i386';
      break;
    }
    case 'arm': {
      const { arm_version: armVersion } = process.config.variables as { arm_version?: string };
      arch = armVersion ? `armv${armVersion}` : 'arm';
      break;
    }
    default: {
      arch = osArch;
      break;
    }
  }
  if (osPlat === 'darwin') {
    arch = 'all';
  }

  switch (osPlat) {
    case 'win32': {
      return `shopware-cli_Windows_${arch}.zip`;
    }
    case 'darwin': {
      return `shopware-cli_Darwin_${arch}.tar.gz`;
    }
    default: {
      return `shopware-cli_Linux_${arch}.tar.gz`;
    }
  }
}

async function extractArchive(path: string): Promise<string> {
  if (osPlat === 'win32') {
    if (!path.endsWith('.zip')) {
      const newPath = `${path}.zip`;
      renameSync(path, newPath);
      return extractZip(newPath);
    }
    return extractZip(path);
  }
  return extractTar(path);
}

export async function install(version: string) {
  const release = await getRelease(version);

  if (release.prerelease) {
    debug(`Release ${version} is a pre-release`);
  }

  const filename = getFilename();
  const downloadUrl = release.assets.find((asset) => asset.name === filename)?.browser_download_url;

  if (!downloadUrl) {
    throw new Error(`No asset found with the filename: ${filename}`);
  }

  info(`Downloading ${downloadUrl}`);
  const downloadPath = await downloadTool(downloadUrl);
  debug(`Downloaded to ${downloadPath}`);

  info('Extracting shopware-cli');
  const extPath = await extractArchive(downloadPath);
  debug(`Extracted to ${extPath}`);

  const cachePath = await cacheDir(
    extPath,
    'shopware-cli-action',
    release.tag_name.replace(/^v/, ''),
  );
  debug(`Cached to ${cachePath}`);

  const exePath = join(
    cachePath,
    `shopware-cli${osPlat === 'win32' ? '.exe' : ''}`,
  );
  debug(`Exe path is ${exePath}`);

  return exePath;
}

export async function getDistPath(yamlFile: string): Promise<string> {
  const cfg = yaml.load(readFileSync(yamlFile, 'utf8')) as { dist?: string };
  return cfg.dist || 'dist';
}

export async function getArtifacts(
  distPath: string,
): Promise<string | undefined> {
  const artifactsFile = join(distPath, 'artifacts.json');

  if (!existsSync(artifactsFile)) {
    return undefined;
  }

  const content = readFileSync(artifactsFile, { encoding: 'utf-8' }).trim();
  if (content === 'null') {
    return undefined;
  }

  return content;
}

export async function getMetadata(
  distPath: string,
): Promise<string | undefined> {
  const metadataFile = join(distPath, 'metadata.json');

  if (!existsSync(metadataFile)) {
    return undefined;
  }

  const content = readFileSync(metadataFile, { encoding: 'utf-8' }).trim();
  if (content === 'null') {
    return undefined;
  }

  return content;
}
