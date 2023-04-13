#include "esp_camera.h"
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22


WebSocketsClient webSocket ;

bool connected = false;
camera_fb_t * fb;
StaticJsonDocument<256> doc;
String data ;

void configCamera(){
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 9;
  config.fb_count = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
}

void liveCam(){
  //capture a frame
  fb = esp_camera_fb_get();
  if (!fb) {
      Serial.println("Frame buffer could not be acquired");
      return;
  }
  webSocket.sendBIN(fb->buf,fb->len);

  esp_camera_fb_return(fb);
}
void webSocketEvent( WStype_t type, uint8_t * payload, size_t length) {

    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("Wobsket Disconnected");
            connected = false;
            break;
        case WStype_CONNECTED:
            Serial.println("Wobsket Connected");
            connected = true;
            break;
        case WStype_TEXT:
          deserializeJson(doc, payload, length);
          data = doc["data"].as<String>();
          Serial.println("data : "+data);
          if (data == "liveStop"){
            connected = false;
          }else if(data == "liveStart"){
            connected = true;
          }
          break;
        case WStype_BIN:
          Serial.println();
          Serial.write(payload, length);
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
  Serial.begin(115200);
  WiFi.begin("U+NetD243", "4000000486");
  Serial.println("");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  String IP = WiFi.localIP().toString();
  Serial.print("IP address: " + IP);
  //webSocket.begin("34.125.119.133",80,"/","ipcam");
  webSocket.begin("sonorous-earth-377802.du.r.appspot.com",80,"/","ipcam");
  webSocket.onEvent(webSocketEvent);
  configCamera();
}
    

void loop() {

  webSocket.loop();
  if(connected == true){
    liveCam();
  }else{
    delay(500);
    webSocket.sendPing();
  }
}