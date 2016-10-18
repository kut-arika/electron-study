const { app, BrowserWindow } = require('electron');
const path = require('path');

let win = null;
function createWindow() {
  win = new BrowserWindow({ width: 800, height: 600 });
  win.loadURL(path.join('file://', __dirname, 'app', 'html', 'index.html'));
  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
