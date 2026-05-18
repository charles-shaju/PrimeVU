// ── Draggable divider between Blockly and code panel ──────
const divider = document.getElementById("divider");
const blocklyWrap = document.getElementById("blockly-wrap");
const codePanel = document.getElementById("code-panel");

let dragging = false;

divider.addEventListener("mousedown", () => {
  dragging = true;
});

document.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const main = divider.parentElement;
  const mainRect = main.getBoundingClientRect();
  const leftWidth = e.clientX - mainRect.left;
  const totalWidth = mainRect.width - 6; 

  if (leftWidth < 250 || leftWidth > totalWidth - 180) return;

  blocklyWrap.style.flex = "none";
  blocklyWrap.style.width = leftWidth + "px";
  codePanel.style.flex = "none";
  codePanel.style.width = totalWidth - leftWidth + "px";

  Blockly.svgResize(workspace);
});

document.addEventListener("mouseup", () => {
  dragging = false;
});

// ── View toggle (Blocks / Blocks + Code) ──────────────────
document.getElementById("view-select").addEventListener("change", function () {
  if (this.value === "blocks") {
    codePanel.style.display = "none";
    divider.style.display = "none";
    blocklyWrap.style.width = "100%";
  } else {
    codePanel.style.display = "flex";
    divider.style.display = "block";
    blocklyWrap.style.width = "";
    blocklyWrap.style.flex = "2";
    codePanel.style.width = "";
    codePanel.style.flex = "1";
  }
  Blockly.svgResize(workspace);
});

// ── Copy button ───────────────────────────────────────────
document.getElementById("btn-copy").addEventListener("click", function () {
  const code = document.getElementById("code-view").innerText;
  navigator.clipboard.writeText(code).then(() => {
    this.textContent = "Copied!";
    setTimeout(() => (this.textContent = "Copy"), 1500);
  });
});

// ── Clear all workspace blocks ─────────────────────────────
document.getElementById("btn-clear-workspace").addEventListener("click", function () {
    if (confirm("Clear all blocks?")) {
      workspace.clear();
    }
});

// ── Play button logic ──────────────────────────────────────
const btnPlay = document.getElementById("btn-play");

btnPlay.addEventListener("click", function () {
  const commands = getProgramCommands();

  if (commands.length === 0) {
    alert("Drag some blocks into the workspace first!");
    return;
  }

  console.log("Running program:", commands);
  // Add your connection logic to your ESP32 here
  programFinished(); 
});

function programFinished() {
  document.getElementById("overlay").style.display = "flex";
}

// ── Close overlay ─────────────────────────────────────────
function closeOverlay() {
  document.getElementById("overlay").style.display = "none";
}