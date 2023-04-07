'use strict'
const wsModule = require('ws');
const fs = require('fs');


class Websocket {
    
    constructor() {
        this.ipcam;
        this.mon;
        this.capture = false;
    }

    createServer(HTTPServer){
        console.log(`ws server on`);
  
        const wsServer = new wsModule.Server( 
            {
                server: HTTPServer, // WebSocket서버에 연결할 HTTP서버를 지정한다.
               
            }
        );
        
        wsServer.on('connection', async (ws, request)=> {

            const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
            console.log(`새로운 클라이언트[${ip}] 접속`);
            const conAuth = request.headers['sec-websocket-protocol'];
            const conAuthArr = conAuth.split('_');
            if(conAuthArr[0]=="mon" && conAuthArr[1] == "2938" && this.mon ===undefined){
                this.mon = ws;
                console.log(`mon up`);
                ws.on('message', (msg)=>{
                    console.log(Date.now()+`ipcam send : ` + msg);
                    var mj = JSON.parse(msg);
                    switch (mj["command"]){
                        case "axis":
                            if(this.ipcam !==undefined){
                                this.ipcam.send(msg);
                            }
                            break;
                        case "capture" :
                            this.capture = true;
                            break;
                            
                    }
                     
                
                        
                    
                    
                })
            }else if(conAuthArr[0]=="ipcam" && this.ipcam ===undefined){
                this.ipcam = ws; 
                console.log(`ipcam up`);
                ws.on('message', (msg)=>{
                    if(this.mon !==undefined){
                        this.mon.send(msg);
                    }
                    if(this.capture){
                        this.capture = false;
                        const buffer = Buffer.from(msg);
                        const mtime = new Date();
                        const currentDate = new Date(mtime.getTime() + (9 * 60 * 60 * 1000));
                        const year = currentDate.getFullYear();
                        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                        const day = String(currentDate.getDate()).padStart(2, '0');
                        const hours = String(currentDate.getHours()).padStart(2, '0');
                        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
                        const seconds = String(currentDate.getSeconds()).padStart(2, '0');
                        const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0');

                        const formattedDate = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
                   
                        fs.writeFile("./capture/"+formattedDate+'.png', buffer, (err) => {
                            if (err) {
                              console.error(err);
                              return;
                            }
                            console.log('Image saved successfully.');
                        });
                    }
                })
            }else{
                ws.close();
            }
            

            // 2) 클라이언트에게 메시지 전송
            if(ws.readyState === ws.OPEN){ // 연결 여부 체크
           
            }
            
          
            
            // 4) 에러 처러
            ws.on('error', (error)=>{
                console.log(`클라이언트[${ip}] 연결 에러발생 : ${error}`);
            })
            
            // 5) 연결 종료 이벤트 처리
            ws.on('close', ()=>{
                console.log(`클라이언트[${ip}] 웹소켓 연결 종료`);
                if(conAuthArr[0]=="mon"){
                    this.mon = undefined;                
                    console.log(`mon die`);
                }else if(conAuthArr[0]=="ipcam"){
                    this.ipcam = undefined;                
                    console.log(`ipcam die`);
                }
            })
         
        });
    }
}
module.exports=Websocket;