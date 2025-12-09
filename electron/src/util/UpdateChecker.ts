import { app, dialog } from 'electron';
import { spawn } from 'node:child_process';
import path from 'node:path';
import type { CoreLogChannel } from '@grandlinex/e-kernel';
import fs from 'node:fs';
import downStream from './downloader';
import { axiosGet } from './routedRequest';

/* eslint-disable no-console */

export function VersionMatcher(
  oldVersion: string,
  newVersion: string
): boolean {
  const versionRegex = /^\d+.\d+.\d+$/;

  // Validate both version strings
  if (!versionRegex.test(oldVersion) || !versionRegex.test(newVersion)) {
    return false;
  }

  const oldParts = oldVersion.split('.').map(Number);
  const newParts = newVersion.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const oldNum = oldParts[i];
    const newNum = newParts[i];

    if (newNum > oldNum) return true;
    if (newNum < oldNum) return false;
  }

  return false; // Versions are equal
}

export async function getLatestVeresion() {
  const latestRelease = await axiosGet(
    'https://api.github.com/repos/Kamiikaze/AdvS-Client/releases/latest'
  );

  if (!latestRelease || !latestRelease.data) {
    console.error('Failed to fetch latest release information');
    return null;
  }

  return latestRelease.data.tag_name;
}

export default async function checkUpdate(
  logger: CoreLogChannel,
  currentVersion: string,
  downloadPath: string,
  fileName: string
) {
  const latestRelease = await axiosGet(
    'https://api.github.com/repos/Kamiikaze/AdvS-Client/releases/latest'
  );

  if (!latestRelease || !latestRelease.data) {
    logger.error('Failed to fetch latest release information');
    return false;
  }

  logger.log('latestRelease', JSON.stringify(latestRelease.data.tag_name));

  const isNewVersionAvailable = VersionMatcher(
    currentVersion,
    latestRelease.data.tag_name
  );

  if (!isNewVersionAvailable) {
    logger.log('No new version available');
    return false;
  }

  const confirm = await dialog.showMessageBox({
    title: 'Update verfügbar',
    type: 'info',
    buttons: ['Jetzt Aktualisieren', 'Überspringen'],
    defaultId: 0,
    message: `Eine neue Version ist verfügbar
    Aktuell: ${currentVersion}
    Neueste: ${latestRelease.data.tag_name}`,
  });

  if (confirm.response === 0) {
    const releasesDownloadUrl = new URL(
      latestRelease.data.assets[0].browser_download_url
    );

    try {
      const oldInstaller = fs.existsSync(path.join(downloadPath, fileName));
      if (oldInstaller) {
        fs.unlinkSync(path.join(downloadPath, fileName));
      }
    } catch (error) {
      logger.error(
        'No old updater found or failed to delete old download file:',
        error
      );
    }

    logger.log('Download URL:', releasesDownloadUrl.toString());

    const setupFile = await downStream(
      releasesDownloadUrl.toString(),
      {
        Accept: 'application/octet-stream',
      },
      downloadPath,
      fileName
    );

    logger.log('Downloaded setup file', setupFile);

    if (!setupFile) {
      app.quit();
      process.exit(0);
    }

    const setupFilePath = path.join(downloadPath, fileName);

    logger.log('Updating', setupFilePath);

    const child = spawn(setupFilePath, [], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    app.quit();
    process.exit(0);
  }
  return false;
}
