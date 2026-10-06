# ⚡ V-Lab Simulator (DSU Virtual Lab)

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-IDE-1E1E1E?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://microsoft.github.io/monaco-editor/)

An advanced, interactive browser-based **Virtual Electronics & IoT Laboratory Simulator** designed for students, educators, and makers. Experiment with **Arduino Uno** and **Raspberry Pi 4**, connect real sensors and actuators on a virtual breadboard, write and debug code in real time with an embedded interpreter, and save designs directly to the cloud.

---

## 🌟 Key Features

### 🖥️ Microcontroller Platforms & Hardware Simulation
- **Arduino Uno R3 & Raspberry Pi 4** support with realistic pinout definitions (Digital, Analog, PWM, I2C, SPI, Power, GND).
- **Interactive Breadboards** with realistic contact-tie points, power rails, and snap-to-grid alignment.
- **Dynamic Wiring Engine**: Click-to-connect pins, customizable wire colors, curve rendering, and delete controls.

### 🧩 Comprehensive Electronic Component Library
- **Sensors**: DHT11 (Temperature & Humidity), HC-SR04 (Ultrasonic), PIR Motion Sensor, DS18B20, LDR (Light-dependent resistor), Soil Moisture / Water Flow sensor, Potentiometer.
- **Actuators & Outputs**: LEDs (Red, Green, Yellow, Blue, RGB), Traffic Light Module, Micro Servo Motor (SG90), Stepper Motor, DC Motor, Active/Passive Buzzer, Relays, Lightbulb.
- **Displays**: 16x2 I2C LCD, 128x64 I2C OLED Screen, Single-digit 7-Segment Display (Common Cathode), 8x8 LED Matrix, Addressable NeoPixel RGB Strip.
- **Integrated Circuits (ICs)**: 555 Timer IC, 74HC00 NAND Gate, LM741 Operational Amplifier, LM7805 Voltage Regulator.
- **Passives & Controls**: Pushbuttons, Resistors (with configurable resistance in Ω/kΩ), Capacitors.

### ⚙️ Real-Time Code Execution & Debugging
- **Monaco Code Editor**: Professional-grade editor featuring syntax highlighting, line numbers, and error diagnostics for C++ (Arduino) and Python (RPi).
- **Embedded Simulation Interpreter**: Executes microcontroller routines line-by-line, updating virtual hardware pin voltages and states in real-time.
- **Step-by-Step Debugger**: Pause execution, step through code, set breakpoints, and observe real-time variable inspection.
- **Interactive Hardware Controls**: On-the-fly sliders and toggles for sensor inputs (temperature, humidity, distance, motion trigger).
- **Virtual Serial Monitor**: Real-time UART serial communication logging (`Serial.print()`, `print()`).

### ☁️ Cloud Persistence & Sharing
- **Cloud Circuit Sync**: Powered by **Supabase** for saving custom circuit layouts, wiring topologies, and user code.
- **Pre-configured Curriculum Labs**: Complete step-by-step experiment modules with schematics, starter code, and learning tips.

---

## 📚 Included Laboratory Curriculum

| # | Experiment Name | Platform | Key Components |
|---|----------------|----------|----------------|
| 1 | **LED & DHT11 Temp/Humidity Sensor** | Arduino Uno | Arduino Uno, DHT11, LED, 220Ω Resistor |
| 2 | **Ultrasonic & PIR Sensor Interfacing** | Arduino Uno | Arduino Uno, HC-SR04, PIR, Buzzer |
| 3 | **Traffic Light Simulator** | Arduino Uno | Arduino Uno, Red/Yellow/Green LEDs, Resistors |
| 4 | **Water Flow Detection** | Arduino Uno | Arduino Uno, Flow Sensor, 16x2 LCD, Buzzer |
| 5 | **LED & Push Button Control** | Raspberry Pi 4 | RPi 4, Pushbutton, LED, 330Ω Resistor |
| 6 | **Motion Sensor Alarm (PIR)** | Raspberry Pi 4 | RPi 4, PIR Sensor, Buzzer, LED |
| 7 | **DHT11 with Raspberry Pi** | Raspberry Pi 4 | RPi 4, DHT11 Sensor, 16x2 LCD |
| 8 | **DS18B20 1-Wire Temperature Sensor** | Raspberry Pi 4 | RPi 4, DS18B20, 4.7kΩ Pull-up Resistor |
| 9 | **DC & Stepper Motor Control** | Raspberry Pi 4 | RPi 4, L298N Motor Driver, DC/Stepper Motors |
| 10 | **Home Automation IoT Hub** | Raspberry Pi 4 | RPi 4, Relay Module, Lightbulb, LDR, DHT11 |
| 11 | **Smart Traffic Light Controller** | Raspberry Pi 4 | RPi 4, Traffic Lights, Ultrasonic, OLED |
| 12 | **Smart Health Monitoring System** | Raspberry Pi 4 | RPi 4, Pulse/Oximeter, LCD, Buzzer |
| 13 | **Blank Arduino Sandbox** | Arduino Uno | Open workspace for custom designs |
| 14 | **Blank Raspberry Pi Sandbox** | Raspberry Pi 4 | Open workspace for custom designs |

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend & Database**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)

---

## 📂 Project Structure

```text
DSU_VLab/
├── public/                 # Static assets and icons
├── src/
│   ├── assets/             # Images and design assets
│   ├── components/         # Core React components
│   │   ├── features/       # Feature panels (Experiments, Learn, Save, etc.)
│   │   ├── ComponentSVGs.tsx   # Vector graphics for electronic components
│   │   ├── Dashboard.tsx       # Experiments catalog & project hub
│   │   ├── LandingPage.tsx     # Homepage and portal
│   │   └── SimulatorWorkspace.tsx # Main canvas, circuit board & simulation engine
│   ├── database/           # Supabase client & real-time sync hooks
│   │   ├── supabaseClient.ts
│   │   └── useCircuitSync.ts
│   ├── utils/              # Logic utilities
│   │   ├── breadboardLogic.ts      # Contact tie points & rail connectivity
│   │   ├── componentDefinitions.ts # Hardware pins, geometry & properties
│   │   ├── experimentData.ts       # Laboratory experiments library
│   │   ├── interpreter.ts          # C++/Python simulation execution engine
│   │   ├── schematicLayout.ts      # Automatic circuit layout engine
│   │   └── store.ts                # Zustand global state store
│   ├── types.ts            # TypeScript interfaces & types
│   ├── App.tsx             # Main routing setup
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global stylesheet & Tailwind CSS
├── .env.example            # Environment variables template
├── package.json            # Project dependencies & scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have installed:
- [Node.js](https://nodejs.org/) (version `18.x` or higher recommended)
- `npm`, `yarn`, or `pnpm`

### 1. Clone the Repository

```bash
git clone https://github.com/SayanHalder607/VLAB.git
cd VLAB
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Populate the Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open your browser at **`http://localhost:5173`** to use the simulator.

### 5. Build for Production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/SayanHalder607/VLAB/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
