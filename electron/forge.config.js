/* eslint-disable */
const os = require('os');

let icon;
// Overwrite with own img path like: res/img/[fav]icon.*

switch (os.platform()) {
  case 'linux': // need a *.png img
    icon = 'res/img/icon.png';
    break;
  case 'win32': // need a *.ico img
    icon = 'res/img/icon.ico';
    break;
  default:
    icon = 'res/img/icon.png';
}

const ignore = [
  '.gitea',
  '.idea',
  '.vscode',
  '^/config',
  '^/src$',
  '^/img$',
  '^/frontend$',
  '^/scripts',
  '.eslintrc',
  '.gitignore',
  '.ncurc.json',
  '.prettierrc',
  'Jenkinsfile',
  'tsconfig.json',
  'test.ts',
  'engine.bin'
];

module.exports = {
  packagerConfig: {
    icon,
    ignore,
  },

  makers: [
    {
      platforms: ['linux'],
      name: '@electron-forge/maker-zip'
    },
    {
      platforms: ['win32'],
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'Kamikaze',
        name: 'AdvS-Client',
        title: 'AdvS-Client',
        productName: "AdvS-Client",
        description: 'A modern desktop streaming client built with Electron and Vue.js, designed to provide a seamless video streaming experience with advanced features and customization options.',
        setupIcon: './res/img/icon.ico',
        loadingGif: './res/img/loading.gif',
      }
    }
  ],
};
