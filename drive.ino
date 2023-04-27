#include <ArduinoJson.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WebSocketsClient.h>
#include <Esp.h>
#include <Ticker.h>

// static const int D0   = 16;
// static const int D1   = 5;
// static const int D2   = 4;
// static const int D3   = 0;
// static const int D4   = 2;
// static const int D5   = 14;
// static const int D6   = 12;
// static const int D7   = 13;

const int moter_pin[4][2] = { {16,5} , {4,0} , {2,14} , {12,13} };
// const m1_s = 11;
// const m1_p = 12;
// const m1_m = 13;

// const m2_s = 10;
// const m1_p = 8;
// const m1_m = 7;

// const m3_s = 9;
// const m1_p = 5;
// const m1_m = 4;

// const m4_s = 6;
// const m1_p = 3;
// const m1_m = 2;

Ticker flipper;
ESP8266WiFiMulti WiFiMulti;
WebSocketsClient webSocket ;

StaticJsonDocument<200> doc;
JsonArray arr;
bool wsChecker = false;
bool mecanum = false;

void wsCheck(){
  if(wsChecker){
    wsChecker = false;
  }else{
    move(0,0);
  }

}

void webSocketEvent( WStype_t type, uint8_t * payload, size_t length) {

    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("Wobsket Disconnected");
            break;
        case WStype_CONNECTED:
            Serial.println("Wobsket Connected");
            break;
        case WStype_TEXT:
        case WStype_BIN:
          Serial.write(payload, length);
          Serial.println();
          deserializeJson(doc, payload, length);
          if(doc["command"].as<String>()=="axis"){
            arr = doc["data"].as<JsonArray>();         
            move(doc["data"].as<JsonArray>()[0].as<float>(),doc["data"].as<JsonArray>()[1].as<float>());
            if(!wsChecker){
              wsChecker = true;
            }
          }else if(doc["command"].as<String>()=="mecanum"){
            if(doc["data"].as<String>()=="on"){
              mecanum = true;
            }else{
              mecanum = false;
            }
          }
          break;
        case WStype_ERROR: 
          Serial.println();
          Serial.write(payload, length);
          break;
        case WStype_FRAGMENT_TEXT_START:
        case WStype_FRAGMENT_BIN_START:
        case WStype_FRAGMENT:
        case WStype_FRAGMENT_FIN:
            break;
    }
}

void setup() {
  pinMode(16,OUTPUT);
  pinMode(5,OUTPUT);
  pinMode(4,OUTPUT);
  pinMode(0,OUTPUT);  
  pinMode(2,OUTPUT);
  pinMode(14,OUTPUT);
  pinMode(12,OUTPUT);
  pinMode(13,OUTPUT);   

  digitalWrite(16,0);
  analogWrite(5,0);
  digitalWrite(4,0);
  analogWrite(0,0);
  digitalWrite(2,0);
  analogWrite(14,0);
  digitalWrite(12,0);
  analogWrite(13,0);

  Serial.begin(115200); 
  if(WiFi.getMode() & WIFI_AP) {
        WiFi.softAPdisconnect(true);
  }

  WiFiMulti.addAP("U+NetD243", "4000000486");
  while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
  }
  String ip = WiFi.localIP().toString();
  Serial.printf("[SETUP] WiFi Connected %s\n", ip.c_str());
  webSocket.begin("sonorous-earth-377802.du.r.appspot.com",80,"/","drivetrain");
  webSocket.onEvent(webSocketEvent);

  flipper.attach(1,wsCheck);
}

void loop() {
  webSocket.loop();
  ESP.wdtFeed();
  // if(Serial.available()){
  //   data = Serial.readString();
  //   data.toCharArray(json,data.length());
  //   deserializeJson(doc, json, 200);
  //   if(doc["command"].as<String>()=="axis"){
  //     move(doc["data"].as<JsonArray>()[0].as<float>(),doc["data"].as<JsonArray>()[1].as<float>());
  //   }
    
  // }


}

void move(float x , float y){
  int ty1 = abs(x-y)*150;
  bool ty1b = true;
  int ty2 = abs(-x-y)*150;
  bool ty2b = true;
  if((x-y)<0){
    ty1b=false;
  }

  if(-x-y<0){
    ty2b=false;
  }
  if(mecanum){
    m_for(1,ty1,true^ty1b);
    m_for(2,ty2,true^ty2b); 
    m_for(3,ty2,false^ty2b);
    m_for(4,ty1,false^ty1b);
  }else{
    m_for(1,ty1,true^ty1b);
    m_for(2,ty2,true^ty2b); 
    m_for(3,ty1,false^ty1b);
    m_for(4,ty2,false^ty2b);
  }
}

void m_for(int num, int speed, bool fb) {
  int p = 0;
  if(fb){
    p = 1;
   
  }
  digitalWrite(moter_pin[num-1][1],p);
  analogWrite(moter_pin[num-1][0],speed);
}
