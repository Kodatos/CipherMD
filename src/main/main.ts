import { app, BrowserWindow, Menu, shell } from 'electron';

import * as path from 'path';

import MenuTemplate from './menu';

let mainWindow: Electron.BrowserWindow | null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  const renderURL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`;

  Menu.setApplicationMenu(Menu.buildFromTemplate(MenuTemplate));

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
