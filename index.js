const express = require('express');
const websocket = require('./module/websoket');
const app = express();
var port = process.env.PORT | 8080 ; 
var wss  = new websocket;


app.use("/view", (req, res)=>{
    res.sendFile(__dirname +'/index.html'); 
});

app.use("/killmon", (req, res)=>{
    if(wss.mon){
        wss.mon.close();

    }
    wss.mon = null;
    console.log(`killmon`);
    res.send("killmon");
});
app.use("/killcam", (req, res)=>{
    if(wss.ipcam){
        wss.ipcam.close();
    }
    wss.ipcam = null;
    console.log(`killcam`);
    res.send("killcam");

});
app.use("/killdrive", (req, res)=>{
    if(wss.drivetrain){
        wss.drivetrain.close();
    }
    wss.drivetrain = null;
    console.log(`killdrivetrain`);
    res.send("killdrive");

});

app.use("/status", (req, res)=>{
    let monstat = "off";
    let ipcamstat = "off";
    let drivetrainstat = "off";
    if(wss.mon){
        monstat = "on";
    }
    if(wss.ipcam){
        ipcamstat = "on";
    }
    if(wss.drivetrain){
        drivetrainstat = "on";
    }

    res.send(`{"mon" : "`+monstat+`", "ipcam" : "`+ipcamstat+`", "drivetrain" : "`+drivetrainstat+`"}`);

});

const HTTPServer = app.listen(port, ()=>{
    console.log(`Server is open at port:${port}`);
});


wss.createServer(HTTPServer);
app.set('websocket',wss);
