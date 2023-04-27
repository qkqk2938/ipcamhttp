'use strict'
const wsModule = require('ws');

class Websocket {
    
    constructor() {
        this.ipcam = null;
        this.drivetrain = null;
        this.mon = null;
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
            if(conAuth=="mon_2938"){
                this.mon = ws;
                console.log(`mon up`);
                if(this.ipcam){
                    console.log(`Live Start`);
                    this.ipcam.send("{'data':'liveStart'}");
                }
                ws.on('message', (msg)=>{
                    console.log(msg);
                    if(this.drivetrain && this.ipcam){ 
                        this.drivetrain.send(msg);
                    }
                    
                })
                // 연결 종료 이벤트 처리
                ws.on('close', ()=>{
                    console.log(`클라이언트[${ip}] 웹소켓 연결 종료`);
                    this.mon = null;                
                    console.log(`mon die`);
                
                })
            }else if(conAuth=="ipcam"){
                this.ipcam = ws; 
                console.log(`ipcam up`);
                ws.on('message', (msg)=>{
                    if(this.mon){                        
                        this.mon.send(msg);
                    }else{
                        console.log(`Live Stop`);
                        this.ipcam.send('{"data":"liveStop"}');
                    }
                 
                })
                 // 연결 종료 이벤트 처리
                ws.on('close', ()=>{
                    console.log(`클라이언트[${ip}] 웹소켓 연결 종료`);
                    this.ipcam = null;                
                    console.log(`ipcam die`);
                    
                })
            }else if(conAuth=="drivetrain"){
                this.drivetrain = ws; 
                console.log(`drivetrain up`);
                ws.on('message', (msg)=>{
                                    
                })
                 // 연결 종료 이벤트 처리
                ws.on('close', ()=>{
                    console.log(`클라이언트[${ip}] 웹소켓 연결 종료`);
                    this.drivetrain = null;                
                    console.log(`drivetrain die`);
                    
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
            
           
         
        });
    }
}
module.exports=Websocket;