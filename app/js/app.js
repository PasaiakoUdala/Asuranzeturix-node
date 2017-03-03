/**
 * Created by iibarguren on 3/2/17.
 */
const Client = require('electron-rpc/client');
const client = new Client();

client.on('hangup', function (err, body) {
    console.log('hangup:', body);
});

client.on('newchannel', function (err, body) {
    console.log('newchannel:', body);
});

client.on('dial', function (err, body) {
    console.log('dial:', body);
});