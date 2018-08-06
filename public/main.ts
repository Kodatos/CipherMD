import electron, { app, BrowserWindow, Menu } from 'electron';

import fs from 'fs';
import path from 'path';

let mainWindow: BrowserWindow | null;
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
        accelerator: 'CmdOrCtrl+S'
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
  const files = electron.dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      {
        name: 'Markdown Files',
        extensions: ['md', 'txt']
      }
    ]
  });
  if (!files) return;

  const contents = fs.readFileSync(files[0]).toString();
  mainWindow.webContents.send('file-opened', contents);
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

  const offloadLinks = (e: Event, url: string) => {
    e.preventDefault();
    if (
      mainWindow &&
      url !== mainWindow.webContents.getURL() &&
      url.startsWith('http')
    ) {
      electron.shell.openExternal(url);
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
