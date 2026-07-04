// Lightweight custom C++ (Arduino) and Python (RPi) line-by-line interpreter


export interface InterpreterLog {
  type: 'info' | 'error' | 'print';
  message: string;
}

export class CircuitInterpreter {
  public platform: 'Arduino' | 'Raspberry Pi' = 'Arduino';
  public code: string = '';
  
  // Scopes & state
  public globals: Record<string, any> = {};
  public locals: Record<string, any> = {};
  public pinModes: Record<string, 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'> = {};
  
  // Execution variables
  public pc: number = 0; // Program counter (index of parsedLines)
  public parsedLines: { text: string; originalLineNum: number }[] = [];
  public delayUntil: number = 0;
  public running: boolean = false;
  public paused: boolean = false;
  
  // Breakpoints (1-based line numbers matching Monaco Editor)
  public breakpoints: Set<number> = new Set();
  
  // Block tracking
  private isSetupDone: boolean = false;
  private isArduinoLooping: boolean = false;
  private loopStartPc: number = 0;
  private loopEndPc: number = 0;
  private setupStartPc: number = 0;
  private setupEndPc: number = 0;



  // Callbacks
  private onPinWrite: (pin: string, val: number | boolean) => void;
  private onPinRead: (pin: string) => any;
  private onSerialLog: (msg: string) => void;
  private onStateChange: () => void;

  constructor(
    onPinWrite: (pin: string, val: number | boolean) => void,
    onPinRead: (pin: string) => any,
    onSerialLog: (msg: string) => void,
    onStateChange: () => void
  ) {
    this.onPinWrite = onPinWrite;
    this.onPinRead = onPinRead;
    this.onSerialLog = onSerialLog;
    this.onStateChange = onStateChange;
  }

  public reset(platform: 'Arduino' | 'Raspberry Pi', code: string) {
    this.platform = platform;
    this.code = code;
    this.globals = {
      'HIGH': 1,
      'LOW': 0,
      'INPUT': 'INPUT',
      'OUTPUT': 'OUTPUT',
      'INPUT_PULLUP': 'INPUT_PULLUP',
      'True': true,
      'False': false,
    };
    this.locals = {};
    this.pinModes = {};
    this.pc = 0;
    this.delayUntil = 0;
    this.running = false;
    this.paused = false;
    this.isSetupDone = false;
    this.isArduinoLooping = false;
    this.parsedLines = [];

    this.parseCode();
  }

  // Preprocesses and cleans code into lines that can be evaluated sequentially
  private parseCode() {
    const rawLines = this.code.split('\n');
    let inBlockComment = false;

    rawLines.forEach((rawLine, index) => {
      let line = rawLine.trim();
      const lineNum = index + 1; // 1-based index

      // Handle block comments
      if (inBlockComment) {
        if (line.includes('*/')) {
          inBlockComment = false;
          line = line.substring(line.indexOf('*/') + 2).trim();
        } else {
          return; // skip line
        }
      }

      if (line.startsWith('/*')) {
        inBlockComment = true;
        if (line.includes('*/')) {
          inBlockComment = false;
          line = line.substring(line.indexOf('*/') + 2).trim();
        } else {
          return;
        }
      }

      // Handle single-line comments
      if (line.startsWith('//') || line.startsWith('#')) {
        return; // Skip comments entirely
      }
      
      // Inline comments removal
      const doubleSlashIndex = line.indexOf('//');
      if (doubleSlashIndex !== -1) {
        line = line.substring(0, doubleSlashIndex).trim();
      }
      const hashIndex = line.indexOf('#');
      // For Python, allow # but check it is not in a string
      if (this.platform === 'Raspberry Pi' && hashIndex !== -1) {
        // Simple string check
        const firstQuote = line.indexOf('"');
        if (firstQuote === -1 || hashIndex < firstQuote) {
          line = line.substring(0, hashIndex).trim();
        }
      }

      if (line === '') return;

      this.parsedLines.push({ text: line, originalLineNum: lineNum });
    });

    if (this.platform === 'Arduino') {
      this.findArduinoBlocks();
    } else {
      this.findPythonBlocks();
    }
  }

  private findArduinoBlocks() {
    // Locate setup() and loop() braces
    let setupStart = -1;
    let setupEnd = -1;
    let loopStart = -1;
    let loopEnd = -1;

    let braceCount = 0;
    let inSetup = false;
    let inLoop = false;

    for (let i = 0; i < this.parsedLines.length; i++) {
      const line = this.parsedLines[i].text;

      if (line.includes('void setup()') || line.match(/void\s+setup\s*\(\s*\)/)) {
        inSetup = true;
        setupStart = i;
      } else if (line.includes('void loop()') || line.match(/void\s+loop\s*\(\s*\)/)) {
        inLoop = true;
        loopStart = i;
      }

      if (inSetup || inLoop) {
        // Count braces
        for (let ch of line) {
          if (ch === '{') braceCount++;
          if (ch === '}') {
            braceCount--;
            if (braceCount === 0) {
              if (inSetup) {
                setupEnd = i;
                inSetup = false;
              } else if (inLoop) {
                loopEnd = i;
                inLoop = false;
              }
            }
          }
        }
      }
    }

    this.setupStartPc = setupStart;
    this.setupEndPc = setupEnd;
    this.loopStartPc = loopStart;
    this.loopEndPc = loopEnd;

    // Start program counter at setup if it exists, otherwise at loop, otherwise 0
    if (this.setupStartPc !== -1) {
      this.pc = this.setupStartPc + 1; // start inside setup()
      this.isSetupDone = false;
    } else if (this.loopStartPc !== -1) {
      this.pc = this.loopStartPc + 1;
      this.isSetupDone = true;
      this.isArduinoLooping = true;
    } else {
      this.pc = 0;
    }
  }

  private findPythonBlocks() {
    // Basic python structure starts at line 0
    this.pc = 0;
  }

  // Safe evaluation of simple math & variable comparisons
  public evaluateExpression(expr: string): any {
    let resolvedExpr = expr.trim();
    
    // 1. Preprocess function calls: digitalRead, analogRead, GPIO.input, pulseIn
    let count = 0;
    while (resolvedExpr.includes('digitalRead') && count++ < 10) {
      const match = resolvedExpr.match(/digitalRead\s*\(\s*([^)]+)\s*\)/);
      if (!match) break;
      const pin = String(this.evaluateExpression(match[1]));
      const val = this.onPinRead(pin);
      resolvedExpr = resolvedExpr.replace(match[0], val ? '1' : '0');
    }
    
    count = 0;
    while (resolvedExpr.includes('GPIO.input') && count++ < 10) {
      const match = resolvedExpr.match(/GPIO\.input\s*\(\s*([^)]+)\s*\)/);
      if (!match) break;
      const pin = String(this.evaluateExpression(match[1]));
      const val = this.onPinRead(pin);
      resolvedExpr = resolvedExpr.replace(match[0], val ? '1' : '0');
    }
    
    count = 0;
    while (resolvedExpr.includes('analogRead') && count++ < 10) {
      const match = resolvedExpr.match(/analogRead\s*\(\s*([^)]+)\s*\)/);
      if (!match) break;
      const pin = String(this.evaluateExpression(match[1]));
      const val = this.onPinRead(pin);
      resolvedExpr = resolvedExpr.replace(match[0], String(val));
    }
    
    count = 0;
    while (resolvedExpr.includes('pulseIn') && count++ < 10) {
      const match = resolvedExpr.match(/pulseIn\s*\(\s*([^,)]+)\s*,\s*([^)]+)\)/);
      if (!match) break;
      const dist = this.globals['distance'] !== undefined ? this.globals['distance'] : 50;
      const duration = Math.round(dist * 58);
      resolvedExpr = resolvedExpr.replace(match[0], String(duration));
    }

    resolvedExpr = resolvedExpr.trim();
    if (resolvedExpr === 'HIGH' || resolvedExpr === 'true' || resolvedExpr === 'True') return true;
    if (resolvedExpr === 'LOW' || resolvedExpr === 'false' || resolvedExpr === 'False') return false;
    
    // Check if it's numeric
    if (/^-?\d+(\.\d+)?$/.test(resolvedExpr)) {
      return Number(resolvedExpr);
    }

    // Check strings
    if ((resolvedExpr.startsWith('"') && resolvedExpr.endsWith('"')) || (resolvedExpr.startsWith("'") && resolvedExpr.endsWith("'"))) {
      return resolvedExpr.slice(1, -1);
    }

    // Substitute variables from scopes
    const combinedScope = { ...this.globals, ...this.locals };
    
    // Sort variables by length descending to prevent replacing substrings (e.g. ledPin13 vs ledPin)
    const varNames = Object.keys(combinedScope).sort((a, b) => b.length - a.length);

    // Replace known variables
    for (const name of varNames) {
      // Use regex with word boundaries to replace variable exact matches only
      const escapedName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedName}\\b`, 'g');
      const val = combinedScope[name];
      const stringified = typeof val === 'string' ? `"${val}"` : String(val);
      resolvedExpr = resolvedExpr.replace(regex, stringified);
    }

    // Replace some Arduino/Python conventions
    resolvedExpr = resolvedExpr.replace(/==/g, '===');
    resolvedExpr = resolvedExpr.replace(/!=/g, '!==');
    resolvedExpr = resolvedExpr.replace(/\band\b/g, '&&');
    resolvedExpr = resolvedExpr.replace(/\bor\b/g, '||');
    resolvedExpr = resolvedExpr.replace(/\bnot\b/g, '!');

    try {
      // Simple, sandboxed eval using Function constructor
      // Since it's run on processed code (replaced variables and constants), it's relatively safe
      const result = new Function(`return (${resolvedExpr});`)();
      return result;
    } catch (e) {
      // Fallback: if eval fails, check if the expression itself is a variable
      if (combinedScope[expr] !== undefined) {
        return combinedScope[expr];
      }
      return expr;
    }
  }

  // Step one line of execution
  public step() {
    if (this.pc >= this.parsedLines.length) {
      if (this.platform === 'Arduino' && this.loopStartPc !== -1) {
        // Loop back
        this.pc = this.loopStartPc + 1;
        this.isArduinoLooping = true;
        this.onStateChange();
        return;
      }
      this.running = false;
      this.onSerialLog("[Simulation ended]");
      this.onStateChange();
      return;
    }

    const currentLine = this.parsedLines[this.pc];
    const lineText = currentLine.text;

    // Check if breakpoint matches this original line number
    if (this.breakpoints.has(currentLine.originalLineNum) && !this.paused) {
      this.paused = true;
      this.onSerialLog(`[Breakpoint hit at line ${currentLine.originalLineNum}]`);
      this.onStateChange();
      return;
    }

    this.paused = false;

    try {
      this.executeLine(lineText);
    } catch (error: any) {
      this.onSerialLog(`[Error line ${currentLine.originalLineNum}]: ${error.message}`);
      this.running = false;
      this.onStateChange();
      return;
    }

    // Advance PC
    this.pc++;

    // Check if we hit the boundaries of Arduino setup/loop
    if (this.platform === 'Arduino') {
      if (this.pc > this.setupEndPc && !this.isSetupDone && this.setupStartPc !== -1) {
        this.isSetupDone = true;
        if (this.loopStartPc !== -1) {
          this.pc = this.loopStartPc + 1;
          this.isArduinoLooping = true;
        } else {
          this.running = false;
        }
      } else if (this.pc > this.loopEndPc && this.isArduinoLooping) {
        // Restart loop
        this.pc = this.loopStartPc + 1;
      }
    }

    this.onStateChange();
  }

  private executeLine(line: string) {
    // Clean and remove trailing semicolons
    const cleanLine = line.endsWith(';') ? line.slice(0, -1).trim() : line;

    // 1. Variable Assignments
    // Arduino: int led = 13; float value = 2.4;
    // Python: led = 13
    const varDeclMatch = cleanLine.match(/^(?:int|float|double|char|const\s+int|boolean|String)\s+([a-zA-Z0-9_]+)\s*=\s*(.+)$/);
    const pyAssignMatch = cleanLine.match(/^([a-zA-Z0-9_]+)\s*=\s*(.+)$/);

    if (varDeclMatch) {
      const varName = varDeclMatch[1].trim();
      const valExpr = varDeclMatch[2].trim();
      this.globals[varName] = this.evaluateExpression(valExpr);
      return;
    }

    // Python assignments or general re-assignments
    if (pyAssignMatch) {
      const varName = pyAssignMatch[1].trim();
      const valExpr = pyAssignMatch[2].trim();

      // Exclude function headers or control words
      if (!['if', 'while', 'for', 'def', 'elif'].includes(varName)) {
        // If inside a function block or local scope (we can simplify to writing to globals/locals)
        this.globals[varName] = this.evaluateExpression(valExpr);
        return;
      }
    }

    // 2. Control Flow: If statements
    // Arduino: if (val == HIGH) {
    // Python: if val == True:
    const arduinoIfMatch = cleanLine.match(/^if\s*\((.+)\)\s*\{?$/);
    const pythonIfMatch = cleanLine.match(/^if\s+(.+)\s*:\s*$/);

    if (arduinoIfMatch || pythonIfMatch) {
      const condition = (arduinoIfMatch ? arduinoIfMatch[1] : pythonIfMatch![1]).trim();
      const isTrue = this.evaluateExpression(condition);
      
      if (!isTrue) {
        // Skip statements inside this block!
        // We find the matching closing brace for C++ or the next line with same/less indentation for Python.
        if (this.platform === 'Arduino') {
          this.skipArduinoBlock();
        } else {
          this.skipPythonBlock();
        }
      }
      return;
    }

    // Handle single closing braces
    if (cleanLine === '}') {
      return; // Do nothing, just boundary
    }

    // 3. API Commands: digitalWrite(pin, value) / GPIO.output(pin, value)
    const dwMatch = cleanLine.match(/digitalWrite\s*\(\s*([^,]+)\s*,\s*([^\)]+)\)/);
    const pyOutputMatch = cleanLine.match(/GPIO\.output\s*\(\s*([^,]+)\s*,\s*([^\)]+)\)/);
    if (dwMatch || pyOutputMatch) {
      const pinExpr = (dwMatch ? dwMatch[1] : pyOutputMatch![1]).trim();
      const valExpr = (dwMatch ? dwMatch[2] : pyOutputMatch![2]).trim();

      const pin = String(this.evaluateExpression(pinExpr));
      const val = this.evaluateExpression(valExpr);
      this.onPinWrite(pin, val);
      return;
    }

    // pinMode(pin, mode) / GPIO.setup(pin, mode)
    const pmMatch = cleanLine.match(/pinMode\s*\(\s*([^,]+)\s*,\s*([^\)]+)\)/);
    const pySetupMatch = cleanLine.match(/GPIO\.setup\s*\(\s*([^,]+)\s*,\s*([^\)]+)\)/);
    if (pmMatch || pySetupMatch) {
      const pinExpr = (pmMatch ? pmMatch[1] : pySetupMatch![1]).trim();
      const modeExpr = (pmMatch ? pmMatch[2] : pySetupMatch![2]).trim();

      const pin = String(this.evaluateExpression(pinExpr));
      const mode = this.evaluateExpression(modeExpr);
      this.pinModes[pin] = mode;
      return;
    }

    // delay(ms) / time.sleep(seconds)
    const delayMatch = cleanLine.match(/delay\s*\(\s*([^\)]+)\)/);
    const sleepMatch = cleanLine.match(/time\.sleep\s*\(\s*([^\)]+)\)/);
    if (delayMatch || sleepMatch) {
      const durExpr = (delayMatch ? delayMatch[1] : sleepMatch![1]).trim();
      const rawDur = this.evaluateExpression(durExpr);
      const ms = delayMatch ? Number(rawDur) : Number(rawDur) * 1000;
      this.delayUntil = Date.now() + ms;
      return;
    }

    // Serial.begin(baud) / GPIO.setmode / etc. (Config lines)
    if (cleanLine.startsWith('Serial.begin') || cleanLine.startsWith('GPIO.setmode') || cleanLine.startsWith('GPIO.setwarnings') || cleanLine.startsWith('import ') || cleanLine.startsWith('from ')) {
      return; // Skip config setup statements in execution but allow them
    }

    // Serial.println(msg) / Serial.print(msg) / print(msg)
    const printMatch = cleanLine.match(/Serial\.print(?:ln)?\s*\(\s*(.+)\s*\)/);
    const pyPrintMatch = cleanLine.match(/^print\s*\(\s*(.+)\s*\)/);
    if (printMatch || pyPrintMatch) {
      const contentExpr = (printMatch ? printMatch[1] : pyPrintMatch![1]).trim();
      const val = this.evaluateExpression(contentExpr);
      this.onSerialLog(String(val));
      return;
    }

    // 4. Special Custom Library Handlers (DHT, Motors, LCD)
    // DHT read: float t = dht.readTemperature();
    // In templates we assign variables to these. If a line calls them directly, or they are in an assignment:
    // e.g. "t = dht.readTemperature()" is handled by the assignment evaluator because we can inject variables!
    // We will inject sensor values as active variables in the globals list during simulator run loop (e.g. temperature, humidity, light, distance).
  }

  // Skips execution to matching brace for Arduino
  private skipArduinoBlock() {
    let braceCount = 1;
    let index = this.pc + 1;
    while (index < this.parsedLines.length && braceCount > 0) {
      const text = this.parsedLines[index].text;
      for (const ch of text) {
        if (ch === '{') braceCount++;
        if (ch === '}') braceCount--;
      }
      if (braceCount === 0) {
        this.pc = index; // Move PC to the closing brace
        return;
      }
      index++;
    }
  }

  // Skips execution based on indentation level for Python
  private skipPythonBlock() {
    // Find indentation level of next line. Python parsing checks whitespace.
    // However, our preprocessor stripped white spaces! So let's look at indentation of original lines.
    const currentLineNum = this.parsedLines[this.pc].originalLineNum;
    const currentIndent = this.getIndentation(currentLineNum);

    let index = this.pc + 1;
    while (index < this.parsedLines.length) {
      const lineNum = this.parsedLines[index].originalLineNum;
      const indent = this.getIndentation(lineNum);
      if (indent <= currentIndent) {
        this.pc = index - 1; // Move PC to just before this line
        return;
      }
      index++;
    }
    this.pc = this.parsedLines.length - 1;
  }

  private getIndentation(lineNum: number): number {
    const rawLines = this.code.split('\n');
    if (lineNum - 1 < 0 || lineNum - 1 >= rawLines.length) return 0;
    const line = rawLines[lineNum - 1];
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }
}
