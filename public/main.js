const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  let renderURL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(renderURL);

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  let offloadLinks = (e, url) => {
    e.preventDefault();
    if (url !== mainWindow.webContents.getURL() && url.startsWith('http'))
      electron.shell.openExternal(url);
  };

  mainWindow.webContents.on('will-navigate', offloadLinks);
  mainWindow.webContents.on('new-window', offloadLinks);
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});
