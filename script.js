// ── Global Variables ──────────────────────────────────────
let ESP32_IP = ""; // Holds the IP address from Bluetooth pairing
let connectedGattServer = null;

const WIFI_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const WIFI_WRITE_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const WIFI_IP_CHARACTERISTIC_UUID = "e3238001-c534-4bc1-ad09-eb44dfedbcdd";
const WIFI_BOARD_CHARACTERISTIC_UUID = "6f8f57f3-5f0f-4fa3-b91d-2c4df1b6f9c1";

const notificationEl = document.getElementById("notification");
const wifiModal = document.getElementById("wifi-modal");
const boardNameLabel = document.getElementById("board-name");
const wifiSsidInput = document.getElementById("wifi-ssid");
const wifiPassInput = document.getElementById("wifi-pass");
const btnCancelWifi = document.getElementById("btn-cancel-wifi");
const btnSubmitWifi = document.getElementById("btn-submit-wifi");

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

function setConnectionStatus(message, color) {
  if (headerStatusText) headerStatusText.innerText = message;
  if (headerStatusText) headerStatusText.style.color = color;
  if (statusDot) {
    statusDot.style.background = color;
    statusDot.classList.toggle("connected", color === "green");
  }
}

function openWifiModal() {
  if (!wifiModal) return;
  wifiModal.style.display = "flex";
  if (wifiSsidInput) wifiSsidInput.focus();
}

function closeWifiModal() {
  if (!wifiModal) return;
  wifiModal.style.display = "none";
}

function setBoardName(boardName) {
  if (!boardNameLabel) return;

  const resolvedName = boardName && boardName.trim() ? boardName.trim() : "";
  boardNameLabel.textContent = resolvedName;
  boardNameLabel.style.display = resolvedName ? "inline-flex" : "none";
}

function resetBluetoothSession(options = {}) {
  const { keepBoardName = false } = options;

  if (connectedGattServer && connectedGattServer.connected) {
    connectedGattServer.disconnect();
  }
  connectedGattServer = null;

  if (!keepBoardName) {
    setBoardName("");
  }
}

btnPair.addEventListener("click", async () => {
  try {
    setConnectionStatus("Pairing via Bluetooth...", "orange");

    if (!window.isSecureContext) {
      showNotification("Bluetooth needs a secure connection. Open this app over https:// or localhost.", "warning");
      throw new Error("Bluetooth requires a secure origin. Open this app from https:// or localhost.");
    }

    if (!navigator.bluetooth || typeof navigator.bluetooth.requestDevice !== "function") {
      showNotification("Web Bluetooth is not available here. Use Chrome or Edge.", "warning");
      throw new Error("Web Bluetooth is not available in this browser. Use Chrome or Edge.");
    }

    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "PrimeBot" }],
      optionalServices: [WIFI_SERVICE_UUID]
    });

    if (!device) {
      throw new Error("No Bluetooth device was selected.");
    }

    if (!device.gatt) {
      throw new Error("Selected device does not support GATT.");
    }

    setConnectionStatus("Connecting Bluetooth link...", "orange");
    connectedGattServer = await device.gatt.connect();
    const service = await connectedGattServer.getPrimaryService(WIFI_SERVICE_UUID);

    let resolvedBoardName = device.name ? device.name.trim() : "";
    try {
      const boardChar = await service.getCharacteristic(WIFI_BOARD_CHARACTERISTIC_UUID);
      const boardValue = await boardChar.readValue();
      const boardDecoder = new TextDecoder("utf-8");
      const boardNameFromBle = boardDecoder.decode(boardValue).trim();

      if (boardNameFromBle) {
        resolvedBoardName = boardNameFromBle;
      }
    } catch (boardError) {
      console.warn("Could not read board type characteristic, using fallback label.", boardError);
    }

    setBoardName(resolvedBoardName);

    setConnectionStatus("Awaiting credentials...", "orange");
    showNotification("Bluetooth connected. Enter the classroom Wi-Fi details.", "success");
    openWifiModal();

  } catch (error) {
    console.error("Bluetooth Error:", error);
    if (error && error.message) {
      showNotification(error.message, "error");
    }
    setConnectionStatus(error && error.message ? error.message : "Pairing Failed", "red");
  }
});

if (btnCancelWifi) {
  btnCancelWifi.addEventListener("click", () => {
    closeWifiModal();
    ESP32_IP = "";
    setConnectionStatus("Not connected", "red");
    resetBluetoothSession();
  });
}

if (btnSubmitWifi) {
  btnSubmitWifi.addEventListener("click", async () => {
    const ssid = wifiSsidInput ? wifiSsidInput.value.trim() : "";
    const pass = wifiPassInput ? wifiPassInput.value.trim() : "";

    if (!ssid) {
      alert("Please enter a Wi-Fi Name (SSID)!");
      return;
    }

    // hide modal and update small status
    if (wifiModal) wifiModal.style.display = "none";
    if (headerStatusText) headerStatusText.innerText = "Sending credentials over BLE...";

    try {
      const service = await connectedGattServer.getPrimaryService(WIFI_SERVICE_UUID);
      const writeChar = await service.getCharacteristic(WIFI_WRITE_CHARACTERISTIC_UUID);
      const encoder = new TextEncoder();
      const payload = `${ssid}||${pass}`;
      await writeChar.writeValue(encoder.encode(payload));

      if (headerStatusText) headerStatusText.innerText = "Robot connecting to Wi-Fi network...";

      const readChar = await service.getCharacteristic(WIFI_IP_CHARACTERISTIC_UUID);

      let attempts = 0;
      let rawPayload = "0.0.0.0||Unknown Board";

      const checkInterval = setInterval(async () => {
        attempts++;
        try {
          const valBuffer = await readChar.readValue();
          const decoder = new TextDecoder('utf-8');
          rawPayload = decoder.decode(valBuffer);

          // Split the data back apart at the "||" line
          const parts = rawPayload.split("||");
          const resolvedIP = parts[0] ? parts[0].trim() : "0.0.0.0";
          const detectedBoard = parts[1] ? parts[1].trim() : "ESP32 Robot Kit";

          if (resolvedIP !== "0.0.0.0" && resolvedIP !== "ERROR") {
            clearInterval(checkInterval);

            // 1. Save the pure network IP address for transmissions
            ESP32_IP = "http://" + resolvedIP;

            // 2. Dynamically swap the choice indicator in your index.html select dropdown header!
            const boardSelect = document.getElementById("board-select");
            if (boardSelect) {
              boardSelect.innerHTML = `<option>${detectedBoard}</option>`;
            } else {
              // fallback to the header span
              setBoardName(detectedBoard);
            }

            // 3. Update Status labels
            if (headerStatusText) headerStatusText.innerText = `Connected! (${resolvedIP})`;
            if (headerStatusText) headerStatusText.style.color = "green";

            if (statusDot) statusDot.style.backgroundColor = "#42BC49"; // Green dot

            if (headerStatusText) headerStatusText.innerText = `Connected to ${detectedBoard}`;

            try { connectedGattServer.disconnect(); } catch (e) { /* ignore */ }
          } else if (resolvedIP === "ERROR" || attempts > 20) {
            clearInterval(checkInterval);
            if (headerStatusText) headerStatusText.innerText = "Wi-Fi link failed.";
            if (headerStatusText) headerStatusText.style.color = "red";
            try { connectedGattServer.disconnect(); } catch (e) { /* ignore */ }
          }
        } catch (err) {
          console.error("Polling error: ", err);
        }
      }, 1500);

    } catch (error) {
      console.error("Provisioning error:", error);
      if (headerStatusText) headerStatusText.innerText = "Setup configuration failed.";
      if (headerStatusText) headerStatusText.style.color = "red";
    }
  });
}

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