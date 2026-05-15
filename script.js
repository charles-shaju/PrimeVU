// ── 1. Grab elements we need ──────────────────────────────
const programList = document.getElementById("program-list");
const btnClear    = document.getElementById("btn-clear");
const btnPlay     = document.getElementById("btn-play");

// ── 2. Define your blocks ─────────────────────────────────
// Each block has a label, a command name, and a default value
const blocks = [
  { label: "▶ Move Forward", cmd: "move_forward", value: 10 },
  { label: "◀ Move Back",    cmd: "move_back",    value: 10 },
  { label: "↰ Turn Left",    cmd: "turn_left",    value: 90 },
  { label: "↱ Turn Right",   cmd: "turn_right",   value: 90 },
  { label: "🔔 Beep",        cmd: "beep",         value: 0  },
  { label: "⏱ Wait",         cmd: "wait",         value: 1  },
];

// ── 3. Attach click listeners to every block button ───────
const blockButtons = document.querySelectorAll(".block");

blockButtons.forEach(function(btn, index) {
  btn.addEventListener("click", function() {
    addBlock(blocks[index]);
  });
});

// ── 4. Add a block to the program list ────────────────────
function addBlock(block) {
  // remove the "click a block" placeholder if it's there
  const emptyMsg = programList.querySelector(".empty-msg");
  if (emptyMsg) emptyMsg.remove();

  // create the card
  const item = document.createElement("div");
  item.classList.add("program-item");

  // show label + value (e.g. "▶ Move Forward — 10 cm")
  item.textContent = getLabel(block);

  // store the command data on the element so we can read it later
  item.dataset.cmd   = block.cmd;
  item.dataset.value = block.value;

  programList.appendChild(item);
}

// ── 5. Build a readable label ─────────────────────────────
function getLabel(block) {
  if (block.cmd === "move_forward") return block.label + " — " + block.value + " cm";
  if (block.cmd === "move_back")    return block.label + " — " + block.value + " cm";
  if (block.cmd === "turn_left")    return block.label + " — " + block.value + "°";
  if (block.cmd === "turn_right")   return block.label + " — " + block.value + "°";
  if (block.cmd === "wait")         return block.label + " — " + block.value + " sec";
  return block.label;
}

// ── 6. Clear button ───────────────────────────────────────
btnClear.addEventListener("click", function() {
  programList.innerHTML = "<p class='empty-msg'>Click a block to add it here</p>";
});

// ── Play button ───────────────────────────────────────────
btnPlay.addEventListener("click", function() {
  if (!isConnected) {
    alert("Not connected to robot! Connect to the robot's WiFi first.");
    return;
  }
  if (isRunning) return;

  // get commands from Blockly workspace  ← this is the only change
  const commands = getProgramCommands();

  if (commands.length === 0) {
    alert("Drag some blocks into the workspace first!");
    return;
  }

  console.log("Running program:", commands);
  runProgram(commands);
});

  // build the command list
  const commands = [];
  items.forEach(function(item) {
    commands.push({
      cmd:   item.dataset.cmd,
      value: Number(item.dataset.value),
    });
  });
function programFinished() {
  isRunning            = false;
  btnPlay.textContent  = "";
  btnPlay.innerHTML    = '<span class="play-icon">▶</span><span class="play-text">Play!</span>';
  btnPlay.disabled     = false;
  setStatus("connected", "Connected");

  // show the celebration overlay
  document.getElementById("overlay").style.display = "flex";
}

  // ── Step counter (updates the "3 steps" badge) ────────────
workspace.addChangeListener(function() {
  const items = programList.querySelectorAll(".program-item");
  const count = items.length;
  document.getElementById("step-count").textContent =
    count === 0 ? "0 steps" : count + (count === 1 ? " step" : " steps");
});

// ── Close overlay ─────────────────────────────────────────
function closeOverlay() {
  document.getElementById("overlay").style.display = "none";
}

