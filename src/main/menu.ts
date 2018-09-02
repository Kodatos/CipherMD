import {BrowserWindow, dialog, ipcMain, MenuItem} from 'electron';

import * as fs from 'fs';
import * as path from 'path';

import Cipher from './cipher';

const markdownFileFilter: Electron.FileFilter[] = [
  {
    name: 'Markdown Files',
    extensions: ['md', 'txt']
  }
];

const encryptedMarkdownFileFilter: Electron.FileFilter[] = [
  {
    name: 'Encrypted Markdown Files',
    extensions: ['cpmd']
  }
];

const mergedFileFilter: Electron.FileFilter[] = [
  {
    name: 'CipherMD Markdown Files',
    extensions: ['md', 'txt', 'cpmd']
  }
];

const newEncryptedFileName = 'Encrypted Untitled';

let msps: string | null = null;

const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+N'
      },
      {
        label: 'New Encrypted',
        accelerator: 'CmdOrCtrl+Shift+N',
        click: newEncrypted
      },
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click: openFile
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: saveFile
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  }
];

function newEncrypted(_menuItem: MenuItem, browserWindow: BrowserWindow) {
  browserWindow.webContents.send('on-password-request');
  ipcMain.once('password-available', (_event: any, pass: string) => {
    browserWindow.webContents.send('file-opened', 'Encrypted Untitled', '');
    msps = pass;
  });
}

function openFile(_menuItem: MenuItem, browserWindow: BrowserWindow) {
  const files: string[] = dialog.showOpenDialog(browserWindow, {
    properties: ['openFile'],
    filters: mergedFileFilter
  });
  if (!files || !files.length) return;

  if (path.extname(files[0]) === '.cpmd') {
    requestPassword(browserWindow, files[0]);
  } else {
    msps = null;
    const contents: string = fs.readFileSync(files[0]).toString();
    browserWindow.webContents.send('file-opened', files[0], contents);
  }
}

function requestPassword(browserWindow: BrowserWindow, filename: string) {
  browserWindow.webContents.send('on-password-request');
  ipcMain.on('password-available', (_event: any, pass: string) => {
    decryptFile(browserWindow, pass, filename);
  });
}

async function decryptFile(browserWindow: BrowserWindow, pass: string, filename: string) {
  const encrypted: Buffer = fs.readFileSync(filename);
  try {
    const contents: string = await Cipher.decrypt(encrypted, pass);
    browserWindow!.webContents.send('file-opened', filename, contents);
    msps = pass;
  } catch (error) {
    if (error === Cipher.wrongPassError)
      browserWindow!.webContents.send('on-wrong-password');
    else console.error(error.message);
  }
}

function saveFile(_menuItem: MenuItem, browserWindow: BrowserWindow) {
  browserWindow.webContents.send('save-file');
  ipcMain.once(
    'on-content-received',
    async (_event: any, openedFile: string, content: string) => {
      if (
        path.basename(openedFile) === 'Untitled' ||
        path.basename(openedFile) === newEncryptedFileName
      ) {
        dialog.showSaveDialog(
          browserWindow,
          { filters: msps ? encryptedMarkdownFileFilter : markdownFileFilter},
          (fileName: string) => {
            writeFile(browserWindow, fileName, content);
          }
        );
      } else {
        writeFile(browserWindow, openedFile, content);
      }
    }
  );
}

async function writeFile(browserWindow: BrowserWindow, filename: string, content: string) {
  let data: Buffer | string;
  if (path.extname(filename) === '.cpmd')
    data = await Cipher.encrypt(content, msps!);
  else data = content;
  fs.writeFile(filename, data, err => {
    if (err) console.log(err);
    browserWindow!.webContents.send('file-saved', filename);
  });
}

export default template;
