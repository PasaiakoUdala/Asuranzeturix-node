'use strict';
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const menubar = require('menubar');
const mb = menubar({preloadWindow: true,
                    "width" : 1000,
                    "height" : 800,
                    "index":'file://' + path.join(__dirname,"/app/index.html")});
const express = require('express');
const AmiIo = require("ami-io"),
    SilentLogger = new AmiIo.SilentLogger(), //use SilentLogger if you just want remove logs
    amiio = AmiIo.createClient({port:5038, host:'10.60.68.1', login:'pasaia', password:'p4s414',logger: SilentLogger});
// amiio = AmiIo.createClient({port:5038, host:'10.60.68.1', login:'pasaia', password:'p4s414'});
const notifier = require('node-notifier');

const Server = require('electron-rpc/server');
const sApp = new Server();


// Initialize the development socket server
if (process.env.NODE_ENV === 'DEVELOPMENT') {
    console.log('Initializing socket server...');
    require('./server');
}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)
mb.on('ready', function ready () {
    sApp.configure(mb.window.webContents);

    console.log('app is ready');

    // Open the DevTools.
    if (process.env.NODE_ENV === 'DEVELOPMENT') {
        mb.webContents.openDevTools({
            detach: true
        });
    }

    amiio.on('incorrectServer', function () {
        amiio.logger.error("Invalid AMI welcome message. Are you sure if this is AMI?");
        process.exit();
    });
    amiio.on('connectionRefused', function(){
        amiio.logger.error("Connection refused.");
        process.exit();
    });
    amiio.on('incorrectLogin', function () {
        amiio.logger.error("Incorrect login or password.");
        process.exit();
    });
    amiio.on('event', function(event){

        if (event.event === 'Hangup'){
            console.log('event:', event);
            sApp.send('hangup', event);
        }
        if (event.event === "Dial") {
            console.log("Ring Ring");
            sApp.send('dial', event);
            notifier.notify({
                title: 'DEI BERRIA',
                message: 'Nork: ' + event.calleridname + ' Nori: ' + event.exten,
                icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
                sound: true, // Only Notification Center or Windows Toasters
                wait: true // Wait with callback, until user action is taken against notification
            }, function (err, response) {
                // Response is response from notification
            });
        }
        if ( event.event === "Newchannel") {
            console.log("Channel nº 5");
            sApp.send('newchannel', event);
        }
    });
    amiio.connect();
    amiio.on('connected', function(){});
});

mb.on('after-create-window', function () {
    console.log("after window created");
    mb.window.openDevTools()
    // mb.window.loadURL('http://www.google.es');
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
    // if (mainWindow === null) {
    //     createWindow()
    // }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

