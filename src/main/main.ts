import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';

import * as fs from 'fs';
import * as path from 'path';

let mainWindow: Electron.BrowserWindow | null;

const markdownFileFilter: Electron.FileFilter[] = [
  {
    name: 'Markdown Files',
    extensions: ['md', 'txt']
  }
];

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
        accelerator: 'CmdOrCtrl+Shift+N'
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

function openFile() {
  if (!mainWindow) return;
  const files: string[] = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: markdownFileFilter
  });
  if (!files || !files.length) return;

  const contents: string = fs.readFileSync(files[0]).toString();
  mainWindow.webContents.send('file-opened', files[0], contents);
}

function saveFile() {
  if (!mainWindow) return;
  mainWindow.webContents.send('save-file');
  ipcMain.once('on-content-received', (_event: any, openedFile: string, content: string) => {
    if (openedFile === 'Untitled') {
      dialog.showSaveDialog(
        mainWindow!,
        { filters: markdownFileFilter },
        (fileName: string) => {
          fs.writeFile(fileName, content, err => console.log(err));
          mainWindow!.webContents.send('file-saved', fileName);
        }
      );
    } else {
      fs.writeFile(openedFile, content, err => console.log(err));
      mainWindow!.webContents.send('file-saved', openedFile);
    }
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
