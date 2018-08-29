import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';

import * as fs from 'fs';
import * as path from 'path';

import Cipher from './cipher';

let mainWindow: Electron.BrowserWindow | null;

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

function newEncrypted() {
  mainWindow!.webContents.send('on-password-request');
  ipcMain.once('password-available', (_event: any, pass: string) => {
    mainWindow!.webContents.send('file-opened', 'Encrypted Untitled', '');
    msps = pass;
  });
}

function openFile() {
  if (!mainWindow) return;
  const files: string[] = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: mergedFileFilter
  });
  if (!files || !files.length) return;

  if (path.extname(files[0]) === '.cpmd') {
    requestPassword(files[0]);
  } else {
    msps = null;
    const contents: string = fs.readFileSync(files[0]).toString();
    mainWindow.webContents.send('file-opened', files[0], contents);
  }
}

function requestPassword(filename: string) {
  mainWindow!.webContents.send('on-password-request');
  ipcMain.on('password-available', (_event: any, pass: string) => {
    decryptFile(pass, filename);
  });
}

async function decryptFile(pass: string, filename: string) {
  const encrypted: Buffer = fs.readFileSync(filename);
  try {
    const contents: string = await Cipher.decrypt(encrypted, pass);
    mainWindow!.webContents.send('file-opened', filename, contents);
    msps = pass;
  } catch (error) {
    if (error === Cipher.wrongPassError)
      mainWindow!.webContents.send('on-wrong-password');
    else console.error(error.message);
  }
}

function saveFile() {
  if (!mainWindow) return;
  mainWindow.webContents.send('save-file');
  ipcMain.once(
    'on-content-received',
    async (_event: any, openedFile: string, content: string) => {
      if (
        path.basename(openedFile) === 'Untitled' ||
        path.basename(openedFile) === newEncryptedFileName
      ) {
        dialog.showSaveDialog(
          mainWindow!,
          { filters: msps ? encryptedMarkdownFileFilter : markdownFileFilter},
          (fileName: string) => {
            writeFile(fileName, content);
          }
        );
      } else {
        writeFile(openedFile, content);
      }
    }
  );
}

async function writeFile(filename: string, content: string) {
  let data: Buffer | string;
  if (path.extname(filename) === '.cpmd')
    data = await Cipher.encrypt(content, msps!);
  else data = content;
  fs.writeFile(filename, data, err => {
    if (err) console.log(err);
    mainWindow!.webContents.send('file-saved', filename);
  });
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  const renderURL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`;

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: 'CipherMD',
      applicationVersion: '0.1.0',
      copyright: 'Kodatos'
    });
  }

  mainWindow.loadURL(renderURL);

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const offloadLinks = (e: Electron.Event, url: string) => {
    e.preventDefault();
    if (
      mainWindow &&
      url !== mainWindow.webContents.getURL() &&
      url.startsWith('http')
    ) {
      shell.openExternal(url);
    }
  };

  mainWindow.webContents.on('will-navigate', offloadLinks);
  mainWindow.webContents.on('new-window', offloadLinks);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
