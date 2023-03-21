var express = require('express');
var app = express();
var server = require('http').createServer(app);
var edgecon = {};
var port = process.env.PORT | 8080 ; 

app.use("/view", (req, res)=>{
    res.sendFile(__dirname+'/index.html'); // index.html 파일 응답
})
app.use("/get_edgestate", (req, res)=>{
    const dataBuffer = Buffer.from('{"target":"AGENT","command":"GET_EGDE_MACHINES_STAT","sender":"moniter","recv":"NBG_CLOUD"}','utf-8');
    edgecon.sendBytes(dataBuffer);
})

server.listen(port, function() {
    console.log(`Socket IO server listening on port ${port}`);
});