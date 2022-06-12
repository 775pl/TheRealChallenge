'use strict';

const http = require('http');
const mysql = require('mysql');
const util = require('util');
const fs = require('fs');
const PORT = 8000;


var connexionMySQL = mysql.createConnection({ 
    host     : "localhost", 
    user     : "root", 
    password : "dove",
    database : "Pictochat" 
 }); 

 connexionMySQL.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
  
    console.log('Connected to the MySQL server.');
  });

// ###########################  Save Message ###########################

http.createServer((req, res) => {
    var msg = req.url.split('/')[1];
    console.log('Message reçu: ' + msg);
    var html = '<h3>Tu as envoyé : ' + msg + '</h3>';
    // connexionMySQL.connect(function(err) {
    //     if (err) throw err;
    //     console.log("Connected!");
        var sql = "INSERT INTO message (text) VALUES ( '" + msg + "')";
        connexionMySQL.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
        });
        // connexionMySQL.end();
      
    res.writeHead(200, {"Content-Type": "text/html", "Access-Control-Allow-Origin": "*"});
    res.write(html);
    res.end();
    if (msg == 'end') process.exit();
}).listen(PORT, () => {
    console.log("Le serveur écoute sur le port : %s", PORT);
});

// ###########################  SSE code ###########################

http.createServer((request, response) => {

    // requêtes stream initialisée par js
    if (request.headers.accept && request.headers.accept == 'text/event-stream') {
        if (request.url == '/moderation') {
            sendSSE(request, response);
        } 
        else {
            response.writeHead(404);
            response.end();
        }
    } 
  else {
        // 1ère requête / réponse = indexSSE.html
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(fs.readFileSync(__dirname + '/moderation.html'));
        response.end();
  }
}).listen(8002);



const sendSSE = (request, response) => {
    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const id = (new Date()).toLocaleTimeString();

    function functionThatNeedsRowsData(rows) {
        console.log(rows)
      }


    var sqlSSE = "SELECT text from message WHERE id = (SELECT MAX(id) FROM message)";
    

    async function executeTheQuery(){
        return new Promise((resolve,reject)=>{
            connexionMySQL.query('SELECT text from message WHERE id = (SELECT MAX(id) FROM message)',function(err,rows){
                    resolve(rows[0].text);
               });    
        })
   }

   async function Affichage(){
    let ResultSqlSSE = await executeTheQuery();
    console.log("Message:" + ResultSqlSSE);

        constructSSE(response, id, ResultSqlSSE);
    }
    
    const constructSSE = (response, id, data) => {
    response.write('id: ' + id + '\n');
    response.write("data: " + data + '\n\n');
    }
    
    setInterval(() => {
        Affichage();
    }, 1000);
     

    //   var sqlSSE = "SELECT text from message WHERE id = (SELECT MAX(id) FROM message)"
    //   connexionMySQL.query(sqlSSE, [id], function(err, rows, fields) {
    //     if (err) throw err;
    //     console.log('Query result: ', rows);
      
    //     functionThatNeedsRowsData(rows); // 
      
    //   const AwA = rows[0].cntStatus;
    //   console.log(rows[0].cntStatus);
    //   });

    
     //); connexionMySQL.query('SELECT text from message WHERE id = (SELECT MAX(id) FROM message)', (err, rows) =>{
    //         next(null, rows);
    // });
    // }
    //connexionMySQL.query(sqlSSE, function(err, rows) {

//         // //callback(null, rows[0].text);

// 
// 
// 
//         var json = '';
        // json = JSON.stringify(rows);
        // const jsonString = JSON.stringify(Object.assign({}, rows))
        // var uwu = JSON.parse(jsonString);
        // console.log("uwu");
        // console.log(uwu);
        // console.log("uwu");

//         // var string = "";
    //     for (var i in uwu) {
            // if(uwu[i]['text'] != null){
//                 console.log(uwu[i]['text']);
//                 string += uwu[i]['text'];
//                 string += "<br>";
//             }
         //}
    //});
}


// const callback_function = 
//         util.callbackify(testfunction);


// callback_function((err, ret) => {
//     if (err) throw err;
//     console.log("ret");
//     console.log(ret);
//     console.log("ret");
// });
// const sendSSE = (request, response) => {
//     response.writeHead(200, {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         'Connection': 'keep-alive'
//     });

//     const id = (new Date()).toLocaleTimeString();

//     var sqlSSE = "SELECT text from message WHERE id = (SELECT MAX(id) FROM message)";
//     let resultSqlSSeE = ""
//     connexionMySQL.query(sqlSSE, function (err, resultSqlSSE) {
//         if (err) throw err;
//         console.log("All i need is 5 minutes");
//         resultSqlSSeE = resultSqlSSE;
//         console.log("TestTestTestTestTestTest");
//         console.log(resultSqlSSE);
//         console.log("TestTestTestTestTestTest");
//         console.log(resultSqlSSeE);
//         console.log("TestTestTestTestTestTest");
//         return resultSqlSSE;
//       });

    // let resbdd = connexionMySQL.connect(function(err) {
    //     if (err) throw err;
    //     console.log("Connected!");
    //     var sql = "SELECT text from message WHERE id = (SELECT MAX(id) FROM message)";
    //     connexionMySQL.query(sql, function (err, result) {
    //       if (err) throw err;
    //       console.log("All i need is 5 minutes");
    //     });
    //     connexionMySQL.end();
    //   });



// ws.onopen = function (event) {
//     console.log('Connection is open ...');
//     ws.send("A crew mate has joined");
// };

// ws.onerror = function (err) {
//     console.log('err: ', err);
// }

// ws.onmessage = function (event) {
//     console.log(event.data);
//     let message = event.data;

//     let messageElem = document.createElement('p');
//     messageElem.textContent = message;
//     document.getElementById('show_message').prepend(messageElem);
//     //document.body.innerHTML += event.data + '<br>';
// };

// ws.onclose = function() {
//   console.log("Connection is closed...");
// }

// function getXMLHttpRequest() {
// var xhr = null;
// if (window.XMLHttpRequest || window.ActiveXObject) {
//     if (window.ActiveXObject) {
//         try {
//             xhr = new ActiveXObject("Msxml2.XMLHTTP");
//         } catch(e) {
//             xhr = new ActiveXObject("Microsoft.XMLHTTP");
//         }
//     } else {
//         xhr = new XMLHttpRequest(); 
//     }
// } else {
//     alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
//     return null;
// }
// return xhr;
// }


// let xhr = getXMLHttpRequest();

// var requete="SELECT text FROM message;";
// var url = "http://127.0.0.1:8080/historique.php?requete=" + requete;

// xhr.open('GET', url);

// xhr.send(null);

// xhr.onload = function() {
//     if (xhr.status != 200) {
//         if(xhr.status == 404){
//             alert(`Error 404 : Not found`);
//         }
//         if(xhr.status == 403){
//             alert(`Error 403 : Permissions denied`);
//         }
//     } else { 
//         alert(`Loaded: ${xhr.status} ${xhr.response}`);

//         var content = xhr.responseText;

//         //Ajoute un élément div au body de la page
//         var elem = document.createElement('divSql');
//         document.body.appendChild(elem);
//         elem.innerHTML = content;
//     }
// };

// xhr.timeout = 10000;//10sec et ça crash

// xhr.onerror = function() { // en cas d'erreur d'envoi de la requete
//     alert("La requête a échouée");
// };

// 'use strict';

// const http = require('http');
// const mysql = require('mysql');
// const PORT = 8000;

// var connexionMySQL = mysql.createConnection({ 
//     host     : "localhost", 
//     user     : "root", 
//     password : "dove", 
//     database : "Pictochat" 
//  }); 

// http.createServer((req, res) => {
//     var msg = req.url.split('/')[1];
//     console.log('Message reçu: ' + msg);
//     var html = '<h3>Tu as envoyé : ' + msg + '</h3>';
//     connexionMySQL.connect(function(err) {
//         if (err) throw err;
//         console.log("Connected!");
//         var sql = "INSERT INTO message (text) VALUES ( '" + msg + "')";
//         connexionMySQL.query(sql, function (err, result) {
//           if (err) throw err;
//           console.log("1 record inserted");
//         });
//       });

//     res.writeHead(200, {"Content-Type": "text/html", "Access-Control-Allow-Origin": "*"});
//     res.write(html);
//     res.end();
//     if (msg == 'end') process.exit();
// }).listen(PORT, () => {
//     console.log("Le serveur écoute sur le port : %s", PORT);
// });

// // function admin () {
// //     db.connect(function(err) {
// //         if (err) throw err;
// //         console.log("Connecté à la base de données MySQL!");

// //         // requête selection
// //         var request = "SELECT text from message WHERE id = (SELECT MAX(id) FROM message)"
// //         connexionMySQL.query(request, function (err, result) {
// //             if (err) throw err;
// //             console.log(result);
// //             return result;
// //         });
// //         connexionMySQL.end();
// //     })
  
// // };

// // export.admin = admin