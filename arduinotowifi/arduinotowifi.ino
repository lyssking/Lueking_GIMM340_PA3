#include <WiFiNINA.h>

//char ssid[] = "GIMM-Lab";
//char pass[] = "34cP0WwMjdKB71";

char ssid[] = "pretty_fly_4a_wifi";
char pass[] = "lukaang2016";

char server[] = "18.226.72.30";
const int SERVER_PORT = 3000;

const int TRIG_PIN = 9;
const int ECHO_PIN = 10;



WiFiClient client;

void setup() {
  Serial.begin(9600);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  Serial.println("Connecting to Wi-Fi...");

  while (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(ssid, pass);
    delay(5000);
  }

  Serial.println("Wi-Fi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    client.stop();
    WiFi.begin(ssid, pass);
    delay(5000);
    return;
  }

  float distanceCm;

  
  distanceCm = readDistanceCm();
  

  if (distanceCm < 0) {
    Serial.println("No valid distance reading.");
    delay(1000);
    return;
  }

  String jsonData = "{\"deviceId\":\"arduino-01\",\"distance_cm\":";
  jsonData += String(distanceCm, 2);
  jsonData += "}";

  client.stop();

  Serial.println("Connecting to server...");

  if (client.connect(server, SERVER_PORT)) {
    client.println("POST /api/sensor HTTP/1.1");

    client.print("Host: ");
    client.print(server);
    client.print(":");
    client.println(SERVER_PORT);

    client.println("Content-Type: application/json");

    client.print("Content-Length: ");
    client.println(jsonData.length());

    client.println("Connection: close");

    client.println();

    client.print(jsonData);

    Serial.print("Sent: ");
    Serial.println(jsonData);

    unsigned long started = millis();

    while (
      (client.connected() || client.available()) &&
      millis() - started < 5000UL
    ) {
      while (client.available()) {
        Serial.write(client.read());
      }

      delay(1);
    }

    client.stop();
    Serial.println();
  } else {
    Serial.println("Server connection failed.");
  }

 
  delay(10000);
}

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);

  digitalWrite(TRIG_PIN, LOW);

  unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000UL);

  if (duration == 0) {
    return -1;
  }

  return duration * 0.0343f / 2.0f;
}