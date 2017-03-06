/**
 * Created by iibarguren on 3/2/17.
 */
const Client = require('electron-rpc/client');
const moment = require('moment');
const client = new Client();

moment.locale('eu');

client.on('hangup', function (err, body) {
    console.log('hangup:', body);
    $('#kk').append(body);
});

client.on('newchannel', function (err, body) {
    console.log('newchannel:', body);
    let nork = body.calleridnum;
    nork = 'Nik';
    let nori = body.exten
    let noiz = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
    let niretr = "<tr><td>" + body.calleridnum + "</td><td>" + body.exten + "</td><td>" + noiz + "</td><a class='btnDeitu' href='#'>deitu</a><td></td>";
    $('#deiakTaula > tbody:last-child').append(niretr);
});

$('body').on('click', '.btnDeitu', function () {
    client.request('deitu', 'kk');
});

client.on('dial', function (err, body) {
    console.log('dial:', body);
    $('#kk').append(body);
});