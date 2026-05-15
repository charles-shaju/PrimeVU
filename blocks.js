// ── 1. Define what each block LOOKS like ─────────────────

Blockly.defineBlocksWithJsonArray([
  // Move Forward block
  {
    type: "robot_move_forward",
    message0: "move forward %1 cm",
    args0: [
      {
        type: "field_number", // a number the child can change
        name: "DISTANCE",
        value: 10, // default value
        min: 1,
        max: 200,
      },
    ],
    previousStatement: null, // can connect below another block
    nextStatement: null, // can connect above another block
    colour: 210, // blue
    tooltip: "Move the robot forward",
  },

  // Move Back block
  {
    type: "robot_move_back",
    message0: "move back %1 cm",
    args0: [
      { type: "field_number", name: "DISTANCE", value: 10, min: 1, max: 200 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Move the robot backward",
  },

  // Turn Left block
  {
    type: "robot_turn_left",
    message0: "turn left %1 degrees",
    args0: [
      { type: "field_number", name: "DEGREES", value: 90, min: 1, max: 360 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 120, // green
    tooltip: "Turn left",
  },

  // Turn Right block
  {
    type: "robot_turn_right",
    message0: "turn right %1 degrees",
    args0: [
      { type: "field_number", name: "DEGREES", value: 90, min: 1, max: 360 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: "Turn right",
  },

  // Beep block
  {
    type: "robot_beep",
    message0: "beep 🔔",
    previousStatement: null,
    nextStatement: null,
    colour: 45, // yellow
    tooltip: "Make a beep sound",
  },

  // Wait block
  {
    type: "robot_wait",
    message0: "wait %1 seconds",
    args0: [
      { type: "field_number", name: "SECONDS", value: 1, min: 0, max: 30 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 30, // orange
    tooltip: "Wait before next step",
  },

  // LED On block
  {
    type: "robot_led_on",
    message0: "LED on 💡",
    previousStatement: null,
    nextStatement: null,
    colour: 60, // lime
    tooltip: "Turn LED on",
  },

  // LED Off block
  {
    type: "robot_led_off",
    message0: "LED off",
    previousStatement: null,
    nextStatement: null,
    colour: 60,
    tooltip: "Turn LED off",
  },
]);

// ── 2. Define what each block PRODUCES (the generator) ────
// This is what we read when the child clicks Play
// Each block returns a command object as a JSON string

const robotGenerator = new Blockly.Generator("ROBOT");

// Tell Blockly how to read each block type
robotGenerator.forBlock["robot_move_forward"] = function (block) {
  const distance = block.getFieldValue("DISTANCE");
  return (
    JSON.stringify({ cmd: "move_forward", value: Number(distance) }) + "\n"
  );
};

robotGenerator.forBlock["robot_move_back"] = function (block) {
  const distance = block.getFieldValue("DISTANCE");
  return JSON.stringify({ cmd: "move_back", value: Number(distance) }) + "\n";
};

robotGenerator.forBlock["robot_turn_left"] = function (block) {
  const degrees = block.getFieldValue("DEGREES");
  return JSON.stringify({ cmd: "turn_left", value: Number(degrees) }) + "\n";
};

robotGenerator.forBlock["robot_turn_right"] = function (block) {
  const degrees = block.getFieldValue("DEGREES");
  return JSON.stringify({ cmd: "turn_right", value: Number(degrees) }) + "\n";
};

robotGenerator.forBlock["robot_beep"] = function (block) {
  return JSON.stringify({ cmd: "beep", value: 0 }) + "\n";
};

robotGenerator.forBlock["robot_wait"] = function (block) {
  const seconds = block.getFieldValue("SECONDS");
  return JSON.stringify({ cmd: "wait", value: Number(seconds) }) + "\n";
};

robotGenerator.forBlock["robot_led_on"] = function (block) {
  return JSON.stringify({ cmd: "led_on", value: 1 }) + "\n";
};

robotGenerator.forBlock["robot_led_off"] = function (block) {
  return JSON.stringify({ cmd: "led_off", value: 0 }) + "\n";
};

// ── 3. Define the toolbox (left panel block list) ─────────
// This controls which blocks the child sees and in what order

const toolbox = {
  kind: "flyoutToolbox", // flat list (no categories)
  contents: [
    { kind: "block", type: "robot_move_forward" },
    { kind: "block", type: "robot_move_back" },
    { kind: "block", type: "robot_turn_left" },
    { kind: "block", type: "robot_turn_right" },
    { kind: "block", type: "robot_beep" },
    { kind: "block", type: "robot_wait" },
    { kind: "block", type: "robot_led_on" },
    { kind: "block", type: "robot_led_off" },
  ],
};

// ── 4. Inject Blockly into the page ───────────────────────
const workspace = Blockly.inject("blockly-div", {
  toolbox: toolbox,
  scrollbars: true,
  trashcan: true, // show a bin to delete blocks
  grid: {
    spacing: 20,
    length: 3,
    colour: "#ccc",
    snap: true, // blocks snap to grid
  },
  zoom: {
    controls: true, // +/- zoom buttons
    wheel: true, // scroll to zoom
    startScale: 1.0,
  },
});

// ── 5. Read the program from the workspace ────────────────
// Call this when Play is clicked — returns array of commands

function getProgramCommands() {
  // generate the "code" string from all blocks in workspace
  const code = robotGenerator.workspaceToCode(workspace);

  if (!code.trim()) return []; // empty workspace

  // each line is one JSON command — split and parse
  const lines = code.trim().split("\n");
  const commands = [];

  lines.forEach(function (line) {
    if (!line.trim()) return;
    try {
      commands.push(JSON.parse(line));
    } catch (e) {
      console.log("Could not parse line:", line);
    }
  });

  return commands;
}
