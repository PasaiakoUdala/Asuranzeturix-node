'use strict';
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const menubar = require('menubar');

const settings = require('electron-settings');

let SERVER, PORT, USER, PASSWD;

settings.configure({
    prettify: true
});
SERVER = settings.getSync('AMI.server');
PORT = settings.getSync('AMI.port');
USER = settings.getSync('AMI.user');
PASSWD = settings.getSync('AMI.passwd');

const mb = menubar({preloadWindow: true,
                    "width" : 1000,
                    "height" : 800,
                    "index":'file://' + path.join(__dirname,"/app/index.html")});
// USER = 'ironadmin';
// PASSWD = 'adminsecret';

const AmiIo = require("ami-io"),
    SilentLogger = new AmiIo.SilentLogger(), //use SilentLogger if you just want remove logs
    // amiio = AmiIo.createClient({port:PORT, host:SERVER, login:USER, password:PASSWD,logger: SilentLogger});
    amiio = AmiIo.createClient({port:PORT, host:SERVER, login:USER, password:PASSWD});

const notifier = require('node-notifier');

const Server = require('electron-rpc/server');
const sApp = new Server();

const terminalak = ['4121115060010934', 'zoiber'];

sApp.on('deitu', function (err, body) {
    const action = new AmiIo.Action.Originate(); //AmiIo here is the variable's name there you store required ami-io

    // var aktion = new action.Originate();
    action.Channel = 'SIP/4121115060010934'; // iker
    // action.Channel = 'SIP/4121115060010935'; // Gorka
    action.Context = 'desde-usuarios';
    // action.Context = 'default';
    action.Exten = 'SIP/6422';
    action.Priority = 1;
    action.Async = true;
    action.WaitEvent = true;
    // console.log(action);



    amiio.send(action, function(err, data){
        console.log("bidali da.");
        if (err){
            //err will be event like OriginateResponse if (#response !== 'Success')
            console.log(err);
        }
        else {
            //data is event like OriginateResponse if (#response === 'Success')
            console.log(data);
        }
    });
});

mb.on('ready', function ready () {
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
            console.log("*********************************************************");
            console.log(event);
            console.log("*********************************************************");

            // TODO: channel bidez bilatu behar du SIP/XXXXXXXXX-YYYYY textuan
            if ( typeof event !== "undefined") {
                if (typeof event.channel !== "undefined") {
                    let exten = event.channel.split("SIP")[1].split("-")[0];console.log(exten);
                    if ( terminalak.indexOf(exten) != -1) {
                        sApp.send('hangup', event);
                    }

                }
            }
        }
        if (event.event === "Dial") {

            if ( terminalak.indexOf(event.dialstring) != -1) {
                sApp.send('dial', event);
                notifier.notify({
                    title: 'DEI BERRIA!',
                    message: 'Nork: ' + event.calleridnum ,
                    icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
                    sound: true, // Only Notification Center or Windows Toasters
                    wait: true // Wait with callback, until user action is taken against notification
                }, function (err, response) {
                    // Response is response from notification
                });
            }
        }
        if ( event.event === "Newchannel") {

            if ( terminalak.indexOf(event.calleridnum) != -1 ) {
                sApp.send('newchannel', event);
            }

        }
    });

    amiio.connect();

    amiio.on('connected', function(){
        console.log("Conected");
    });
    sApp.configure(mb.window.webContents);
});

mb.on('after-create-window', function () {
    console.log("after window created");
    mb.window.openDevTools();
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

