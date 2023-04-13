const express = require('express');
const websocket = require('./module/websoket');
const app = express();
var port = process.env.PORT | 8080 ; 
var wss  = new websocket;


//  app.use(express.static('public'));
app.use("/k", (req, res)=>{
  
    return "k";
});
app.use("/killmon", (req, res)=>{
    if(wss.mon!==undefined){
        wss.mon.close();

    }
    wss.mon = undefined;
    console.log(`killmon`);
    return "killmon";
});
app.use("/killcam", (req, res)=>{
    if(wss.ipcam!==undefined){
        wss.ipcam.close();
    }
    wss.ipcam = undefined;
    console.log(`killcam`);
    return "killcam";

});
const HTTPServer = app.listen(port, ()=>{
    console.log(`Server is open at port:${port}`);
});


wss.createServer(HTTPServer);
app.set('websocket',wss);
