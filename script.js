// ── Global Variables ──────────────────────────────────────
let ESP32_IP = ""; // Holds the IP address from Bluetooth pairing

const notificationEl = document.getElementById("notification");

let notificationTimer = null;

function showNotification(message, type = "warning") {
  if (!notificationEl) return;

  notificationEl.textContent = message;
  notificationEl.className = `notification ${type} show`;

  if (notificationTimer) {
    clearTimeout(notificationTimer);
  }

  notificationTimer = setTimeout(() => {
    notificationEl.className = "notification";
    notificationEl.textContent = "";
  }, 3500);
}

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
const btnClearWorkspace = document.getElementById("btn-clear-workspace");
if (btnClearWorkspace) {
  btnClearWorkspace.addEventListener("click", function () {
    if (confirm("Clear all blocks?")) {
      workspace.clear();
    }
  });
}

// ── Bluetooth Pairing Logic ────────────────────────────────
const btnPair = document.getElementById("btn-pair");
const headerStatusText = document.getElementById("status-text");
const statusDot = document.getElementById("status-dot");
const ESP32_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const ESP32_IP_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

function setConnectionStatus(message, color) {
  if (headerStatusText) headerStatusText.innerText = message;
  if (headerStatusText) headerStatusText.style.color = color;
  if (statusDot) {
    statusDot.style.background = color;
    statusDot.classList.toggle("connected", color === "green");
  }
}

btnPair.addEventListener("click", async () => {
  try {
    setConnectionStatus("Scanning...", "orange");

    if (!window.isSecureContext) {
      showNotification("Bluetooth needs a secure connection. Open this app over https:// or localhost.", "warning");
      throw new Error("Bluetooth requires a secure origin. Open this app from https:// or localhost.");
    }

    if (!navigator.bluetooth || typeof navigator.bluetooth.requestDevice !== "function") {
      showNotification("Web Bluetooth is not available here. Use Chrome or Edge.", "warning");
      throw new Error("Web Bluetooth is not available in this browser. Use Chrome or Edge.");
    }

    // 1. Tell Chrome/Edge to pop up the Bluetooth pairing menu
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [ESP32_SERVICE_UUID]
    });

    if (!device) {
      throw new Error("No Bluetooth device was selected.");
    }

    // 2. Connect to the robot
    if (!device.gatt) {
      throw new Error("Selected device does not support GATT.");
    }

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(ESP32_SERVICE_UUID);
    const characteristic = await service.getCharacteristic(ESP32_IP_CHARACTERISTIC_UUID);
    
    // 3. Read the IP Address!
    const value = await characteristic.readValue();
    const decoder = new TextDecoder('utf-8');
    const ipAddress = decoder.decode(value).trim();

    if (!ipAddress) {
      throw new Error("The ESP32 returned an empty WiFi IP address.");
    }

    // 4. Save the IP for the Play button to use
    ESP32_IP = "http://" + ipAddress;
    
    setConnectionStatus(`Connected! (${ipAddress})`, "green");
    showNotification(`Robot paired successfully: ${ipAddress}`, "success");
    
    // Disconnect Bluetooth (we only needed it to get the IP, we will use WiFi for the code)
    device.gatt.disconnect();

  } catch (error) {
    console.error("Bluetooth Error:", error);
    if (error && error.message) {
      showNotification(error.message, "error");
    }
    setConnectionStatus(error && error.message ? error.message : "Pairing Failed", "red");
  }
});

// ── Play button logic (Send to ESP32 over WiFi) ────────────
const btnPlay = document.getElementById("btn-play");

btnPlay.addEventListener("click", async function () {
  const commands = getProgramCommands();

  if (commands.length === 0) {
    showNotification("Drag some blocks into the workspace first.", "warning");
    return;
  }
  
  if (!ESP32_IP) {
    showNotification("Pair your robot via Bluetooth first.", "warning");
    return;
  }

  // Update UI to show it's uploading
  btnPlay.innerHTML = "<span>⏳</span> Uploading...";
  btnPlay.disabled = true;

  try {
    console.log("Sending program to ESP32:", commands);
    
    // Send the JSON to the ESP32 using the IP we got from Bluetooth
    const response = await fetch(`${ESP32_IP}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain", 
      },
      body: JSON.stringify(commands),
    });

    if (response.ok) {
      console.log("Upload successful!");
      showNotification("Program uploaded successfully.", "success");
      programFinished(); // Show success overlay
    } else {
      showNotification("The robot returned an error while receiving the program.", "error");
    }
  } catch (error) {
    console.error("Network Error:", error);
    showNotification("Could not connect over WiFi. Make sure the robot is on the same network.", "error");
  } finally {
    // Reset Play Button
    btnPlay.innerHTML = '<span>▶</span> Play!';
    btnPlay.disabled = false;
  }
});

function programFinished() {
  document.getElementById("overlay").style.display = "flex";
}

// ── Close overlay ─────────────────────────────────────────
function closeOverlay() {
  document.getElementById("overlay").style.display = "none";
}