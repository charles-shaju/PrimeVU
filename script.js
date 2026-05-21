// ── Register Offline Service Worker ────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, (err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// ── Global Variables ──────────────────────────────────────
let ESP32_IP = ""; // Holds the IP address from Bluetooth pairing
let connectedGattServer = null;
let serialPollTimer = null;
let serialPollActive = false;
let serialLastLogId = 0;
let serialDisconnectedShown = false;
let serialDisconnectGraceUntil = 0;

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
const serialLogWindow = document.getElementById("serial-log");
const btnClearSerial = document.getElementById("btn-clear-serial");
const codeViewElement = document.getElementById("code-view");

// ── Make the Tab Key Work in the Code Editor ────────────────
const codeEditor = document.getElementById("code-view");

if (codeEditor) {
  codeEditor.addEventListener("keydown", function(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "  ");
    }
  });
}

let notificationTimer = null;
let isCodePanelFocused = false;
window.isCodePanelFocused = false;

function setPlayButtonState(state) {
  const btnPlay = document.getElementById("btn-play");
  if (!btnPlay) return;

  if (state === "running") {
    btnPlay.innerHTML = "<span>▶</span> Running...";
    btnPlay.disabled = true;
    return;
  }

  btnPlay.innerHTML = '<span>▶</span> Play!';
  btnPlay.disabled = false;
}

if (codeViewElement) {
  codeViewElement.addEventListener("focus", () => {
    isCodePanelFocused = true;
    window.isCodePanelFocused = true;
  });

  codeViewElement.addEventListener("blur", () => {
    isCodePanelFocused = false;
    window.isCodePanelFocused = false;
  });
}

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
  stopWirelessSerialMonitor();

  if (!keepBoardName) {
    setBoardName("");
  }
}

function stopWirelessSerialMonitor() {
  serialPollActive = false;

  if (serialPollTimer) {
    clearTimeout(serialPollTimer);
    serialPollTimer = null;
  }
}

function pauseSerialDisconnectWarnings(ms = 2500) {
  serialDisconnectGraceUntil = Date.now() + ms;
  serialDisconnectedShown = false;
}

async function pollWirelessSerialMonitor(ipAddress) {
  if (!serialPollActive || !serialLogWindow) return;

  try {
    const response = await fetch(`${ipAddress}/serial?since=${serialLastLogId}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const lines = Array.isArray(payload.lines) ? payload.lines : [];

    for (const entry of lines) {
      if (!entry || typeof entry.text !== "string") continue;

      const newLogLine = document.createElement("div");
      newLogLine.className = "log-line";
      newLogLine.innerText = entry.text;
      serialLogWindow.appendChild(newLogLine);
      serialLogWindow.scrollTop = serialLogWindow.scrollHeight;
    }

    if (typeof payload.next === "number") {
      serialLastLogId = payload.next;
    }

    serialDisconnectedShown = false;
  } catch (err) {
    console.error("Serial stream disconnected:", err);
    if (Date.now() < serialDisconnectGraceUntil) {
      return;
    }
    if (serialLogWindow && !serialDisconnectedShown) {
      const warning = document.createElement("div");
      warning.className = "log-line";
      warning.style.color = "#ef4444";
      warning.innerText = "Serial monitor line disconnected.";
      serialLogWindow.appendChild(warning);
      serialLogWindow.scrollTop = serialLogWindow.scrollHeight;
      serialDisconnectedShown = true;
    }
  } finally {
    if (serialPollActive) {
      serialPollTimer = window.setTimeout(() => {
        pollWirelessSerialMonitor(ipAddress);
      }, 1000);
    }
  }
}

function startWirelessSerialMonitor(ipAddress) {
  if (!serialLogWindow) return;

  serialLogWindow.innerHTML = "<div>Connecting to live serial stream...</div>";

  stopWirelessSerialMonitor();
  serialPollActive = true;
  serialLastLogId = 0;
  serialDisconnectedShown = false;

  pollWirelessSerialMonitor(ipAddress);
}

if (btnClearSerial && serialLogWindow) {
  btnClearSerial.addEventListener("click", () => {
    serialLogWindow.innerHTML = "<div>Log cleared.</div>";
  });
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
      // Read the shared IP characteristic which includes the board name after '||'
      const ipChar = await service.getCharacteristic(WIFI_IP_CHARACTERISTIC_UUID);
      const boardBuf = await ipChar.readValue();
      const boardDecoder = new TextDecoder("utf-8");
      const raw = boardDecoder.decode(boardBuf).trim(); // expected 'IP||Board'
      const parts = raw.split("||");
      const boardNameFromBle = parts[1] ? parts[1].trim() : "";
      if (boardNameFromBle) resolvedBoardName = boardNameFromBle;
    } catch (boardError) {
      console.warn("Could not read board info characteristic, using fallback label.", boardError);
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
    stopWirelessSerialMonitor();
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
            startWirelessSerialMonitor(ESP32_IP);

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
            stopWirelessSerialMonitor();
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
      stopWirelessSerialMonitor();
    }
  });
}

// ── Play button logic (Send to ESP32 over WiFi) ────────────
const btnPlay = document.getElementById("btn-play");

btnPlay.addEventListener("click", async function () {
  const programPayload = getProgramCommands();

  const totalCommands = (programPayload?.setupCmds?.length || 0) + (programPayload?.loopCmds?.length || 0);

  if (!programPayload || totalCommands === 0) {
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
  pauseSerialDisconnectWarnings(2500);

  try {
    console.log("Sending program to ESP32:", programPayload);

    // Send the JSON to the ESP32 using the IP we got from Bluetooth
    const response = await fetch(`${ESP32_IP}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(programPayload),
    });

    if (response.ok) {
      console.log("Upload successful!");
      showNotification("Program uploaded successfully.", "success");
      pauseSerialDisconnectWarnings(1500);
      setPlayButtonState("running");
    } else {
      showNotification("The robot returned an error while receiving the program.", "error");
    }
  } catch (error) {
    console.error("Network Error:", error);
    showNotification("Could not connect over WiFi. Make sure the robot is on the same network.", "error");
  } finally {
    if (btnPlay.innerText.includes("Uploading")) {
      setPlayButtonState("idle");
    }
  }
});

// ── Stop button logic (clear robot routine over Wi-Fi) ────
const btnStop = document.getElementById("btn-stop");

if (btnStop) {
  btnStop.addEventListener("click", async function () {
    if (!ESP32_IP) {
      showNotification("Pair your robot via Bluetooth first.", "warning");
      return;
    }

    btnStop.innerText = "⏳ Stopping...";
    btnStop.disabled = true;
    pauseSerialDisconnectWarnings(3500);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);

    try {
      console.log("Sending Stop Command (Blank Payload)...");

      const blankProgram = {
        setupCmds: [],
        loopCmds: []
      };

      const response = await fetch(`${ESP32_IP}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify(blankProgram),
      });

      if (response.ok) {
        console.log("Robot halted successfully!");
        showNotification("Robot stopped and program cleared.", "success");
        pauseSerialDisconnectWarnings(2000);
        setPlayButtonState("idle");

      } else {
        showNotification("The robot returned an error while attempting to stop.", "error");
      }
    } catch (error) {
      if (error && error.name === "AbortError") {
        showNotification("Stop request timed out. Try again.", "warning");
      } else {
        console.error("Network Error on Stop Command:", error);
        showNotification("Could not reach the robot over Wi-Fi to stop it.", "error");
      }
    } finally {
      window.clearTimeout(timeoutId);
      btnStop.innerText = "⏹️ Stop";
      btnStop.disabled = false;
    }
  });
}
