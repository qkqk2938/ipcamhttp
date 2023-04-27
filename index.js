const express = require('express');
const websocket = require('./module/websoket');
const app = express();
var port = process.env.PORT | 8080 ; 
var wss  = new websocket;


app.use("/view", (req, res)=>{
    res.sendFile(__dirname +'/index.html'); 
});


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
app.use("/killdrive", (req, res)=>{
    if(wss.drivetrain!==undefined){
        wss.drivetrain.close();
    }
    wss.drivetrain = undefined;
    console.log(`killdrivetrain`);
    return "killdrive";

});
const HTTPServer = app.listen(port, ()=>{
    console.log(`Server is open at port:${port}`);
});


wss.createServer(HTTPServer);
app.set('websocket',wss);
