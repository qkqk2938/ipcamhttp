'use strict'
const wsModule = require('ws');



class Websocket {
    
    constructor() {
        this.ipcam;
        this.mon;
    }

    createServer(HTTPServer){
        console.log(`ws server on`);
  
        const wsServer = new wsModule.Server( 
            {
                server: HTTPServer, // WebSocket서버에 연결할 HTTP서버를 지정한다.
               
            }
        );
        
        wsServer.on('connection', (ws, request)=> {

            const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
            console.log(`새로운 클라이언트[${ip}] 접속`);
            const conAuth = request.headers['sec-websocket-protocol'];
            const conAuthArr = conAuth.split('_');
            if(conAuthArr[0]=="mon" && conAuthArr[1] == "2938" && this.mon ===undefined){
                this.mon = ws;
                console.log(`mon up`);
                ws.on('message', (msg)=>{
                    if(this.ipcam !==undefined){
                        console.log(`ipcam send : ` + msg);
                        this.ipcam.send(msg);
                    }
                })
            }else if(conAuthArr[0]=="ipcam" && this.ipcam ===undefined){
                this.ipcam = ws; 
                console.log(`ipcam up`);
                ws.on('message', (msg)=>{
                    if(this.mon !==undefined){
                        this.mon.send(msg);
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