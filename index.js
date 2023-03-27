const express = require('express');
const websocket = require('./module/websoket');
const app = express();
var port = process.env.PORT | 8080 ; 


app.use("/", (req, res)=>{
    res.sendFile(__dirname+'/index.html'); // index.html 파일 응답
})


const HTTPServer = app.listen(port, ()=>{
    console.log(`Server is open at port:${port}`);
});

  var wss  = new websocket;
  wss.createServer(HTTPServer);
  
  app.set('websocket',wss);