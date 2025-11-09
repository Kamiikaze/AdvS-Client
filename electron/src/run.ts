import { app } from 'electron';
import Kernel from './Kernel';

// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) app.quit();

const kernel = new Kernel();

kernel.start();
