import type { Experiment } from '../types';

export const EXPERIMENTS: Experiment[] = [
  {
    id: 1,
    title: 'LED & DHT11 Temp/Humidity Sensor Interfacing',
    category: 'arduino',
    platform: 'Arduino',
    keyComponents: ['Arduino Uno', 'LED', 'DHT11', 'Resistor (220Ω)'],
    description: 'Monitor environment temperature and humidity. If the temperature exceeds 28°C, the warning LED will turn ON.',
    tips: [
      'Use the DHT11 temperature slider in the controls panel to simulate temperature changes.',
      'Check the Serial Monitor to see the current temperature and humidity readings log in real-time.',
      'Verify that the LED anode is connected to D13 through a 220Ω resistor to prevent burn-out.'
    ],
    buildSteps: [
      'Place Arduino Uno R3 and Breadboard on the workspace.',
      'Connect Arduino 5V pin to Breadboard bottom red rail (+) with a Red wire.',
      'Connect Arduino GND pin to Breadboard bottom black rail (-) with a Black wire.',
      'Place the Red LED on Breadboard (Anode to hole A6, Cathode to bottom black rail).',
      'Place a 220Ω Resistor connecting hole E6 to hole E10.',
      'Connect a Blue wire from Arduino digital pin D13 to Resistor terminal pin1 (hole E10).',
      'Place the DHT11 sensor (VCC to red rail, GND to black rail, DATA to Arduino D2).'
    ],
    defaultCode: `// Experiment 1: LED & DHT11 Sensor Interfacing
int ledPin = 13;
int dhtPin = 2;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(dhtPin, INPUT);
  Serial.begin(9600);
  Serial.println("DHT11 System Initialized");
}

void loop() {
  // Read simulated sensor inputs from controls
  int temp = temperature;
  int hum = humidity;

  Serial.print("Temp: ");
  Serial.print(temp);
  Serial.print(" C, Humidity: ");
  Serial.print(hum);
  Serial.println(" %");

  if (temp > 28) {
    digitalWrite(ledPin, HIGH);
    Serial.println("ALERT: High Temp! LED ON");
  } else {
    digitalWrite(ledPin, LOW);
  }

  delay(2000);
}`,
    defaultComponents: [
      { id: 'uno_1', type: 'arduino', name: 'Arduino Uno R3', x: 40, y: 40, rotation: 0, properties: {} },
      { id: 'breadboard_1', type: 'breadboard', name: 'Breadboard', x: 320, y: 40, rotation: 0, properties: {} },
      { id: 'led_1', type: 'led', name: 'Red LED', x: 450, y: 120, rotation: 0, properties: { color: 'red' } },
      { id: 'resistor_1', type: 'resistor', name: 'Resistor', x: 380, y: 155, rotation: 0, properties: { resistance: 220 } },
      { id: 'dht_1', type: 'dht11', name: 'DHT11 Sensor', x: 600, y: 120, rotation: 0, properties: { temperature: 24, humidity: 45 } }
    ],
    defaultWires: [
      // Arduino Power & GND to Breadboard
      { id: 'w1', fromComponentId: 'uno_1', fromPinId: '5V', toComponentId: 'breadboard_1', toPinId: 'rail_bot_pos_5', color: 'red' },
      { id: 'w2', fromComponentId: 'uno_1', fromPinId: 'GND_P1', toComponentId: 'breadboard_1', toPinId: 'rail_bot_neg_5', color: 'black' },
      
      // LED & Resistor Connections
      { id: 'w3', fromComponentId: 'uno_1', fromPinId: 'D13', toComponentId: 'breadboard_1', toPinId: 'hole_A_6', color: 'blue' },
      { id: 'w4', fromComponentId: 'breadboard_1', fromPinId: 'hole_E_6', toComponentId: 'resistor_1', toPinId: 'pin1', color: 'blue' },
      { id: 'w5', fromComponentId: 'resistor_1', fromPinId: 'pin2', toComponentId: 'led_1', toPinId: 'anode', color: 'blue' },
      { id: 'w6', fromComponentId: 'led_1', fromPinId: 'cathode', toComponentId: 'breadboard_1', toPinId: 'rail_bot_neg_10', color: 'black' },

      // DHT11 Connections
      { id: 'w7', fromComponentId: 'dht_1', fromPinId: 'vcc', toComponentId: 'breadboard_1', toPinId: 'rail_bot_pos_20', color: 'red' },
      { id: 'w8', fromComponentId: 'dht_1', fromPinId: 'gnd', toComponentId: 'breadboard_1', toPinId: 'rail_bot_neg_20', color: 'black' },
      { id: 'w9', fromComponentId: 'dht_1', fromPinId: 'data', toComponentId: 'uno_1', toPinId: 'D2', color: 'green' }
    ]
  },
  {
    id: 2,
    title: 'Ultrasonic Sensor & PIR Sensor Interfacing',
    category: 'arduino',
    platform: 'Arduino',
    keyComponents: ['Arduino Uno', 'HC-SR04', 'PIR Sensor'],
    description: 'Combine motion detection with distance measurements to form an smart security checking circuit.',
    tips: [
      'PIR sensor checks if motion is triggered. Use the toggle button in the controls panel.',
      'HC-SR04 sensor measures distance. Adjust the distance slider (0-400 cm) in the controls panel.',
      'If motion is detected and the object is closer than 50cm, a security warning is logged.'
    ],
    buildSteps: [
      'Place Arduino Uno R3 and components on the workspace canvas.',
      'Connect HC-SR04 VCC (Red wire) to Arduino 5V and GND (Black wire) to Arduino GND.',
      'Connect HC-SR04 TRIG pin to Arduino digital pin D3 (Orange wire).',
      'Connect HC-SR04 ECHO pin to Arduino digital pin D4 (Yellow wire).',
      'Connect PIR sensor VCC (Red wire) to Arduino 5V and GND (Black wire) to Arduino GND.',
      'Connect PIR sensor OUT pin to Arduino digital pin D2 (Green wire).'
    ],
    defaultCode: `// Experiment 2: Ultrasonic & PIR security check
int pirPin = 2;
int trigPin = 3;
int echoPin = 4;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
  Serial.println("Security Scanner Online...");
}

void loop() {
  int motion = digitalRead(pirPin); // Reads logic state from PIR OUT
  int dist = distance;              // Reads simulated range

  Serial.print("Motion: ");
  Serial.print(motion);
  Serial.print(" | Range: ");
  Serial.print(dist);
  Serial.println(" cm");

  if (motion == 1 && dist < 50) {
    Serial.println("WARNING: Intruder Detected close by!");
  } else if (motion == 1) {
    Serial.println("Notice: Motion detected at safe distance.");
  }

  delay(1500);
}`,
    defaultComponents: [
      { id: 'uno_1', type: 'arduino', name: 'Arduino Uno', x: 40, y: 40, rotation: 0, properties: {} },
      { id: 'ultrasonic_1', type: 'hc_sr04', name: 'HC-SR04 Sensor', x: 350, y: 60, rotation: 0, properties: { distance: 60 } },
      { id: 'pir_1', type: 'pir_sensor', name: 'PIR Sensor', x: 500, y: 150, rotation: 0, properties: { motion: false } }
    ],
    defaultWires: [
      { id: 'w1', fromComponentId: 'uno_1', fromPinId: '5V', toComponentId: 'ultrasonic_1', toPinId: 'vcc', color: 'red' },
      { id: 'w2', fromComponentId: 'uno_1', fromPinId: 'GND_P1', toComponentId: 'ultrasonic_1', toPinId: 'gnd', color: 'black' },
      { id: 'w3', fromComponentId: 'uno_1', fromPinId: 'D3', toComponentId: 'ultrasonic_1', toPinId: 'trig', color: 'orange' },
      { id: 'w4', fromComponentId: 'uno_1', fromPinId: 'D4', toComponentId: 'ultrasonic_1', toPinId: 'echo', color: 'yellow' },
      
      { id: 'w5', fromComponentId: 'uno_1', fromPinId: '5V', toComponentId: 'pir_1', toPinId: 'vcc', color: 'red' },
      { id: 'w6', fromComponentId: 'uno_1', fromPinId: 'GND_P2', toComponentId: 'pir_1', toPinId: 'gnd', color: 'black' },
      { id: 'w7', fromComponentId: 'uno_1', fromPinId: 'D2', toComponentId: 'pir_1', toPinId: 'out', color: 'green' }
    ]
  },
  {
    id: 3,
    title: 'Traffic Light Simulator',
    category: 'arduino',
    platform: 'Arduino',
    keyComponents: ['Arduino Uno', 'Red/Yellow/Green LEDs', '3x 220Ω Resistors'],
    description: 'Simulate a traffic light intersection sequences (Red -> Green -> Yellow -> Red) with adjustable cycle delays.',
    tips: [
      'LEDs are connected to digital pins 10 (Red), 11 (Yellow), and 12 (Green).',
      'The simulation animates the LEDs glowing bright based on digital logic states.',
      'Change delay variables in the code editor to speed up or slow down the sequence.'
    ],
    buildSteps: [
      'Place Arduino Uno R3 and Breadboard on the workspace.',
      'Connect Arduino GND to Breadboard bottom black rail (-) with a Black wire.',
      'Place Red, Yellow, and Green LEDs on the breadboard spaced out.',
      'Place three 220Ω Resistors connecting each LED Cathode pin to the black GND rail.',
      'Connect Arduino digital pin D10 to the Red LED Anode pin (Red wire).',
      'Connect Arduino digital pin D11 to the Yellow LED Anode pin (Yellow wire).',
      'Connect Arduino digital pin D12 to the Green LED Anode pin (Green wire).'
    ],
    defaultCode: `// Experiment 3: Traffic Light System
int redLED = 10;
int yellowLED = 11;
int greenLED = 12;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Traffic Lights Starting...");
}

void loop() {
  // Red State
  Serial.println("State: RED - STOP!");
  digitalWrite(redLED, HIGH);
  digitalWrite(yellowLED, LOW);
  digitalWrite(greenLED, LOW);
  delay(3000);

  // Green State
  Serial.println("State: GREEN - GO!");
  digitalWrite(redLED, LOW);
  digitalWrite(yellowLED, LOW);
  digitalWrite(greenLED, HIGH);
  delay(3000);

  // Yellow State
  Serial.println("State: YELLOW - CAUTION!");
  digitalWrite(redLED, LOW);
  digitalWrite(yellowLED, HIGH);
  digitalWrite(greenLED, LOW);
  delay(1000);
}`,
    defaultComponents: [
      { id: 'uno_1', type: 'arduino', name: 'Arduino Uno R3', x: 40, y: 40, rotation: 0, properties: {} },
      { id: 'breadboard_1', type: 'breadboard', name: 'Breadboard', x: 320, y: 40, rotation: 0, properties: {} },
      { id: 'led_red', type: 'led', name: 'Red LED', x: 380, y: 100, rotation: 0, properties: { color: 'red' } },
      { id: 'led_yellow', type: 'led', name: 'Yellow LED', x: 440, y: 100, rotation: 0, properties: { color: 'yellow' } },
      { id: 'led_green', type: 'led', name: 'Green LED', x: 500, y: 100, rotation: 0, properties: { color: 'green' } },
      { id: 'res_red', type: 'resistor', name: '220Ω', x: 380, y: 180, rotation: 90, properties: { resistance: 220 } },
      { id: 'res_yellow', type: 'resistor', name: '220Ω', x: 440, y: 180, rotation: 90, properties: { resistance: 220 } },
      { id: 'res_green', type: 'resistor', name: '220Ω', x: 500, y: 180, rotation: 90, properties: { resistance: 220 } }
    ],
    defaultWires: [
      // Control Wires
      { id: 'w1', fromComponentId: 'uno_1', fromPinId: 'D10', toComponentId: 'res_red', toPinId: 'pin1', color: 'red' },
      { id: 'w2', fromComponentId: 'uno_1', fromPinId: 'D11', toComponentId: 'res_yellow', toPinId: 'pin1', color: 'yellow' },
      { id: 'w3', fromComponentId: 'uno_1', fromPinId: 'D12', toComponentId: 'res_green', toPinId: 'pin1', color: 'green' },
      
      // Resistors to Anodes
      { id: 'w4', fromComponentId: 'res_red', fromPinId: 'pin2', toComponentId: 'led_red', toPinId: 'anode', color: 'red' },
      { id: 'w5', fromComponentId: 'res_yellow', fromPinId: 'pin2', toComponentId: 'led_yellow', toPinId: 'anode', color: 'yellow' },
      { id: 'w6', fromComponentId: 'res_green', fromPinId: 'pin2', toComponentId: 'led_green', toPinId: 'anode', color: 'green' },
      
      // Cathodes to Common GND
      { id: 'w7', fromComponentId: 'uno_1', fromPinId: 'GND_P1', toComponentId: 'breadboard_1', toPinId: 'rail_bot_neg_10', color: 'black' },
      { id: 'w8', fromComponentId: 'led_red', fromPinId: 'cathode', toComponentId: 'breadboard_1', toPinId: 'rail_bot_neg_8', color: 'black' },
      { id: 'w9', fromComponentId: 'led_yellow', fromPinId: 'cathode', toComponentId: 'breadboard_1', toPinId: 'rail_bot_neg_12', color: 'black' },
      { id: 'w10', fromComponentId: 'led_green', fromPinId: 'cathode', toComponentId: 'breadboard_1', toPinId: 'rail_bot_neg_16', color: 'black' }
    ]
  },
  {
    id: 4,
    title: 'Water Flow Detection using Arduino',
    category: 'arduino',
    platform: 'Arduino',
    keyComponents: ['Arduino Uno', 'YF-S201 Water Flow Sensor'],
    description: 'Measures liquid flow velocity and computes total water volume passing through the pipeline.',
    tips: [
      'The flow sensor spins an internal rotor containing a magnet that activates a hall effect sensor.',
      'Adjust the Flow Rate slider in the control panel to simulate faster flow speeds.',
      'The code reads pulses from Pin 2 using virtual interrupts to compute L/hour flow rate.'
    ],
    buildSteps: [
      'Place Arduino Uno R3 and the YF-S201 Water Flow Sensor.',
      'Connect YF-S201 VCC terminal (Red wire) to Arduino 5V.',
      'Connect YF-S201 GND terminal (Black wire) to Arduino GND.',
      'Connect YF-S201 OUT signal terminal (Yellow wire) to Arduino digital pin D2.'
    ],
    defaultCode: `// Experiment 4: Water Flow Detector
int sensorPin = 2;

void setup() {
  pinMode(sensorPin, INPUT);
  Serial.begin(9600);
  Serial.println("Flow Meter Activated.");
}

void loop() {
  // Read flow sensor value in L/min from control panel slider
  float flow = flowRateInput; 

  Serial.print("Current Flow Rate: ");
  Serial.print(flow);
  Serial.println(" L/min");

  if (flow > 8.0) {
    Serial.println("WARNING: High flow rate detected!");
  }

  delay(2000);
}`,
    defaultComponents: [
      { id: 'uno_1', type: 'arduino', name: 'Arduino Uno R3', x: 50, y: 50, rotation: 0, properties: {} },
      { id: 'flow_1', type: 'yf_s201', name: 'YF-S201 Flow Sensor', x: 380, y: 100, rotation: 0, properties: { flowRate: 5.0 } }
    ],
    defaultWires: [
      { id: 'w1', fromComponentId: 'uno_1', fromPinId: '5V', toComponentId: 'flow_1', toPinId: 'vcc', color: 'red' },
      { id: 'w2', fromComponentId: 'uno_1', fromPinId: 'GND_P1', toComponentId: 'flow_1', toPinId: 'gnd', color: 'black' },
      { id: 'w3', fromComponentId: 'uno_1', fromPinId: 'D2', toComponentId: 'flow_1', toPinId: 'out', color: 'yellow' }
    ]
  },
  {
    id: 5,
    title: 'LED & Push Button with Raspberry Pi',
    category: 'raspberry-pi',
    platform: 'Raspberry Pi',
    keyComponents: ['Raspberry Pi Pico', 'LED', 'Push Button', '10kΩ Pull-down Resistor'],
    description: 'Toggle the state of a GPIO output pin (LED) by polling a GPIO input pin connected to a tactile push button.',
    tips: [
      'Uses Python programming style structure.',
      'Pin GP0 controls the LED. Pin GP1 reads the Push Button status.',
      'Click the Push Button in the simulation to trigger logic state updates.'
    ],
    buildSteps: [
      'Place Raspberry Pi Pico, Breadboard, LED, and Push Button on the workspace.',
      'Connect RPi Pico GP0 to the LED Anode (+).',
      'Connect LED Cathode (-) to RPi Pico GND.',
      'Connect RPi Pico VBUS (5V) to Push Button Pin 1A.',
      'Connect Push Button Pin 1B to RPi Pico GP1.'
    ],
    defaultCode: `# Experiment 5: RPi LED & Button Toggle
import time

# Mock GPIO bindings
LED_PIN = "GP0"
BUTTON_PIN = "GP1"

print("Starting Raspberry Pi GPIO script...")

# Main Loop
while True:
    # Read button input from connectivity net state
    button_pressed = GPIO.input(BUTTON_PIN)
    
    if button_pressed == 1:
        print("Button pressed -> LED ON")
        GPIO.output(LED_PIN, HIGH)
    else:
        GPIO.output(LED_PIN, LOW)
        
    time.sleep(0.1)`,
    defaultComponents: [
      { id: 'rpi_1', type: 'raspberry_pi', name: 'Raspberry Pi Pico', x: 40, y: 50, rotation: 0, properties: {} },
      { id: 'breadboard_1', type: 'breadboard', name: 'Breadboard', x: 320, y: 40, rotation: 0, properties: {} },
      { id: 'led_1', type: 'led', name: 'LED', x: 380, y: 100, rotation: 0, properties: { color: 'blue' } },
      { id: 'button_1', type: 'push_button', name: 'Push Button', x: 500, y: 100, rotation: 0, properties: {} }
    ],
    defaultWires: [
      { id: 'w1', fromComponentId: 'rpi_1', fromPinId: 'GP0', toComponentId: 'led_1', toPinId: 'anode', color: 'blue' },
      { id: 'w2', fromComponentId: 'led_1', fromPinId: 'cathode', toComponentId: 'rpi_1', toPinId: 'GND_1', color: 'black' },
      
      { id: 'w3', fromComponentId: 'rpi_1', fromPinId: 'VBUS', toComponentId: 'button_1', toPinId: 'pin1a', color: 'red' },
      { id: 'w4', fromComponentId: 'button_1', fromPinId: 'pin1b', toComponentId: 'rpi_1', toPinId: 'GP1', color: 'green' }
    ]
  },
  {
    id: 6,
    title: 'Motion Sensor Alarm using PIR',
    category: 'arduino',
    platform: 'Arduino',
    keyComponents: ['Arduino Uno', 'PIR Sensor', 'Piezo Buzzer'],
    description: 'Trigger a security alarm when motion is detected. Sound a piezo buzzer and flash an indicator.',
    tips: [
      'PIR sensor outputs HIGH logic when movement is detected.',
      'Piezo buzzer connects to D3. When activated, sound waves animate.',
      'Simulate motion using the checkbox in the slider panel.'
    ],
    buildSteps: [
      'Place Arduino Uno R3, PIR sensor, and Piezo Buzzer on the workspace.',
      'Connect PIR VCC to Arduino 5V, and GND to Arduino GND.',
      'Connect PIR OUT pin to Arduino digital pin D2 (Green wire).',
      'Connect Buzzer positive (+) terminal to Arduino digital pin D3 (Orange wire).',
      'Connect Buzzer negative (-) terminal to Arduino GND (Black wire).'
    ],
    defaultCode: `// Experiment 6: Motion Sensor Alarm
int pirPin = 2;
int buzzerPin = 3;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Alarm System Activated");
}

void loop() {
  int motion = digitalRead(pirPin); // reads logic output from PIR sensor

  if (motion == 1) {
    Serial.println("ALERT! Motion detected! Sounding Buzzer!");
    digitalWrite(buzzerPin, HIGH);
    delay(200);
    digitalWrite(buzzerPin, LOW);
    delay(200);
  } else {
    digitalWrite(buzzerPin, LOW);
    delay(1000);
  }
}`,
    defaultComponents: [
      { id: 'uno_1', type: 'arduino', name: 'Arduino Uno R3', x: 50, y: 50, rotation: 0, properties: {} },
      { id: 'pir_1', type: 'pir_sensor', name: 'PIR Sensor', x: 380, y: 60, rotation: 0, properties: { motion: false } },
      { id: 'buzzer_1', type: 'buzzer', name: 'Buzzer', x: 500, y: 150, rotation: 0, properties: {} }
    ],
    defaultWires: [
      { id: 'w1', fromComponentId: 'uno_1', fromPinId: '5V', toComponentId: 'pir_1', toPinId: 'vcc', color: 'red' },
      { id: 'w2', fromComponentId: 'uno_1', fromPinId: 'GND_P1', toComponentId: 'pir_1', toPinId: 'gnd', color: 'black' },
      { id: 'w3', fromComponentId: 'uno_1', fromPinId: 'D2', toComponentId: 'pir_1', toPinId: 'out', color: 'green' },
      
      { id: 'w4', fromComponentId: 'uno_1', fromPinId: 'D3', toComponentId: 'buzzer_1', toPinId: 'positive', color: 'orange' },
      { id: 'w5', fromComponentId: 'uno_1', fromPinId: 'GND_P2', toComponentId: 'buzzer_1', toPinId: 'negative', color: 'black' }
    ]
  },
  {
    id: 7,
    title: 'DHT11 with Raspberry Pi',
    category: 'raspberry-pi',
    platform: 'Raspberry Pi',
    keyComponents: ['Raspberry Pi Pico', 'DHT11 Sensor'],
    description: 'Interface the DHT11 digital humidity and temperature sensor with Raspberry Pi Pico using Python.',
    tips: [
      'We use the MicroPython structure to poll the DHT11 data pin.',
      'Adjust the temperature and humidity sliders in the control panel to see the logs adjust.',
      'If temperature goes above 30°C, a cooling fan warning is printed.'
    ],
    buildSteps: [
      'Place Raspberry Pi Pico and DHT11 Temperature Sensor.',
      'Connect DHT11 VCC pin to RPi Pico 3.3V OUT (Red wire).',
      'Connect DHT11 GND pin to RPi Pico GND (Black wire).',
      'Connect DHT11 DATA pin to RPi Pico GP4 (Green wire).'
    ],
    defaultCode: `# Experiment 7: DHT11 and Raspberry Pi Pico
import time

DHT_PIN = "GP4"
print("Initializing DHT11 Sensor...")

while True:
    # Read simulated temperature and humidity variables
    temp = temperature
    hum = humidity

    print("Temp: " + str(temp) + "C, Humidity: " + str(hum) + "%")

    if temp > 30:
        print("CRITICAL: Hot room! Turn on AC")
    
    time.sleep(2.0)`,
    defaultComponents: [
      { id: 'rpi_1', type: 'raspberry_pi', name: 'Raspberry Pi Pico', x: 50, y: 50, rotation: 0, properties: {} },
      { id: 'dht_1', type: 'dht11', name: 'DHT11 Sensor', x: 380, y: 60, rotation: 0, properties: { temperature: 22, humidity: 50 } }
    ],
    defaultWires: [
      { id: 'w1', fromComponentId: 'rpi_1', fromPinId: '3.3V_OUT', toComponentId: 'dht_1', toPinId: 'vcc', color: 'red' },
      { id: 'w2', fromComponentId: 'rpi_1', fromPinId: 'GND_1', toComponentId: 'dht_1', toPinId: 'gnd', color: 'black' },
      { id: 'w3', fromComponentId: 'rpi_1', fromPinId: 'GP4', toComponentId: 'dht_1', toPinId: 'data', color: 'green' }
    ]
  },
  {
    id: 8,
    title: 'DS18B20 Temperature Sensor with RPi',
    category: 'raspberry-pi',
    platform: 'Raspberry Pi',
    keyComponents: ['Raspberry Pi Pico', 'DS18B20 Temp Probe', '4.7kΩ Pull-up Resistor'],
    description: 'Interfacing the 1-Wire DS18B20 waterproof temperature sensor with Raspberry Pi.',
    tips: [
      'The DS18B20 uses the unique 1-wire protocol, allowing multiple probes on a single data wire.',
      'A 4.7kΩ pull-up resistor is required between VCC and DATA pins for signal stability.',
      'Adjust the temperature probe slider in the controls sidebar to alter values.'
    ],
    buildSteps: [
      'Place Raspberry Pi Pico, Breadboard, DS18B20 sensor, and 4.7kΩ Resistor.',
      'Connect DS18B20 VCC pin to RPi Pico 3.3V OUT (Red wire).',
      'Connect DS18B20 GND pin to RPi Pico GND (Black wire).',
      'Connect DS18B20 DQ (Data) pin to RPi Pico GP4 (Green wire).',
      'Connect the 4.7kΩ Resistor bridging VCC and DQ pin (essential pull-up Resistor).'
    ],
    defaultCode: `# Experiment 8: RPi with DS18B20
import time

DS_PIN = "GP4"
print("Searching for 1-Wire devices...")
print("Found DS18B20 device with address: 28-0000067ff2a")

while True:
    # Query simulated temperature probe
    temp = tempProbe
    
    print("DS18B20 Temperature: " + str(temp) + " C")
    
    if temp > 40:
      print("HIGH TEMP WARNING: Liquid boiling!")

    time.sleep(2.0)`,
    defaultComponents: [
      { id: 'rpi_1', type: 'raspberry_pi', name: 'Raspberry Pi Pico', x: 50, y: 50, rotation: 0, properties: {} },
      { id: 'breadboard_1', type: 'breadboard', name: 'Breadboard', x: 320, y: 40, rotation: 0, properties: {} },
      { id: 'ds18b20_1', type: 'ds18b20', name: 'DS18B20 Sensor', x: 400, y: 100, rotation: 0, properties: { temperature: 25 } },
      { id: 'resistor_1', type: 'resistor', name: '4.7kΩ Resistor', x: 500, y: 150, rotation: 90, properties: { resistance: 4700 } }
    ],
    defaultWires: [
      // DS18B20 Power
      { id: 'w1', fromComponentId: 'rpi_1', fromPinId: '3.3V_OUT', toComponentId: 'ds18b20_1', toPinId: 'vcc', color: 'red' },
      { id: 'w2', fromComponentId: 'rpi_1', fromPinId: 'GND_1', toComponentId: 'ds18b20_1', toPinId: 'gnd', color: 'black' },
      { id: 'w3', fromComponentId: 'rpi_1', fromPinId: 'GP4', toComponentId: 'ds18b20_1', toPinId: 'dq', color: 'green' },
      
      // 4.7k Pullup resistor between VCC and Data pin
      { id: 'w4', fromComponentId: 'ds18b20_1', fromPinId: 'vcc', toComponentId: 'resistor_1', toPinId: 'pin1', color: 'red' },
      { id: 'w5', fromComponentId: 'ds18b20_1', fromPinId: 'dq', toComponentId: 'resistor_1', toPinId: 'pin2', color: 'green' }
    ]
  },
  {
    id: 9,
    title: 'DC & Stepper Motor Control with RPi',
    category: 'raspberry-pi',
    platform: 'Raspberry Pi',
    keyComponents: ['Raspberry Pi Pico', 'L298N Motor Driver', 'DC Motor', 'Stepper Motor'],
    description: 'Use the dual H-Bridge driver to control rotation speed of a DC motor and steps/angle of a Stepper motor.',
    tips: [
      'The L298N driver board handles the power switching for high current inductive loads (motors).',
      'During simulation run, the motors will spin visually representing their speed/direction.',
      'Control inputs GP8-GP11 configure stepping phases while GP12-GP13 control DC direction.'
    ],
    buildSteps: [
      'Place RPi Pico, L298N Driver, DC Motor, and Stepper Motor.',
      'Connect RPi Pico VBUS to L298N 12V terminal, and GND to L298N GND.',
      'Connect L298N OUT1 & OUT2 to the DC Motor terminals.',
      'Connect L298N OUT3 & OUT4 to the Stepper Motor phase wires.',
      'Connect RPi Pico GP12 to L298N IN1, and GP13 to IN2.'
    ],
    defaultCode: `# Experiment 9: DC & Stepper Motor Driver
import time

# Pin outputs
IN1 = "GP12"
IN2 = "GP13"

print("Initializing Motor Controller...")

while True:
    print("Spinning DC Motor Clockwise...")
    GPIO.output(IN1, HIGH)
    GPIO.output(IN2, LOW)
    time.sleep(2.0)
    
    print("Braking DC Motor...")
    GPIO.output(IN1, LOW)
    GPIO.output(IN2, LOW)
    time.sleep(1.0)
    
    print("Spinning DC Motor Counter-Clockwise...")
    GPIO.output(IN1, LOW)
    GPIO.output(IN2, HIGH)
    time.sleep(2.0)`,
    defaultComponents: [
      { id: 'rpi_1', type: 'raspberry_pi', name: 'Raspberry Pi Pico', x: 40, y: 50, rotation: 0, properties: {} },
      { id: 'l298n_1', type: 'l298n', name: 'L298N Driver', x: 320, y: 50, rotation: 0, properties: {} },
      { id: 'dc_1', type: 'dc_motor', name: 'DC Motor', x: 460, y: 20, rotation: 0, properties: {} },
      { id: 'stepper_1', type: 'stepper_motor', name: 'Stepper Motor', x: 460, y: 130, rotation: 0, properties: {} }
    ],
    defaultWires: [
      // DC Motor lines
      { id: 'w1', fromComponentId: 'l298n_1', fromPinId: 'out1', toComponentId: 'dc_1', toPinId: 't1', color: 'blue' },
      { id: 'w2', fromComponentId: 'l298n_1', fromPinId: 'out2', toComponentId: 'dc_1', toPinId: 't2', color: 'blue' },
      
      // Control signals RPi -> Driver
      { id: 'w3', fromComponentId: 'rpi_1', fromPinId: 'GP12', toComponentId: 'l298n_1', toPinId: 'in1', color: 'green' },
      { id: 'w4', fromComponentId: 'rpi_1', fromPinId: 'GP13', toComponentId: 'l298n_1', toPinId: 'in2', color: 'yellow' },
      
      // Stepper motor lines
      { id: 'w5', fromComponentId: 'l298n_1', fromPinId: 'out3', toComponentId: 'stepper_1', toPinId: 'a1', color: 'orange' },
      { id: 'w6', fromComponentId: 'l298n_1', fromPinId: 'out4', toComponentId: 'stepper_1', toPinId: 'a2', color: 'orange' },
      
      // Power rails
      { id: 'w7', fromComponentId: 'rpi_1', fromPinId: 'VBUS', toComponentId: 'l298n_1', toPinId: 'v12', color: 'red' },
      { id: 'w8', fromComponentId: 'rpi_1', fromPinId: 'GND_1', toComponentId: 'l298n_1', toPinId: 'gnd', color: 'black' }
    ]
  },
  {
    id: 10,
    title: 'Home Automation with Raspberry Pi',
    category: 'raspberry-pi',
    platform: 'Raspberry Pi',
    keyComponents: ['Raspberry Pi Pico', '5V Relay Module'],
    description: 'Construct a smart light controller. Power an external bulb through a high-voltage isolation relay.',
    tips: [
      'A relay isolates the micro-controller logic from high-voltage main circuits.',
      'We simulate a Virtual Flask Server UI. An interactive HTML panel lights up during simulation!',
      'Set relay logic GP2 to HIGH to actuate the switch (a click sound will emit and light turns ON).'
    ],
    buildSteps: [
      'Place RPi Pico and the 5V Relay Module.',
      'Connect Relay Module VCC pin to RPi Pico VBUS (5V).',
      'Connect Relay Module GND pin to RPi Pico GND.',
      'Connect Relay Module IN (Signal) pin to RPi Pico GP2.'
    ],
    defaultCode: `# Experiment 10: Smart Home Server
import time

RELAY_PIN = "GP2"
print("Home Automation Server running on http://192.168.1.15:5000")

while True:
    # Read virtual Flask dashboard toggle value from user
    flask_switch = flaskToggleInput
    
    if flask_switch == 1:
        print("Flask Event: Turn ON living room light")
        GPIO.output(RELAY_PIN, HIGH)
    else:
        GPIO.output(RELAY_PIN, LOW)
        
    time.sleep(0.5)`,
    defaultComponents: [
      { id: 'rpi_1', type: 'raspberry_pi', name: 'Raspberry Pi Pico', x: 50, y: 50, rotation: 0, properties: {} },
      { id: 'relay_1', type: 'relay', name: 'Relay Module', x: 380, y: 60, rotation: 0, properties: { state: false } }
    ],
    defaultWires: [
      { id: 'w1', fromComponentId: 'rpi_1', fromPinId: 'VBUS', toComponentId: 'relay_1', toPinId: 'vcc', color: 'red' },
      { id: 'w2', fromComponentId: 'rpi_1', fromPinId: 'GND_1', toComponentId: 'relay_1', toPinId: 'gnd', color: 'black' },
      { id: 'w3', fromComponentId: 'rpi_1', fromPinId: 'GP2', toComponentId: 'relay_1', toPinId: 'in', color: 'green' }
    ]
  },
  {
    id: 11,
    title: 'Smart Traffic Light Controller',
    category: 'arduino',
    platform: 'Arduino',
    keyComponents: ['Arduino Uno', 'Red/Yellow/Green LEDs', 'HC-SR04 Sensor'],
    description: 'Build an adaptive traffic light system. Changes timing cycles dynamically when cars (density) are detected.',
    tips: [
      'The HC-SR04 acts as a vehicle presence detector.',
      'Adjust the distance slider in the controls. If distance < 30cm (car waiting), the green light sequence triggers immediately.',
      'If no cars are detected, the system stays on a default energy-saving sequence.'
    ],
    buildSteps: [
      'Place Arduino Uno R3, Ultrasonic presence sensor, and Red & Green LEDs.',
      'Connect Ultrasonic sensor VCC to Arduino 5V, and GND to Arduino GND.',
      'Connect presence sensor TRIG to Arduino pin D3, and ECHO to pin D4.',
      'Connect Red LED Anode to Arduino D10, and Cathode to GND.',
      'Connect Green LED Anode to Arduino D12, and Cathode to GND.'
    ],
    defaultCode: `// Experiment 11: Smart Traffic Control
int trigPin = 3;
int echoPin = 4;
int redPin = 10;
int greenPin = 12;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Adaptive Traffic Light Active");
}

void loop() {
  int carDist = distance; // reads simulated vehicle range

  Serial.print("Vehicle Distance: ");
  Serial.print(carDist);
  Serial.println(" cm");

  if (carDist < 30) {
    Serial.println("Car Detected! Override: GREEN Light active");
    digitalWrite(redPin, LOW);
    digitalWrite(greenPin, HIGH);
  } else {
    Serial.println("Empty Lane: RED Light active");
    digitalWrite(redPin, HIGH);
    digitalWrite(greenPin, LOW);
  }

  delay(2000);
}`,
    defaultComponents: [
      { id: 'uno_1', type: 'arduino', name: 'Arduino Uno R3', x: 50, y: 50, rotation: 0, properties: {} },
      { id: 'ultrasonic_1', type: 'hc_sr04', name: 'Lane Scanner', x: 380, y: 60, rotation: 0, properties: { distance: 60 } },
      { id: 'led_red', type: 'led', name: 'Stop Light', x: 520, y: 40, rotation: 0, properties: { color: 'red' } },
      { id: 'led_green', type: 'led', name: 'Go Light', x: 520, y: 120, rotation: 0, properties: { color: 'green' } }
    ],
    defaultWires: [
      { id: 'w1', fromComponentId: 'uno_1', fromPinId: '5V', toComponentId: 'ultrasonic_1', toPinId: 'vcc', color: 'red' },
      { id: 'w2', fromComponentId: 'uno_1', fromPinId: 'GND_P1', toComponentId: 'ultrasonic_1', toPinId: 'gnd', color: 'black' },
      { id: 'w3', fromComponentId: 'uno_1', fromPinId: 'D3', toComponentId: 'ultrasonic_1', toPinId: 'trig', color: 'orange' },
      { id: 'w4', fromComponentId: 'uno_1', fromPinId: 'D4', toComponentId: 'ultrasonic_1', toPinId: 'echo', color: 'yellow' },
      
      { id: 'w5', fromComponentId: 'uno_1', fromPinId: 'D10', toComponentId: 'led_red', toPinId: 'anode', color: 'red' },
      { id: 'w6', fromComponentId: 'led_red', fromPinId: 'cathode', toComponentId: 'uno_1', toPinId: 'GND_P2', color: 'black' },
      
      { id: 'w7', fromComponentId: 'uno_1', fromPinId: 'D12', toComponentId: 'led_green', toPinId: 'anode', color: 'green' },
      { id: 'w8', fromComponentId: 'led_green', fromPinId: 'cathode', toComponentId: 'uno_1', toPinId: 'GND_P2', color: 'black' }
    ]
  },
  {
    id: 12,
    title: 'Smart Health Monitoring System',
    category: 'arduino',
    platform: 'Arduino',
    keyComponents: ['Arduino Uno', 'Pulse Sensor', 'LM35 Temperature Sensor'],
    description: 'Aggregate pulse beats (BPM) and body temperature, pushing readings to a visual ThingSpeak Cloud Widget.',
    tips: [
      'The pulse sensor reads micro-changes in light refraction to determine heartbeat (BPM).',
      'The LM35 outputs analog millivolts proportional to body temperature (10mV/°C).',
      'When running, the ThingSpeak Cloud dashboard panel will plot virtual telemetry charts.'
    ],
    buildSteps: [
      'Place Arduino Uno R3, Pulse Heart Sensor, and LM35 Temperature Sensor.',
      'Connect Pulse Sensor VCC to Arduino 5V, GND to GND, and SIG to Arduino Analog A0.',
      'Connect LM35 VCC to Arduino 5V, GND to GND, and OUT to Arduino Analog A1.'
    ],
    defaultCode: `// Experiment 12: Smart Patient telemetry
int pulsePin = A0;
int tempPin = A1;

void setup() {
  Serial.begin(9600);
  Serial.println("ThingSpeak Patient Telemetry online...");
}

void loop() {
  // Read simulated analog values from connected inputs
  int bpm = analogRead(pulsePin);
  int temp = analogRead(tempPin);

  Serial.print("BPM: ");
  Serial.print(bpm);
  Serial.print(" | Body Temp: ");
  Serial.print(temp);
  Serial.println(" C");

  // Mock pushing to ThingSpeak IoT
  Serial.println("ThingSpeak API: Pushing Field1=BPM, Field2=Temp... Success!");

  delay(3000);
}`,
    defaultComponents: [
      { id: 'uno_1', type: 'arduino', name: 'Arduino Uno R3', x: 50, y: 50, rotation: 0, properties: {} },
      { id: 'pulse_1', type: 'pulse_sensor', name: 'Pulse Sensor', x: 380, y: 60, rotation: 0, properties: { bpm: 72 } },
      { id: 'lm35_1', type: 'lm35', name: 'LM35 Sensor', x: 500, y: 120, rotation: 0, properties: { temperature: 36 } }
    ],
    defaultWires: [
      // Pulse sensor wires
      { id: 'w1', fromComponentId: 'uno_1', fromPinId: '5V', toComponentId: 'pulse_1', toPinId: 'vcc', color: 'red' },
      { id: 'w2', fromComponentId: 'uno_1', fromPinId: 'GND_P1', toComponentId: 'pulse_1', toPinId: 'gnd', color: 'black' },
      { id: 'w3', fromComponentId: 'uno_1', fromPinId: 'A0', toComponentId: 'pulse_1', toPinId: 'sig', color: 'blue' },
      
      // LM35 wires
      { id: 'w4', fromComponentId: 'uno_1', fromPinId: '5V', toComponentId: 'lm35_1', toPinId: 'vcc', color: 'red' },
      { id: 'w5', fromComponentId: 'uno_1', fromPinId: 'GND_P2', toComponentId: 'lm35_1', toPinId: 'gnd', color: 'black' },
      { id: 'w6', fromComponentId: 'uno_1', fromPinId: 'A1', toComponentId: 'lm35_1', toPinId: 'out', color: 'orange' }
    ]
  },
  {
    id: 13,
    title: 'Custom Arduino Uno Sandbox (Blank Workspace)',
    category: 'arduino',
    platform: 'Arduino',
    keyComponents: ['Arduino Uno R3', 'Breadboard'],
    description: 'A completely blank canvas sandbox. Add components from the library, route wires, and write your own custom Arduino C++ code.',
    tips: [
      'Select the Component Library tab in the sidebar to add LEDs, resistors, buzzers, and sensors.',
      'Click on any pin/terminal and then click another to route a wire connection.',
      'Select any component to edit its properties (like LED color or resistor resistance) or delete it.'
    ],
    buildSteps: [
      'Drag and place components from the Library list.',
      'Click any pin to start drawing a wire, then click another pin to connect.',
      'Select a placed component to rename it, adjust its values, or delete it.',
      'Write custom setup() and loop() functions in the C++ editor, then run!'
    ],
    defaultCode: `// Arduino Custom Sandbox
int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Arduino Sandbox Initialized");
}

void loop() {
  // Write your code here
  
}`,
    defaultComponents: [
      { id: 'uno_1', type: 'arduino', name: 'Arduino Uno R3', x: 50, y: 70, rotation: 0, properties: {} },
      { id: 'breadboard_1', type: 'breadboard', name: 'Breadboard', x: 350, y: 70, rotation: 0, properties: {} }
    ],
    defaultWires: []
  },
  {
    id: 14,
    title: 'Custom Raspberry Pi Sandbox (Blank Workspace)',
    category: 'raspberry-pi',
    platform: 'Raspberry Pi',
    keyComponents: ['Raspberry Pi Pico', 'Breadboard'],
    description: 'A blank canvas sandbox for Python. Place microcontrollers, configure sensors/outputs, and write custom MicroPython scripts.',
    tips: [
      'Use the Component Library to add items onto the canvas.',
      'Click on ports to draw signal or power wires (red for power, black for GND).',
      'Select any component to rename or delete it, or adjust its resistance/colors.'
    ],
    buildSteps: [
      'Drag and place components from the Library list.',
      'Click any pin to start drawing a wire, then click another pin to connect.',
      'Select a placed component to rename it, adjust its values, or delete it.',
      'Write custom Python code in the editor, then run!'
    ],
    defaultCode: `# Raspberry Pi Pico Sandbox
import time
print("Pico Sandbox Initialized")

while True:
    time.sleep(1)
`,
    defaultComponents: [
      { id: 'rpi_1', type: 'raspberry_pi', name: 'Raspberry Pi Pico', x: 50, y: 110, rotation: 0, properties: {} },
      { id: 'breadboard_1', type: 'breadboard', name: 'Breadboard', x: 350, y: 70, rotation: 0, properties: {} }
    ],
    defaultWires: []
  }
];
