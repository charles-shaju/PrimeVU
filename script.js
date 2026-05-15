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

// ── 7. Play button (placeholder for now) ──────────────────
btnPlay.addEventListener("click", function() {
  // collect all commands in order
  const items = programList.querySelectorAll(".program-item");

  if (items.length === 0) {
    alert("Add some blocks first!");
    return;
  }

  // build the command list
  const commands = [];
  items.forEach(function(item) {
    commands.push({
      cmd:   item.dataset.cmd,
      value: Number(item.dataset.value),
    });
  });

  console.log("Program to run:", commands);
  alert("Program ready! Check the console. WebSocket comes in Step 3.");
});





 git config --global user.email "you@example.com"
  git config --global user.name "Your Name"
