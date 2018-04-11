const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const path = require('path');
const decompress = require('decompress');
const url = require('url');
const {ipcMain} = require('electron');


const {dialog} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.

    mainWindow = new BrowserWindow();
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Load File',
                    click: () => {
                        loadFile();
                    }
                },
                {
                  label: 'Quit',
                      click: () => {
                      app.quit();
                  }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {message: "If you don't get it, I can't explain it. Get to the choppa", title: "Wtf is this?"});
                    }
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

function loadFile() {

    dialog.showOpenDialog((fileNames) => {
        console.log("Processing zip file .....");
        // fileNames is an array that contains all the selected
        if(fileNames === undefined){
            console.log("No file selected.");
            return;
        }
        decompress(fileNames[0], 'dist').then(files => {

            global.folderWithFilesMap = files.reduce(function(acumulator, f) {

                const folder = f.path.split("/")[0];

                if (f.path.endsWith("png")) {
                    return acumulator;
                }

                if (!acumulator.has(folder)) {
                    acumulator.set(folder, []);
                }
                const currentFiles = acumulator.get(folder);
                currentFiles.push(f.path);
                return acumulator;
            }, new Map());

            mainWindow.webContents.send('draw-tabs-and-buttons');

        }).catch(function (err) {
                 console.log("Problem decompressing files.", err);
        });
    });
}

app.on('ready', () => {
    createWindow();
    //mainWindow.webContents.openDevTools();

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('closed', function () {
        mainWindow = null
    });
});


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

ipcMain.on('async-loadFile', () => {
    loadFile();
});
