// ═══════════════════════════════════════════════
// 1. BLOCK DEFINITIONS
// ═══════════════════════════════════════════════

Blockly.defineBlocksWithJsonArray([
  {
    "type": "esp32_digital_write",
    "message0": "Set Pin %1 to %2",
    "args0": [
      { "type": "field_number", "name": "PIN", "value": 2, "min": 0, "max": 39 },
      { "type": "field_dropdown", "name": "STATE", "options": [ ["HIGH", "HIGH"], ["LOW", "LOW"] ] }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Write HIGH or LOW to a GPIO pin","colour": "#4598FC",
    "helpUrl": ""
  },
  {
    "type": "esp32_setup_loop",
    "message0": "On Start %1 Forever %2",
    "args0": [
      { "type": "input_statement", "name": "SETUP" },
      { "type": "input_statement", "name": "LOOP" }
    ],
     colour: "#FCAA1A",
    "tooltip": "Arduino Setup and Loop"
  },
  {
    "type": "tinkercad_analog_write",
    "message0": "set pin %1 to %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "PIN",
        "options": [
          ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], 
          ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"],
          ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"]
        ]
      },
      { 
        "type": "field_number", 
        "name": "VALUE", 
        "value": 0,
        "min": 0,
        "max": 255
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4598FC",
    "tooltip": "Write an analog value (PWM) to a pin"
  },
  {
    "type": "esp32_pin_mode",
    "message0": "Set Pin %1 as %2",
    "args0": [
      { "type": "field_number", "name": "PIN", "value": 2 },
      { "type": "field_dropdown", "name": "MODE", "options": [ ["OUTPUT", "OUTPUT"], ["INPUT", "INPUT"], ["INPUT_PULLUP", "INPUT_PULLUP"] ] }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4598FC",
  },
  {
    "type": "esp32_delay",
    "message0": "Wait %1 ms",
    "args0": [
      { "type": "field_number", "name": "MS", "value": 1000, "min": 0 }
    ],
    "previousStatement": null,
    "nextStatement": null,
     colour: "#FCAA1A",
  },
  {
    "type": "esp32_digital_read",
    "message0": "Read Pin %1",
    "args0": [
      { "type": "field_number", "name": "PIN", "value": 4 }
    ],
    "output": "Number",
    "colour": 210
  },
  {
    "type": "esp32_serial_print",
    "message0": "Serial Print %1",
    "args0": [
      { "type": "input_value", "name": "TEXT", "check": "String" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 290
  },
  {
    "type": "tinkercad_repeat",
    "message0": "repeat %1 times",
    "args0": [
      { "type": "field_number", "name": "TIMES", "value": 10, "min": 1 }
    ],
    "message1": "%1",
    "args1": [
      { "type": "input_statement", "name": "DO" }
    ],
    "previousStatement": null,
    "nextStatement": null,
     colour: "#FCAA1A", // Yellow/Orange
    "tooltip": "Repeat blocks a specific number of times."
  },
  {
    "type": "tinkercad_repeat_while_until",
    "message0": "%1 %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "MODE",
        "options": [ ["while", "WHILE"], ["until", "UNTIL"] ]
      },
      {
        "type": "input_value",
        "name": "COND",
        "check": "Boolean"
      }
    ],
    "message1": "%1",
    "args1": [
      { "type": "input_statement", "name": "DO" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FCAA1A",
    "inputsInline": true,
    "tooltip": "Repeat while or until a condition is met."
  },
  {
    "type": "tinkercad_set_builtin_led",
    "message0": "set built-in LED to %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "STATE",
        "options": [ ["HIGH", "HIGH"], ["LOW", "LOW"] ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4598FC" // Blue
  },
  {
    "type": "tinkercad_rotate_servo",
    "message0": "rotate servo on pin %1 to %2 degrees",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "PIN",
        "options": [
          ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], 
          ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]
        ]
      },
      { "type": "field_number", "name": "DEGREE", "value": 0, "min": 0, "max": 180 }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4598FC"
  },
  {
    "type": "tinkercad_play_speaker",
    "message0": "play speaker on pin %1 with tone %2 for %3 sec",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "PIN",
        "options": [
          ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], 
          ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]
        ]
      },
      { "type": "field_number", "name": "TONE", "value": 60 },
      { "type": "field_number", "name": "DURATION", "value": 1, "min": 0.1 }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4598FC"
  },
  {
    "type": "tinkercad_turn_off_speaker",
    "message0": "turn off speaker on pin %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "PIN",
        "options": [
          ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], 
          ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4598FC"
  },
  {
    "type": "tinkercad_serial_print",
    "message0": "print to serial monitor %1 %2 newline",
    "args0": [
      { "type": "field_input", "name": "TEXT", "text": "hello world" },
      {
        "type": "field_dropdown",
        "name": "NEWLINE",
        "options": [ ["with", "with"], ["without", "without"] ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4598FC"
  },
  // Arithmetic Operator
  {
    "type": "math_arithmetic_custom",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "field_number",
        "name": "A",
        "value": 1,
        "min": -999999,
        "max": 999999
      },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["+", "+"], ["-", "-"], ["×", "*"], ["/", "/"], ["%", "%"], ["^", "^"]
        ]
      },
      {
        "type": "field_number",
        "name": "B",
        "value": 1,
        "min": -999999,
        "max": 999999
      }
    ],
    "inputsInline": true,
    "output": "Number",
    "colour": "#42BC49"
  },
  {
    "type": "math_number",
    "message0": "%1",
    "args0": [
      {
        "type": "field_number",
        "name": "NUM",
        "value": 0
      }
    ],
    "output": "Number",
    "colour": "#42BC49",
    "tooltip": "A number value"
  },
  // Comparison Operator
  {
    "type": "math_compare_custom",
    "message0": "%1 %2 %3",
    "args0": [
      { "type": "field_number", "name": "A", "value": 1, "min": -999999, "max": 999999 },
      {
        "type": "field_dropdown", "name": "OP",
        "options": [ ["<", "<"], ["≤", "<="], ["=", "=="], ["≠", "!="], [">", ">"], ["≥", ">="] ]
      },
      { "type": "field_number", "name": "B", "value": 1, "min": -999999, "max": 999999 }
    ],
    "output": "Boolean",
    "colour": "#42BC49"
  },
  // Pick Random
  {
    "type": "math_random_int",
    "message0": "pick random %1 to %2",
    "args0": [
      { "type": "field_number", "name": "FROM", "value": 1, "min": 0, "max": 999999 },
      { "type": "field_number", "name": "TO", "value": 100, "min": 0, "max": 999999 }
    ],
    "output": "Number",
    "colour": "#42BC49"
  },
  // Logical AND/OR
  {
    "type": "math_logic_operation",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "A",
        "check": "Boolean",
        "shadow": {
          "type": "logic_boolean",
          "fields": { "BOOL": "TRUE" }
        }
      },
      {
        "type": "field_dropdown", "name": "OP",
        "options": [ ["and", "&&"], ["or", "||"] ]
      },
      {
        "type": "input_value",
        "name": "B",
        "check": "Boolean",
        "shadow": {
          "type": "logic_boolean",
          "fields": { "BOOL": "TRUE" }
        }
      }
    ],
    "output": "Boolean",
    "colour": "#42BC49"
  },
  // Logical NOT
  {
    "type": "math_logic_not",
    "message0": "not %1",
    "args0": [
      {
        "type": "input_value",
        "name": "BOOL",
        "check": "Boolean",
        "shadow": {
          "type": "logic_boolean",
          "fields": { "BOOL": "TRUE" }
        }
      }
    ],
    "output": "Boolean",
    "colour": "#42BC49"
  },
  // Math Functions (abs, sqrt, etc)
  {
    "type": "math_single_func",
    "message0": "%1 of %2",
    "args0": [
      {
        "type": "field_dropdown", "name": "OP",
        "options": [ ["abs", "abs"], ["sqrt", "sqrt"], ["sin", "sin"], ["cos", "cos"], ["tan", "tan"] ]
      },
      { "type": "field_number", "name": "NUM", "value": 1, "min": -999999, "max": 999999 }
    ],
    "output": "Number",
    "colour": "#42BC49"
  },
  // Map
  {
    "type": "math_map",
    "message0": "map %1 to range %2 to %3",
    "args0": [
      { "type": "field_number", "name": "VAL", "value": 0, "min": -999999, "max": 999999 },
      { "type": "field_number", "name": "MIN", "value": 0, "min": -999999, "max": 999999 },
      { "type": "field_number", "name": "MAX", "value": 1023, "min": -999999, "max": 999999 }
    ],
    "output": "Number",
    "colour": "#42BC49"
  },
  // Constrain
  {
    "type": "math_constrain",
    "message0": "constrain %1 to range %2 to %3",
    "args0": [
      { "type": "field_number", "name": "VAL", "value": 0, "min": -999999, "max": 999999 },
      { "type": "field_number", "name": "MIN", "value": 0, "min": -999999, "max": 999999 },
      { "type": "field_number", "name": "MAX", "value": 255, "min": -999999, "max": 999999 }
    ],
    "output": "Number",
    "colour": "#42BC49"
  },
  // HIGH/LOW Constant
  {
    "type": "math_constant_high_low",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown", "name": "STATE",
        "options": [ ["HIGH", "HIGH"], ["LOW", "LOW"] ]
      }
    ],
    "output": null,
    "colour": "#42BC49"
  },

  {
    "type": "tinkercad_if",
    "message0": "if %1 then",
    "args0": [
      {
        "type": "input_value",
        "name": "IF0",
        "check": "Boolean"
      }
    ],
    "message1": "%1",
    "args1": [
      {
        "type": "input_statement",
        "name": "DO0"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FCAA1A", // Control Category Yellow
    "tooltip": "If a value is true, then do some statements."
  },
  {
    "type": "tinkercad_if_else",
    "message0": "if %1 then",
    "args0": [
      { "type": "input_value", "name": "IF0", "check": "Boolean" }
    ],
    "message1": "%1",
    "args1": [
      { "type": "input_statement", "name": "DO0" }
    ],
    "message2": "else",
    "message3": "%1",
    "args3": [
      { "type": "input_statement", "name": "ELSE" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FCAA1A",
    "tooltip": "If a value is true, do the first set of blocks. Otherwise, do the second set."
  },
  {
    "type": "tinkercad_count",
    "message0": "count %1 by %2 for %3 from %4 to %5",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "MODE",
        "options": [ ["up", "UP"], ["down", "DOWN"] ]
      },
      { "type": "field_number", "name": "BY", "value": 1 },
      { "type": "field_variable", "name": "VAR", "variable": "j" },
      { "type": "field_number", "name": "FROM", "value": 1 },
      { "type": "field_number", "name": "TO", "value": 10 }
    ],
    "message1": "do %1",
    "args1": [
      { "type": "input_statement", "name": "DO" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FCAA1A",
    "tooltip": "Loop a specific number of times using a variable."
  },
  // Digital/Analog Reads
  {
    "type": "tinkercad_digital_read",
    "message0": "read digital pin %1",
    "args0": [{ "type": "field_dropdown", "name": "PIN", "options": [["0","0"],["1","1"],["2","2"],["3","3"],["4","4"],["5","5"],["6","6"],["7","7"]] }],
    "output": "Number",
    "colour": "#9965F9"
  },
  {
    "type": "tinkercad_analog_read",
    "message0": "read analog pin %1",
    "args0": [{ "type": "field_dropdown", "name": "PIN", "options": [["02","02"],["04","04"],["12","12"],["13","13"],["14","14"],["15","15"],["25","25"],["26","26"],["27","27"],["32","32"],["33","33"],["34","34"],["35","35"],["36","36"],["39","39"]] }],
    "output": "Number",
    "colour": "#9965F9"
  },
  // Servo Read
  {
    "type": "tinkercad_servo_read",
    "message0": "read degrees of servo on pin %1",
    "args0": [{ "type": "field_dropdown", "name": "PIN", "options": [
      ["0","0"],["1","1"],["2","2"],["3","3"],["4","4"],["5","5"],["6","6"],["7","7"],["8","8"],["9","9"],
      ["10","10"],["11","11"],["12","12"],["13","13"],["14","14"],["15","15"],["16","16"],["17","17"],["18","18"],["19","19"],
      ["20","20"],["21","21"],["22","22"],["23","23"],["24","24"],["25","25"],["26","26"],["27","27"],["28","28"],["29","29"],
      ["30","30"],["31","31"],["32","32"],["33","33"],["34","34"],["35","35"],["36","36"],["37","37"],["38","38"],["39","39"]
    ] }],
    "output": "Number",
    "colour": "#9965F9"
  },
  // Serial Input
  {
    "type": "tinkercad_serial_available",
    "message0": "number of serial characters available",
    "output": "Number",
    "colour": "#9965F9"
  },
  {
    "type": "tinkercad_serial_read",
    "message0": "read from serial",
    "output": "Number",
    "colour": "#9965F9"
  },
  // Sensors (Ultrasonic, Temp, IR)
  {
    "type": "tinkercad_ultrasonic",
    "message0": "read ultrasonic distance sensor on trigger pin %1 echo pin %2 in units %3",
    "args0": [
      { "type": "field_dropdown", "name": "TRIG", "options": [["0","0"],["1","1"],["2","2"],["3","3"]] },
      { "type": "field_dropdown", "name": "ECHO", "options": [["same as trigger", "SAME"], ["0","0"],["1","1"],["2","2"]] },
      { "type": "field_dropdown", "name": "UNIT", "options": [["cm","cm"],["inch","inch"]] }
    ],
    "output": "Number",
    "colour": "#9965F9"
  },
  {
    "type": "tinkercad_temperature",
    "message0": "read temperature sensor on pin %1 in units %2",
    "args0": [
      { "type": "field_dropdown", "name": "PIN", "options": [["02","02"],["04","04"],["12","12"],["13","13"],["14","14"],["15","15"],["25","25"],["26","26"],["27","27"],["32","32"],["33","33"],["34","34"],["35","35"],["36","36"],["39","39"]] },
      { "type": "field_dropdown", "name": "UNIT", "options": [["°C","C"],["°F","F"]] }
    ],
    "output": "Number",
    "colour": "#9965F9"
  },
  {
    "type": "tinkercad_ir_sensor",
    "message0": "read infrared sensor pin %1",
    "args0": [{ "type": "field_dropdown", "name": "PIN", "options": [["0","0"],["1","1"],["2","2"]] }],
    "output": "Number",
    "colour": "#9965F9"
  },
  {
    "type": "notation_title_comment",
    "message0": "title block comment %1",
    "args0": [
      {
        "type": "field_input",
        "name": "TEXT",
        "text": "describe your code here"
      }
    ],
    "nextStatement": null,
    "colour": "#959593",
    "tooltip": "Add a multi-line header comment to your code"
  },
  {
    "type": "notation_single_comment",
    "message0": "comment %1",
    "args0": [
      {
        "type": "field_input",
        "name": "TEXT",
        "text": "helpful single-line comment here"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#959593",
    "tooltip": "Add a single-line comment"
  },
  // 1. Variable Get Block (The pill-shaped 'i' and 'j' blocks)
  {
    "type": "variables_get_custom",
    "message0": "%1",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR"
      }
    ],
    "output": "Number",
    "colour": "#D55CD6",
    "tooltip": "Get the value of this variable."
  },
  // Non-editable fixed 'i' variable (label-only)
  {
    "type": "variable_i_block",
    "message0": "i",
    "output": "Number",
    "colour": "#D55CD6",
    "tooltip": "Read-only variable i"
  },
  // 2. Variable Set Block (set [i] to [32])
  {
    "type": "variables_set_custom",
    "message0": "set %1 to %2",
    "args0": [
      { "type": "field_variable", "name": "VAR" },
      { "type": "input_value", "name": "VALUE" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D55CD6",
    "tooltip": "Set the variable to a specific value."
  },
  // 3. Variable Change Block (change [i] by [1])
  {
    "type": "variables_change_custom",
    "message0": "change %1 by %2",
    "args0": [
      { "type": "field_variable", "name": "VAR" },
      { "type": "input_value", "name": "VALUE" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D55CD6",
    "tooltip": "Add a value to the variable."
  }
]);

// ═══════════════════════════════════════════════
// 2. CODE GENERATOR
// ═══════════════════════════════════════════════

const arduinoGenerator = new Blockly.Generator('Arduino');

// Define C++ Order of Operations (Required for Math/Logic blocks to work)
arduinoGenerator.ORDER_ATOMIC = 0;
arduinoGenerator.ORDER_UNARY_POSTFIX = 1; 
arduinoGenerator.ORDER_UNARY_PREFIX = 2;
arduinoGenerator.ORDER_MULTIPLICATIVE = 3;
arduinoGenerator.ORDER_ADDITIVE = 4;
arduinoGenerator.ORDER_RELATIONAL = 6;
arduinoGenerator.ORDER_EQUALITY = 7;
arduinoGenerator.ORDER_LOGICAL_AND = 11;
arduinoGenerator.ORDER_LOGICAL_OR = 12;
// Missing order constants used by generators
arduinoGenerator.ORDER_FUNCTION_CALL = 2;
arduinoGenerator.ORDER_ASSIGNMENT = 14;
arduinoGenerator.ORDER_NONE = 99;

arduinoGenerator.scrub_ = function(block, code, thisOnly) {
  const nextBlock = block.nextConnection?.targetBlock();
  if (nextBlock && !thisOnly) {
    return code + arduinoGenerator.blockToCode(nextBlock);
  }
  return code;
};

function resetGeneratorState() {
  arduinoGenerator.init(workspace);
  arduinoGenerator.definitions_ = arduinoGenerator.definitions_ || Object.create(null);
  arduinoGenerator.setups_ = Object.create(null);
  // Ensure generator functions are reachable by Blockly's lookup.
  // Some environments expect generator methods to be properties on the generator
  // object (e.g. `arduinoGenerator['block_type']`) instead of stored in a
  // separate `forBlock` map. Copy them across as a defensive measure.
  if (arduinoGenerator.forBlock) {
    Object.keys(arduinoGenerator.forBlock).forEach((k) => {
      if (typeof arduinoGenerator.forBlock[k] === 'function') {
        arduinoGenerator[k] = arduinoGenerator.forBlock[k];
      }
    });
  }
}
  // Inject declarations for all workspace variables so the preview shows them
  try {
    const vars = workspace.getAllVariables ? workspace.getAllVariables() : (workspace.getVariableMap ? workspace.getVariableMap().getAllVariables() : []);
    (vars || []).forEach(v => {
      const nm = v.name;
      const tp = v.type || 'int';
      arduinoGenerator.definitions_['var_' + nm] = tp + ' ' + nm + ' = ' + _varDefault(tp) + ';';
    });
  } catch (e) { /* ignore if API differs */ }

function buildProgramSections() {
  // Ensure the generator state and lookup functions are initialized
  resetGeneratorState();
  
  // Find the main "Start/Forever" block
  const setupLoopBlock = workspace.getBlocksByType('esp32_setup_loop', false)[0];
  let setupCode = '', loopCode = '', titleComment = '';

  if (setupLoopBlock) {
    setupCode = arduinoGenerator.statementToCode(setupLoopBlock, 'SETUP');
    loopCode  = arduinoGenerator.statementToCode(setupLoopBlock, 'LOOP');
  } else {
    // If no Start block exists, grab everything loose on the canvas
    workspace.getTopBlocks(true).forEach(block => {
      let generated = arduinoGenerator.blockToCode(block);

      if (block.type === 'notation_title_comment') {
        titleComment = generated || '';
        return;
      }

      // If it's a value block (returns an array), turn it into a statement for the preview
      if (Array.isArray(generated)) {
        generated = generated[0] + ";";
      }
      if (generated) loopCode += generated + "\n";
    });
  }

  const definitions = Object.values(arduinoGenerator.definitions_ || {}).join('\n');
  const setups = Object.values(arduinoGenerator.setups_ || {}).map(s => "  " + s).join('\n');

  // Ensure every workspace variable has a global declaration in definitions_
  try {
    const vars = workspace.getAllVariables ? workspace.getAllVariables() : (workspace.getVariableMap ? workspace.getVariableMap().getAllVariables() : []);
    (vars || []).forEach(v => {
      const key = 'var_' + v.name;
      if (!arduinoGenerator.definitions_[key]) {
        const tp = v.type || 'int';
        arduinoGenerator.definitions_[key] = tp + ' ' + v.name + ' = ' + _varDefault(tp) + ';';
      }
    });
  } catch (e) { /* ignore */ }

  // Recompute definitions string after possibly injecting variable decls
  const definitionsUpdated = Object.values(arduinoGenerator.definitions_ || {}).join('\n');

  return { setupCode, loopCode, definitions: definitionsUpdated || definitions, setups, titleComment };
}
arduinoGenerator.forBlock['tinkercad_if_else'] = function(block) {
  // 1. Get the condition code
  const argument = arduinoGenerator.valueToCode(block, 'IF0', arduinoGenerator.ORDER_NONE) || 'false';
  
  // 2. Get the code for both branches
  const branch0 = arduinoGenerator.statementToCode(block, 'DO0');
  const branch1 = arduinoGenerator.statementToCode(block, 'ELSE');
  
  // 3. Assemble the C++ if-else statement
  return `if (${argument}) {\n${branch0}} else {\n${branch1}}\n`;
};
arduinoGenerator.forBlock["esp32_digital_write"] = function (block) {
  const pin   = block.getFieldValue('PIN');
  const state = block.getFieldValue('STATE');
  return `digitalWrite(${pin}, ${state});\n`;
};
arduinoGenerator.forBlock['esp32_setup_loop'] = function (block) {
  const setup = arduinoGenerator.statementToCode(block, 'SETUP');
  const loop  = arduinoGenerator.statementToCode(block, 'LOOP');
  return `void setup() {\n${setup}}\nvoid loop() {\n${loop}}\n`;
};
arduinoGenerator.forBlock['tinkercad_count'] = function(block) {
  const mode = block.getFieldValue('MODE');
  const step = block.getFieldValue('BY');
  const from = block.getFieldValue('FROM');
  const to = block.getFieldValue('TO');
  const branch = arduinoGenerator.statementToCode(block, 'DO');
  
  // Get the variable name (e.g., 'j')
  const variableId = block.getFieldValue('VAR');
  const variableName = workspace.getVariableById(variableId).name;

  // 1. Inject the global variable definition at the top
  arduinoGenerator.definitions_[`var_${variableName}`] = `int ${variableName} = 0;`;

  // 2. Determine directions
  const operator = (mode === 'UP') ? '<=' : '>=';
  const increment = (mode === 'UP') ? '+=' : '-=';

  // 3. Assemble the C++ for-loop
  return `for (${variableName} = ${from}; ${variableName} ${operator} ${to}; ${variableName} ${increment} ${step}) {\n${branch}}\n`;
};
arduinoGenerator.forBlock['esp32_pin_mode'] = function (block) {
  const pin  = block.getFieldValue('PIN');
  const mode = block.getFieldValue('MODE');
  return `pinMode(${pin}, ${mode});\n`;
};
arduinoGenerator.forBlock['esp32_delay'] = function(block) {
  const ms = block.getFieldValue('MS');
  return `delay(${ms});\n`;
};
arduinoGenerator.forBlock['tinkercad_digital_read'] = function(block) {
  const pin = block.getFieldValue('PIN');
  arduinoGenerator.setups_[`setup_input_${pin}`] = `pinMode(${pin}, INPUT);`;
  return [`digitalRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['tinkercad_analog_read'] = function(block) {
  const pin = block.getFieldValue('PIN');
  arduinoGenerator.setups_[`setup_input_${pin}`] = `pinMode(${pin}, INPUT);`;
  return [`analogRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['tinkercad_servo_read'] = function(block) {
  const pin = block.getFieldValue('PIN');
  arduinoGenerator.definitions_['include_servo'] = '#include <Servo.h>';
  arduinoGenerator.definitions_[`var_servo_${pin}`] = `Servo servo_${pin};`;
  arduinoGenerator.setups_[`setup_servo_${pin}`] = `servo_${pin}.attach(${pin});`;
  return [`servo_${pin}.read()`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['tinkercad_serial_available'] = function(block) {
  arduinoGenerator.setups_['setup_serial'] = `Serial.begin(9600);`;
  return [`Serial.available()`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['tinkercad_serial_read'] = function(block) {
  arduinoGenerator.setups_['setup_serial'] = `Serial.begin(9600);`;
  return [`Serial.read()`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['tinkercad_ultrasonic'] = function(block) {
  const trig = block.getFieldValue('TRIG');
  const echoField = block.getFieldValue('ECHO');
  const echo = echoField === 'SAME' ? trig : echoField;
  const unit = block.getFieldValue('UNIT');

  // Inject helper function
  arduinoGenerator.definitions_['func_ultrasonic'] = 
`long readUltrasonicDistance(int triggerPin, int echoPin) {
  pinMode(triggerPin, OUTPUT);
  digitalWrite(triggerPin, LOW);
  delayMicroseconds(2);
  digitalWrite(triggerPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(triggerPin, LOW);
  pinMode(echoPin, INPUT);
  return pulseIn(echoPin, HIGH);
}`;

  const factor = unit === 'cm' ? '0.01723' : '0.00678';
  const code = `${factor} * readUltrasonicDistance(${trig}, ${echo})`;
  return [code, arduinoGenerator.ORDER_MULTIPLICATIVE];
};

arduinoGenerator.forBlock['tinkercad_temperature'] = function(block) {
  const pin = block.getFieldValue('PIN');
  const unit = block.getFieldValue('UNIT');
  arduinoGenerator.setups_[`setup_input_${pin}`] = `pinMode(${pin}, INPUT);`;
  
  let code = `(-40 + 0.488155 * (analogRead(${pin}) - 20))`;
  if (unit === 'F') code = `(${code} * 9 / 5 + 32)`;
  
  return [code, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['tinkercad_ir_sensor'] = function(block) {
  // Include the IR library
  arduinoGenerator.definitions_['include_ir'] = '#include <IRremote.h>';

  // Global counters (kept for compatibility with example code)
  arduinoGenerator.definitions_['var_ir_i'] = 'int i = 0;';
  arduinoGenerator.definitions_['var_ir_j'] = 'int j = 0;';

  // Map the IR code to the corresponding remote button.
  // Return -1 if the supplied code does not map to a key.
  arduinoGenerator.definitions_['func_ir_map'] =
`// Map the IR code to the corresponding remote button.
// The buttons are in this order on the remote:
//    0   1   2
//    4   5   6
//    8   9  10
//   12  13  14
//   16  17  18
//   20  21  22
//   24  25  26
//
// Return -1, if supplied code does not map to a key.
int mapCodeToButton(unsigned long code) {
  // For the remote used in the Tinkercad simulator,
  // the buttons are encoded such that the hex code
  // received is of the format: 0xiivvBF00
  // Where the vv is the button value, and ii is
  // the bit-inverse of vv.

  // Check for codes from this specific remote
  if ((code & 0x0000FFFF) == 0x0000BF00) {
    // No longer need the lower 16 bits. Shift the code by 16
    // to make the rest easier.
    code >>= 16;
    // Check that the value and inverse bytes are complementary.
    if (((code >> 8) ^ (code & 0x00FF)) == 0x00FF) {
      return code & 0xFF;
    }
  }
  return -1;
}`;

  // readInfrared: attempts to decode an IR code and map it to a button
  arduinoGenerator.definitions_['func_ir_read'] =
`int readInfrared() {
  int result = -1;
  // Check if we've received a new code
  if (IrReceiver.decode()) {
    // Get the infrared code
    unsigned long code = IrReceiver.decodedIRData.decodedRawData;
    // Map it to a specific button on the remote
    result = mapCodeToButton(code);
    // Enable receiving of the next value
    IrReceiver.resume();
  }
  return result;
}`;

  // Ensure the IR receiver is initialized in setup when this block is present
  arduinoGenerator.setups_['setup_ir'] = 'IrReceiver.begin(0);';

  return [`readInfrared()`, arduinoGenerator.ORDER_ATOMIC];
};
arduinoGenerator.forBlock['esp32_digital_read'] = function(block) {
  const pin = block.getFieldValue('PIN');
  return [`digitalRead(${pin})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};
arduinoGenerator.forBlock['esp32_serial_print'] = function(block) {
  const text = arduinoGenerator.valueToCode(block, 'TEXT', arduinoGenerator.ORDER_NONE) || '""';
  return `Serial.println(${text});\n`;
};
arduinoGenerator.forBlock['tinkercad_repeat'] = function(block) {
  const times = block.getFieldValue('TIMES');
  const branch = arduinoGenerator.statementToCode(block, 'DO');
  
  // Creates a standard C++ for-loop
  return `for (int counter = 0; counter < ${times}; ++counter) {\n${branch}}\n`;
};

// Repeat While / Until
arduinoGenerator.forBlock['tinkercad_repeat_while_until'] = function(block) {
  const mode = block.getFieldValue('MODE') || 'WHILE';
  const cond = arduinoGenerator.valueToCode(block, 'COND', arduinoGenerator.ORDER_NONE) || 'false';
  const branch = arduinoGenerator.statementToCode(block, 'DO');

  if (mode === 'WHILE') {
    return `while (${cond}) {\n${branch}}\n`;
  } else {
    // 'UNTIL' semantics: run body, then repeat until condition becomes true
    return `do {\n${branch}} while (!(${cond}));\n`;
  }
};

// Defensive alias: some Blockly environments look up generator functions directly on the
// generator object by block type name. Provide a fallback alias to ensure generation.
arduinoGenerator['tinkercad_repeat_while_until'] = arduinoGenerator.forBlock['tinkercad_repeat_while_until'];

arduinoGenerator.forBlock['tinkercad_set_builtin_led'] = function(block) {
  const state = block.getFieldValue('STATE');
  return `digitalWrite(LED_BUILTIN, ${state});\n`;
};

arduinoGenerator.forBlock['tinkercad_rotate_servo'] = function(block) {
  const pin = block.getFieldValue('PIN');
  const degree = block.getFieldValue('DEGREE');
  
  // Inject Library and Global Variable
  arduinoGenerator.definitions_['include_servo'] = '#include <Servo.h>';
  arduinoGenerator.definitions_[`var_servo_${pin}`] = `Servo servo_${pin};`;
  
  // Inject Setup Code
  arduinoGenerator.setups_[`setup_servo_${pin}`] = `servo_${pin}.attach(${pin}, 500, 2500);`;
  
  return `servo_${pin}.write(${degree});\n`;
};

arduinoGenerator.forBlock['tinkercad_play_speaker'] = function(block) {
  const pin = block.getFieldValue('PIN');
  const tone = block.getFieldValue('TONE');
  const duration = block.getFieldValue('DURATION');
  
  // Inject Setup Code
  arduinoGenerator.setups_[`setup_speaker_${pin}`] = `pinMode(${pin}, OUTPUT);`;
  
  const freq = Math.round(440 * Math.pow(2, (tone - 69) / 12)); 
  const durationMs = duration * 1000;
  
  return `tone(${pin}, ${freq}, ${durationMs}); // play tone ${tone} (${freq} Hz)\n`;
};

arduinoGenerator.forBlock['tinkercad_turn_off_speaker'] = function(block) {
  const pin = block.getFieldValue('PIN');
  
  // Inject Setup Code
  arduinoGenerator.setups_[`setup_speaker_${pin}`] = `pinMode(${pin}, OUTPUT);`;
  
  return `noTone(${pin});\n`;
};
arduinoGenerator.forBlock['tinkercad_analog_write'] = function(block) {
  const pin = block.getFieldValue('PIN');
  const value = block.getFieldValue('VALUE');
  
  // Inject Setup Code automatically
  arduinoGenerator.setups_[`setup_pin_${pin}`] = `pinMode(${pin}, OUTPUT);`;
  
  return `analogWrite(${pin}, ${value});\n`;
};
arduinoGenerator.forBlock['tinkercad_serial_print'] = function(block) {
  const text = block.getFieldValue('TEXT');
  const newline = block.getFieldValue('NEWLINE');
  
  // Inject Setup Code
  arduinoGenerator.setups_['setup_serial'] = `Serial.begin(9600);`;
  
  const command = newline === 'with' ? 'println' : 'print';
  return `Serial.${command}("${text}");\n`;
};
arduinoGenerator.forBlock['math_arithmetic_custom'] = function(block) {
  const a = block.getFieldValue('A') || '0';
  const b = block.getFieldValue('B') || '0';
  const op = block.getFieldValue('OP');

  let code;
  if (op === '^') {
    code = `pow(${a}, ${b})`;
    return [code, arduinoGenerator.ORDER_FUNCTION_CALL];
  } else {
    code = `${a} ${op} ${b}`;
    return [code, arduinoGenerator.ORDER_ATOMIC];
  }
};

arduinoGenerator.forBlock['math_compare_custom'] = function(block) {
  const a = block.getFieldValue('A') || '0';
  const b = block.getFieldValue('B') || '0';
  const op = block.getFieldValue('OP');
  return [`${a} ${op} ${b}`, arduinoGenerator.ORDER_RELATIONAL];
};

arduinoGenerator.forBlock['math_random_int'] = function(block) {
  const from = block.getFieldValue('FROM') || '1';
  const to = block.getFieldValue('TO') || '100';
  return [`random(${from}, ${to} + 1)`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

arduinoGenerator.forBlock['math_logic_operation'] = function(block) {
  const a = arduinoGenerator.valueToCode(block, 'A', arduinoGenerator.ORDER_LOGICAL_AND) || 'false';
  const b = arduinoGenerator.valueToCode(block, 'B', arduinoGenerator.ORDER_LOGICAL_AND) || 'false';
  const op = block.getFieldValue('OP');
  return [`${a} ${op} ${b}`, arduinoGenerator.ORDER_LOGICAL_AND];
};

arduinoGenerator.forBlock['math_logic_not'] = function(block) {
  const bool = arduinoGenerator.valueToCode(block, 'BOOL', arduinoGenerator.ORDER_LOGICAL_NOT) || 'false';
  return [`!${bool}`, arduinoGenerator.ORDER_LOGICAL_NOT];
};

arduinoGenerator.forBlock['math_single_func'] = function(block) {
  const func = block.getFieldValue('OP');
  const num = block.getFieldValue('NUM') || '0';
  return [`${func}(${num})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

arduinoGenerator.forBlock['math_map'] = function(block) {
  const val = block.getFieldValue('VAL') || '0';
  const min = block.getFieldValue('MIN') || '0';
  const max = block.getFieldValue('MAX') || '1023';
  // Following Tinkercad's implicit 0-1023 input range for sensors
  return [`map(${val}, 0, 1023, ${min}, ${max})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

arduinoGenerator.forBlock['math_constrain'] = function(block) {
  const val = block.getFieldValue('VAL') || '0';
  const min = block.getFieldValue('MIN') || '0';
  const max = block.getFieldValue('MAX') || '255';
  return [`constrain(${val}, ${min}, ${max})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

// Number literal
arduinoGenerator.forBlock['math_number'] = function(block) {
  const num = block.getFieldValue('NUM');
  return [String(num), arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['math_constant_high_low'] = function(block) {
  return [block.getFieldValue('STATE'), arduinoGenerator.ORDER_ATOMIC];
};
arduinoGenerator.forBlock['tinkercad_if'] = function(block) {
  // Use valueToCode to read the hexagonal Comparison block
  const argument = arduinoGenerator.valueToCode(block, 'IF0', arduinoGenerator.ORDER_NONE) || 'false';
  const branch = arduinoGenerator.statementToCode(block, 'DO0');
  return `if (${argument}) {\n${branch}}\n`;
};
arduinoGenerator.forBlock['notation_title_comment'] = function(block) {
  const text = block.getFieldValue('TEXT');
  // Returns a multi-line C-style comment block
  return `/*\n  ${text}\n*/\n`;
};

arduinoGenerator.forBlock['notation_single_comment'] = function(block) {
  const text = block.getFieldValue('TEXT');
  // Returns a single-line C++ style comment
  return `// ${text}\n`;
};


// ═══════════════════════════════════════════════
// VARIABLE GENERATORS
// ═══════════════════════════════════════════════

// Helper: resolve variable name + type from a block VAR field
function _varInfo(block) {
  const id  = block.getFieldValue('VAR');
  const v   = workspace.getVariableById(id);
  return v ? { name: v.name, type: v.type || 'int' } : { name: 'x', type: 'int' };
}
// Helper: default C++ value for each type
function _varDefault(type) {
  return type === 'String' ? '""' : type === 'bool' ? 'false' : type === 'float' ? '0.0' : '0';
}
// Helper: inject global declaration
function _varDecl(name, type) {
  arduinoGenerator.definitions_['var_' + name] =
    type + ' ' + name + ' = ' + _varDefault(type) + ';';
}

// GET  — pill-shaped block that returns the variable value
function _genGet(block) {
  const { name, type } = _varInfo(block);
  _varDecl(name, type);
  return [name, arduinoGenerator.ORDER_ATOMIC];
}
arduinoGenerator.forBlock['variables_get']        = _genGet;
arduinoGenerator.forBlock['variables_get_custom'] = _genGet;

// SET  — "set [var] to [value]"
function _genSet(block) {
  const { name, type } = _varInfo(block);
  const val = arduinoGenerator.valueToCode(
    block, 'VALUE', arduinoGenerator.ORDER_ASSIGNMENT) || _varDefault(type);
  _varDecl(name, type);
  return name + ' = ' + val + ';\n';
}
arduinoGenerator.forBlock['variables_set']        = _genSet;
arduinoGenerator.forBlock['variables_set_custom'] = _genSet;

// CHANGE  — "change [var] by [delta]"
function _genChange(block) {
  const { name, type } = _varInfo(block);
  const delta = arduinoGenerator.valueToCode(
    block, 'VALUE', arduinoGenerator.ORDER_ADDITIVE) || '1';
  _varDecl(name, type);
  return name + ' += ' + delta + ';\n';
}
arduinoGenerator.forBlock['math_change']             = _genChange;
arduinoGenerator.forBlock['variables_change_custom'] = _genChange;

// Generator for the non-editable 'i' block
arduinoGenerator.forBlock['variable_i_block'] = function(block) {
  _varDecl('i', 'int');
  return ['i', arduinoGenerator.ORDER_ATOMIC];
};

const toolbox = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Output",
      colour: "#4598FC",
      contents: [
        
        { kind: "block", type: "esp32_pin_mode" },
        { kind: "block", type: "tinkercad_analog_write" },
        { kind: "block", type: "esp32_digital_write" },
        { kind: "block", type: "tinkercad_set_builtin_led" },
        { kind: "block", type: "tinkercad_rotate_servo" },
        { kind: "block", type: "tinkercad_play_speaker" },
        { kind: "block", type: "tinkercad_turn_off_speaker" },
        { kind: "block", type: "tinkercad_serial_print" }
      ],
    },
    {
      kind: "category",
      name: "Input",
      colour: "#9965F9",
      contents: [
        { kind: "block", type: "tinkercad_digital_read" },
        { kind: "block", type: "tinkercad_analog_read" },
        { kind: "block", type: "tinkercad_servo_read" },
        { kind: "block", type: "tinkercad_serial_available" },
        { kind: "block", type: "tinkercad_serial_read" },
        { kind: "block", type: "tinkercad_ultrasonic" },
        { kind: "block", type: "tinkercad_temperature" },
        { kind: "block", type: "tinkercad_ir_sensor" }
      ],
    },
    {
      kind: "category",
      name: "Math",
      colour: "#42BC49",
      contents: [
        { kind: "block", type: "math_arithmetic_custom" },
        { kind: "block", type: "math_compare_custom" },
        { kind: "block", type: "math_random_int" },
        { kind: "block", type: "math_logic_operation" },
        { kind: "block", type: "math_logic_not" },
        { kind: "block", type: "math_single_func" },
        { kind: "block", type: "math_map" },
        { kind: "block", type: "math_constrain" },
        { kind: "block", type: "math_constant_high_low" }
      ],
    },
    {
      kind: "category",
      name: "Control",
      colour: "#FCAA1A",
      contents: [
        { kind: "block", type: "esp32_delay" },
        { kind: "block", type: "esp32_setup_loop" },
        { kind: "block", type: "tinkercad_repeat" },
        { kind: "block", type: "tinkercad_repeat_while_until" },
        { kind: "block", type: "tinkercad_if" },
        { kind: "block", type: "tinkercad_if_else" },
        { kind: "block", type: "tinkercad_count" }
      ],
    },
    {
      kind: "category",
      name: "Notation",
      colour: "#959593",
      contents: [
        { kind: "block", type: "notation_title_comment" },
        { kind: "block", type: "notation_single_comment" }
      ],
    },
    {
      kind: "category",
      name: "Variables",
      colour: "#D55CD6",
      contents: [
        { kind: "block", type: "variable_i_block" },
        { kind: "block", type: "variables_get_custom" },
        {
          kind: "block",
          type: "variables_set_custom",
          inputs: { "VALUE": { "shadow": { "type": "math_number", "fields": { "NUM": 0 } } } }
        },
        {
          kind: "block",
          type: "variables_change_custom",
          inputs: { "VALUE": { "shadow": { "type": "math_number", "fields": { "NUM": 1 } } } }
        },
        {
          kind: "button",
          text: "Create variable...",
          callbackKey: "CREATE_VARIABLE"
        }
      ]
    }
  ],
};

// ═══════════════════════════════════════════════
// 4. INJECT BLOCKLY
// ═══════════════════════════════════════════════

const workspace = Blockly.inject("blockly-div", {
  toolbox,
  scrollbars: true,
  trashcan: true,
  grid: { spacing: 20, length: 3, colour: "#ddd", snap: true },
  zoom: { controls: true, wheel: true, startScale: 1.0 },
});

// ═══════════════════════════════════════════════
// 5. LIVE CODE PREVIEW
// ═══════════════════════════════════════════════
function updateCodePanel() {
  const view = document.getElementById("code-view");
  const { setupCode, loopCode, definitions, setups, titleComment } = buildProgramSections();
 
  // Ensure preview includes declarations for all workspace variables
  let definitionsCombined = definitions || '';
  try {
    const vars = workspace.getAllVariables ? workspace.getAllVariables() : (workspace.getVariableMap ? workspace.getVariableMap().getAllVariables() : []);
    const varDecls = (vars || []).map(v => {
      const tp = v.type || 'int';
      return tp + ' ' + v.name + ' = ' + _varDefault(tp) + ';';
    });
    const existing = (definitions || '').split('\n').filter(Boolean);
    const merged = Array.from(new Set(varDecls.concat(existing)));
    definitionsCombined = merged.join('\n');
  } catch (e) { /* ignore */ }

  const fullCode =
  `// Auto-generated Arduino Code for ESP32
  ${titleComment}
  ${definitionsCombined}

  void setup() {
  ${setups}
  ${setupCode}}
 
  void loop() {
  ${loopCode}
    delay(10); // Standard simulation delay
  }`;
 
  // Simple Highlighter
  // Escape HTML so C++ angle-bracket includes render correctly in the preview
  const escaped = fullCode
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  view.innerHTML = escaped
    // Add keywords to the highlighted commands
    .replace(/\b(for|int|void|setup|loop|if|else|pinMode|delay|Serial|begin)\b/g, '<span class="cmd">$1</span>')
    .replace(/(\/\/.*$)/gm, '<span class="cmt">$1</span>');
}

workspace.addChangeListener(updateCodePanel);
updateCodePanel();
 
// ═══════════════════════════════════════════════
// 6. READ COMMANDS FOR PLAY BUTTON
// ═══════════════════════════════════════════════
 
function getProgramCommands() {
  const { loopCode } = buildProgramSections();
  const trimmedLoop = loopCode.trim();
  if (!trimmedLoop) return [];
  if (!loopCode) return [];
 
  const commands = [];
 
  trimmedLoop.split("\n").forEach((line) => {
    line = line.trim();
    if (!line || line === "}") return;
 
    const match = line.match(/^(\w+)\(([^)]*)\)/);
    if (!match) return;
 
    const cmd   = match[1];
    const value = match[2] ? Number(match[2]) : 0;
    commands.push({ cmd, value });
  });
 
  return commands;
}
 
// ═══════════════════════════════════════════════════════════════════════════
// TYPED VARIABLE CREATION MODAL
// Blockly's custom:"VARIABLE" category shows a "Create variable" button.
// That button fires the callback registered as 'CREATE_VARIABLE'.
// We register our own handler here to show a styled modal with type selection.
// After the user confirms, workspace.createVariable(name, type) is called —
// Blockly automatically fires VAR_CREATE which refreshes the flyout.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  // ── 1. Build modal HTML once ─────────────────────────────────────────────
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="_vm_overlay" style="display:none;position:fixed;inset:0;
        background:rgba(0,0,0,.55);z-index:9999;
        align-items:center;justify-content:center;">
      <div style="background:#1e2030;border-radius:12px;padding:26px 30px;
          width:290px;box-shadow:0 8px 32px rgba(0,0,0,.5);
          font-family:sans-serif;color:#cdd6f4;">
        <h3 style="margin:0 0 14px;font-size:15px;color:#cba6f7;">
          Create Variable
        </h3>
        <label style="font-size:12px;color:#a6adc8;">Variable name</label><br>
        <input id="_vm_name" type="text" placeholder="e.g.  speed"
          style="width:100%;box-sizing:border-box;margin:5px 0 14px;
                 padding:8px 10px;border-radius:6px;border:1px solid #45475a;
                 background:#313244;color:#cdd6f4;font-size:14px;outline:none;">
        <label style="font-size:12px;color:#a6adc8;">Type</label>
        <div id="_vm_types" style="display:flex;gap:6px;margin:7px 0 20px;
             flex-wrap:wrap;"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button id="_vm_cancel" style="padding:7px 16px;border-radius:6px;
              border:1px solid #45475a;background:transparent;
              color:#a6adc8;cursor:pointer;font-size:13px;">Cancel</button>
          <button id="_vm_ok" style="padding:7px 16px;border-radius:6px;
              border:none;background:#cba6f7;color:#1e1e2e;
              font-weight:bold;cursor:pointer;font-size:13px;">Create</button>
        </div>
      </div>
    </div>
    <style>
      ._vmtb { padding:5px 12px;border-radius:5px;border:1px solid #45475a;
               background:#313244;color:#cdd6f4;cursor:pointer;font-size:12px; }
      ._vmtb.on { background:#cba6f7!important;color:#1e1e2e!important;
                  border-color:#cba6f7!important;font-weight:bold; }
    </style>`;
  document.body.appendChild(wrap);

  // ── 2. Build type buttons ────────────────────────────────────────────────
  let _chosenType = 'int';
  const _typesDiv = document.getElementById('_vm_types');
  ['int','float','bool','String'].forEach(function(t) {
    const b = document.createElement('button');
    b.className = '_vmtb' + (t === 'int' ? ' on' : '');
    b.textContent = t;
    b.onclick = function() {
      _chosenType = t;
      _typesDiv.querySelectorAll('._vmtb').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
    };
    _typesDiv.appendChild(b);
  });

  // ── 3. Open / close helpers ──────────────────────────────────────────────
  function _vmOpen() {
    _chosenType = 'int';
    _typesDiv.querySelectorAll('._vmtb').forEach(function(x){ x.classList.remove('on'); });
    _typesDiv.querySelector('._vmtb').classList.add('on');
    document.getElementById('_vm_name').value = '';
    document.getElementById('_vm_overlay').style.display = 'flex';
    setTimeout(function(){ document.getElementById('_vm_name').focus(); }, 40);
  }
  function _vmClose() {
    document.getElementById('_vm_overlay').style.display = 'none';
  }

  // Bridge for Blockly.prompt: allow Blockly to use our modal instead of window.prompt
  let _pendingPromptCallback = null;
  window._vmPrompt = function(cb) {
    _pendingPromptCallback = typeof cb === 'function' ? cb : null;
    _vmOpen();
  };

  // ── 4. Confirm: create variable + let Blockly refresh flyout ────────────
  function _vmConfirm() {
    const raw = (document.getElementById('_vm_name').value || '').trim();
    if (!raw) { alert('Please enter a variable name.'); return; }
    // Sanitise: only letters / digits / underscore, cannot start with digit
    const name = raw.replace(/[^a-zA-Z0-9_]/g,'_').replace(/^([0-9])/,'_$1');

    // Create variable — Blockly fires VAR_CREATE which auto-refreshes the flyout
    if (!workspace.getVariable(name, _chosenType)) {
      workspace.createVariable(name, _chosenType);
    }
    // Immediately inject a global declaration so the preview shows the variable
    try {
      if (typeof _varDecl === 'function') {
        _varDecl(name, _chosenType);
      } else if (window.arduinoGenerator && window.arduinoGenerator.definitions_) {
        // fallback: directly add to definitions_
        window.arduinoGenerator.definitions_ = window.arduinoGenerator.definitions_ || {};
        window.arduinoGenerator.definitions_['var_' + name] = _chosenType + ' ' + name + ' = ' + _varDefault(_chosenType) + ';';
      }
    } catch (e) { /* ignore */ }

    // Refresh toolbox so the new variable appears in the static flyout
    try { workspace.updateToolbox(toolbox); } catch (e) { /* ignore */ }

    // Refresh code preview immediately
    try { if (window.updateCodePanel) window.updateCodePanel(); } catch (e) { /* ignore */ }

    // If Blockly.prompt requested a callback, call it with the created name
    if (_pendingPromptCallback) {
      try { _pendingPromptCallback(name); } catch (e) { /* ignore */ }
      _pendingPromptCallback = null;
    }

    _vmClose();
  }

  document.getElementById('_vm_cancel').onclick = _vmClose;
  document.getElementById('_vm_ok').onclick     = _vmConfirm;
  document.getElementById('_vm_name').onkeydown = function(e){
    if (e.key === 'Enter') _vmConfirm();
  };
  document.getElementById('_vm_overlay').onclick = function(e){
    if (e.target.id === '_vm_overlay') _vmClose();
  };

  // ── 5. Register as the "Create variable" button handler ─────────────────
  //    Register synchronously now that the modal (_vmOpen) exists.
  //    'CREATE_VARIABLE' is the callback name Blockly's custom:"VARIABLE" uses.
  if (workspace && workspace.registerButtonCallback) {
    try { workspace.registerButtonCallback('CREATE_VARIABLE', _vmOpen); } catch (e) { /* ignore */ }
  }
  // Override Blockly.prompt so Blockly's built-in create-variable flow uses our modal
  if (window.Blockly && typeof window.Blockly.prompt === 'function') {
    window.Blockly.prompt = function(message, defaultValue, callback) {
      // Use our modal bridge; Blockly expects prompt to invoke callback with the result
      window._vmPrompt(callback);
    };
  }
})();

setTimeout(function () {
  const toolboxObj = workspace.getToolbox();
  if (toolboxObj) {
    toolboxObj.selectItemByPosition(0);
  }
}, 100);
