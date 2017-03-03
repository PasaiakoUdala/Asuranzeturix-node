/**
 * Created by iibarguren on 3/2/17.
 */
const Client = require('electron-rpc/client');
const client = new Client();

client.on('hangup', function (err, body) {
    console.log('hangup:', body);
    $('#kk').append(body);
});

client.on('newchannel', function (err, body) {
    console.log('newchannel:', body);
    console.log($('#kk'));
    $('#kk').append(body);
    let niretr = "<tr><td>" + body.calleridnum +"</td><td>" + body.exten +"</td><td>" + body.event+"</td>";
    $('#deiakTaula > tbody:last-child').append(niretr);
});

client.on('dial', function (err, body) {
    console.log('dial:', body);
    $('#kk').append(body);
});