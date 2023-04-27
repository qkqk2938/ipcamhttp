void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  pinMode(2,OUTPUT);
  pinMode(3,INPUT);
  pinMode(4,OUTPUT);
  pinMode(5,INPUT);
  pinMode(6,OUTPUT);
  pinMode(7,INPUT);
  pinMode(8,OUTPUT);
  pinMode(9,INPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  digitalWrite(2,(digitalRead(3)==HIGH)?LOW:HIGH);
  digitalWrite(4,(digitalRead(5)==HIGH)?LOW:HIGH);
  digitalWrite(6,(digitalRead(7)==HIGH)?LOW:HIGH);
  digitalWrite(8,(digitalRead(9)==HIGH)?LOW:HIGH);
}
