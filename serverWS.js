'use strict';

const mysql = require('mysql');
var express = require('express');
var app = express();
const WebSocketServer = require('ws').Server      
const wss = new WebSocketServer({ port: 8081 });

var connexionMySQL = mysql.createConnection({ 
    host     : "localhost", 
    user     : "root", 
    password : "dove",
    database : "pictochat" 
 }); 

wss.on('connection', ((ws) => {
    ws.on('message', (message) => {
        console.log(`received: ${message}`);
        wss.broadcast(`${message}`);
    });

    ws.on('end', () => {
        console.log('Connection ended...');
    });

    ws.send('### Chat opened ###');
}));

wss.broadcast = function broadcast(msg) {
    console.log(msg);
    wss.clients.forEach(function each(client) {
        client.send(msg);
    });
};

// ############# Historique Xhr #############

'use strict';

var express = require('express');
var app = express();

app.use(express.static(`${__dirname}`));

app.get('/historique', function(req, res){
    
    connexionMySQL.query('select * from message', function(err, rows) {
        var json = '';
        json = JSON.stringify(rows);
        const jsonString = JSON.stringify(Object.assign({}, rows))
        var ResultSqlXhr = JSON.parse(jsonString);

        var string = "";
        for (var i in ResultSqlXhr) {
            if(ResultSqlXhr[i]['text'] != null){
                console.log(ResultSqlXhr[i]['text']);
                string += ResultSqlXhr[i]['text'];
                string += "<br>";
            }
         }
         res.send(string);
    });
});

app.listen(3000);