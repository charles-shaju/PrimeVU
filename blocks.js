// ═══════════════════════════════════════════════
// 1. BLOCK DEFINITIONS
// ═══════════════════════════════════════════════

Blockly.defineBlocksWithJsonArray([
  // ── MOVEMENT ────────────────────────────────
  // ── NOTATION ────────────────────────────────
  {
    type: "robot_comment",
    message0: "// note: %1",
    args0: [{ type: "field_input", name: "NOTE", text: "write note here" }],
    previousStatement: null,
    nextStatement: null,
    colour: 160,
    tooltip: "Add a comment/note",
  },
  {
    type: "robot_print",
    message0: "print %1",
    args0: [{ type: "field_input", name: "TEXT", text: "hello" }],
    previousStatement: null,
    nextStatement: null,
    colour: 160,
    tooltip: "Print to serial monitor",
  },
  {
    type: "robot_move_forward",
    message0: "🔵 move forward %1 cm",
    args0: [
      { type: "field_number", name: "DISTANCE", value: 10, min: 1, max: 500 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Move the robot forward",
  },
  {
    type: "robot_move_back",
    message0: "🔵 move back %1 cm",
    args0: [
      { type: "field_number", name: "DISTANCE", value: 10, min: 1, max: 500 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Move the robot backward",
  },
  {
    type: "robot_turn_left",
    message0: "🔵 turn left %1 °",
    args0: [
      { type: "field_number", name: "DEGREES", value: 90, min: 1, max: 360 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Turn left by degrees",
  },
  {
    type: "robot_turn_right",
    message0: "🔵 turn right %1 °",
    args0: [
      { type: "field_number", name: "DEGREES", value: 90, min: 1, max: 360 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Turn right by degrees",
  },
  {
    type: "robot_stop",
    message0: "🔵 stop motors",
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Stop all motors",
  },
  {
    type: "robot_set_speed",
    message0: "🔵 set speed %1 %",
    args0: [
      { type: "field_number", name: "SPEED", value: 50, min: 0, max: 100 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Set motor speed (0-100%)",
  },

  // ── OUTPUT ───────────────────────────────────

  {
    type: "robot_led_on",
    message0: "💡 LED on",
    previousStatement: null,
    nextStatement: null,
    colour: 60,
    tooltip: "Turn the LED on",
  },
  {
    type: "robot_led_off",
    message0: "💡 LED off",
    previousStatement: null,
    nextStatement: null,
    colour: 60,
    tooltip: "Turn the LED off",
  },
  {
    type: "robot_beep",
    message0: "🔔 beep for %1 seconds",
    args0: [
      { type: "field_number", name: "DURATION", value: 1, min: 0.1, max: 10 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 45,
    tooltip: "Make a beep sound",
  },
  {
    type: "robot_servo",
    message0: "🦾 rotate servo to %1 °",
    args0: [
      { type: "field_number", name: "ANGLE", value: 90, min: 0, max: 180 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 45,
    tooltip: "Rotate servo motor",
  },

  // ── INPUT / SENSORS ──────────────────────────

  {
    type: "robot_read_distance",
    message0: "📡 read distance (cm)",
    output: "Number",
    colour: 290,
    tooltip: "Read ultrasonic distance sensor",
  },
  {
    type: "robot_read_ir",
    message0: "⚫ read IR sensor",
    output: "Number",
    colour: 290,
    tooltip: "Read IR sensor value",
  },

  // ── CONTROL ──────────────────────────────────

  {
    type: "robot_wait",
    message0: "⏱ wait %1 seconds",
    args0: [
      { type: "field_number", name: "SECONDS", value: 1, min: 0.1, max: 60 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 30,
    tooltip: "Wait before next step",
  },
  {
    type: "robot_repeat",
    message0: "🔁 repeat %1 times",
    args0: [
      { type: "field_number", name: "TIMES", value: 3, min: 1, max: 100 },
    ],
    message1: "do %1",
    args1: [{ type: "input_statement", name: "DO" }],
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: "Repeat blocks multiple times",
  },
]);

// ═══════════════════════════════════════════════
// 2. CODE GENERATOR
// Each block returns a readable command string
// ═══════════════════════════════════════════════

const robotGenerator = new Blockly.Generator("ROBOT");

// Required by Blockly — handles unknown blocks
robotGenerator.scrub_ = function (block, code) {
  const next = block.nextConnection && block.nextConnection.targetBlock();
  return code + (next ? robotGenerator.blockToCode(next) : "");
};

robotGenerator.forBlock["robot_move_forward"] = function (block) {
  const d = block.getFieldValue("DISTANCE");
  return `move_forward(${d})\n`;
};
robotGenerator.forBlock["robot_comment"] = function (block) {
  const note = block.getFieldValue("NOTE");
  return `// ${note}\n`;
};

robotGenerator.forBlock["robot_print"] = function (block) {
  const text = block.getFieldValue("TEXT");
  return `print("${text}")\n`;
};
robotGenerator.forBlock["robot_move_back"] = function (block) {
  const d = block.getFieldValue("DISTANCE");
  return `move_back(${d})\n`;
};

robotGenerator.forBlock["robot_turn_left"] = function (block) {
  const deg = block.getFieldValue("DEGREES");
  return `turn_left(${deg})\n`;
};

robotGenerator.forBlock["robot_turn_right"] = function (block) {
  const deg = block.getFieldValue("DEGREES");
  return `turn_right(${deg})\n`;
};

robotGenerator.forBlock["robot_stop"] = function () {
  return `stop()\n`;
};

robotGenerator.forBlock["robot_set_speed"] = function (block) {
  const s = block.getFieldValue("SPEED");
  return `set_speed(${s})\n`;
};

robotGenerator.forBlock["robot_led_on"] = function () {
  return `led_on()\n`;
};

robotGenerator.forBlock["robot_led_off"] = function () {
  return `led_off()\n`;
};

robotGenerator.forBlock["robot_beep"] = function (block) {
  const dur = block.getFieldValue("DURATION");
  return `beep(${dur})\n`;
};

robotGenerator.forBlock["robot_servo"] = function (block) {
  const angle = block.getFieldValue("ANGLE");
  return `servo(${angle})\n`;
};

robotGenerator.forBlock["robot_wait"] = function (block) {
  const sec = block.getFieldValue("SECONDS");
  return `wait(${sec})\n`;
};

robotGenerator.forBlock["robot_repeat"] = function (block) {
  const times = block.getFieldValue("TIMES");
  const inner = robotGenerator.statementToCode(block, "DO");
  return `repeat(${times}) {\n${inner}}\n`;
};

robotGenerator.forBlock["robot_read_distance"] = function () {
  return [`read_distance()`, Blockly.Generator.ORDER_FUNCTION_CALL];
};

robotGenerator.forBlock["robot_read_ir"] = function () {
  return [`read_ir()`, Blockly.Generator.ORDER_FUNCTION_CALL];
};

const toolbox = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Output",
      colour: "#4598FC",
      contents: [
        { kind:"category", name:"Output",    colour:"#4598FC"},
        { kind:"category", name:"Input",     colour:"#9965F9" },
        { kind:"category", name:"Notation",  colour:"#959593" },
        { kind:"category", name:"Control",   colour:"#FCAA1A" },
        { kind:"category", name:"Math",      colour:"#42BC49" },
        { kind:"category", name:"Variables", colour:"#D55CD6", custom:"VARIABLE" }
      ],
    },
    {
      kind: "category",
      name: "Input",
      colour: "#9965F9",
      contents: [
        { kind: "block", type: "robot_read_distance" },
        { kind: "block", type: "robot_read_ir" },
      ],
    },
    {
      kind: "category",
      name: "Notation",
      colour: "#959593",
      contents: [
        { kind: "block", type: "robot_comment" },
        { kind: "block", type: "robot_print" },
      ],
    },
    {
      kind: "category",
      name: "Control",
      colour: "#FCAA1A",
      contents: [
        { kind: "block", type: "robot_wait" },
        { kind: "block", type: "robot_repeat" },
      ],
    },
    {
      kind: "category",
      name: "Math",
      colour: "#42BC49",
      contents: [
        { kind: "block", type: "math_number" },
        { kind: "block", type: "math_arithmetic" },
        { kind: "block", type: "math_single" },
      ],
    },
    {
      kind: "category",
      name: "Variables",
      colour: "#D55CD6",
      custom: "VARIABLE",
    },
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
// 5. LIVE CODE PREVIEW (updates on every change)
// ═══════════════════════════════════════════════

function updateCodePanel() {
  const code = robotGenerator.workspaceToCode(workspace).trim();
  const view = document.getElementById("code-view");

  if (!code) {
    view.innerHTML =
      '<span style="color:#6c7086;font-style:italic">// Drag blocks to see commands here</span>';
    return;
  }

  // Syntax highlight: function name in blue, number in green
  const highlighted = code
    .split("\n")
    .map((line) => {
      if (!line.trim()) return "";
      // indent lines inside repeat blocks
      return line
        .replace(
          /^(\w+)(\()/,
          '<span style="color:#89b4fa;font-weight:bold">$1</span><span style="color:#cba6f7">$2</span>',
        )
        .replace(/(\d+\.?\d*)/g, '<span style="color:#a6e3a1">$1</span>')
        .replace(/(\))/g, '<span style="color:#cba6f7">$1</span>');
    })
    .join("\n");

  view.innerHTML = highlighted;
}

// Listen for any workspace change
workspace.addChangeListener(updateCodePanel);

// ═══════════════════════════════════════════════
// 6. READ COMMANDS FOR PLAY BUTTON
// ═══════════════════════════════════════════════

function getProgramCommands() {
  const code = robotGenerator.workspaceToCode(workspace).trim();
  if (!code) return [];

  const commands = [];

  // Parse each line into a command object
  code.split("\n").forEach((line) => {
    line = line.trim();
    if (!line || line === "}") return;

    const match = line.match(/^(\w+)\(([^)]*)\)/);
    if (!match) return;

    const cmd = match[1];
    const value = match[2] ? Number(match[2]) : 0;
    commands.push({ cmd, value });
  });

  return commands;
}
// Auto-select Output category when page loads
setTimeout(function () {
  const toolboxObj = workspace.getToolbox();
  if (toolboxObj) {
    toolboxObj.selectItemByPosition(0); // opens Output
  }
}, 100);
