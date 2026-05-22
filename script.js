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
const usbCalibrationLog = document.getElementById("usb-calibration-log");
const usbStatusDot = document.getElementById("usb-status-dot");
const usbStatusText = document.getElementById("usb-status-text");
const btnUsbConnect = document.getElementById("btn-usb-connect");
const btnUsbDisconnect = document.getElementById("btn-usb-disconnect");
const btnUsbHome = document.getElementById("btn-usb-home");
const btnUsbWalk = document.getElementById("btn-usb-walk");
const btnUsbReset = document.getElementById("btn-usb-reset");
const btnUsbSave = document.getElementById("btn-usb-save");
const btnCalibrationPlay = document.getElementById("btn-calibration-play");
const btnNextBlockly = document.getElementById("btn-next-blockly");
const calibrationSaveState = document.getElementById("calibration-save-state");
const playPanel = document.getElementById("play-panel");
const btnPlayLauncher = document.getElementById("btn-play");
const btnPlayBack = document.getElementById("btn-play-back");
const btnRunBlockly = document.getElementById("btn-run-blockly");
const joystickPad = document.getElementById("joystick-pad");
const joystickKnob = document.getElementById("joystick-knob");
const joystickReadout = document.getElementById("joystick-readout");
const playLog = document.getElementById("play-log");
const playActionButtons = document.querySelectorAll("[data-play-action]");
const blocklyToolbar = document.getElementById("blockly-toolbar");
const blocklyMain = document.getElementById("blockly-main");
const blocklySerial = document.getElementById("blockly-serial");
const blocklyFooter = document.getElementById("blockly-footer");
const trimValueEls = {
  YL: document.getElementById("trim-input-YL"),
  RL: document.getElementById("trim-input-RL"),
  YR: document.getElementById("trim-input-YR"),
  RR: document.getElementById("trim-input-RR")
};
const usbTrimButtons = document.querySelectorAll("[data-trim-axis]");

const TRIM_COMMANDS = {
  a: { axis: "YL", delta: 1 },
  z: { axis: "YL", delta: -1 },
  s: { axis: "RL", delta: 1 },
  x: { axis: "RL", delta: -1 },
  k: { axis: "YR", delta: 1 },
  m: { axis: "YR", delta: -1 },
  j: { axis: "RR", delta: 1 },
  n: { axis: "RR", delta: -1 }
};

const trimState = {
  YL: null,
  RL: null,
  YR: null,
  RR: null
};

let usbCalibrationPort = null;
let usbCalibrationReader = null;
let usbCalibrationWriter = null;
let usbCalibrationConnected = false;
let usbCalibrationReadActive = false;
let usbCalibrationBuffer = "";
let usbCalibrationSessionReady = false;
let usbCalibrationConnecting = false;
let usbCalibrationDisconnecting = false;
let usbCalibrationGarbledWarned = false;
let usbCalibrationReadFailures = 0;
let currentAppView = "calibration";
let previousAppView = "calibration";
let joystickPointerActive = false;
let joystickLastSendAt = 0;

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
  if (!btnRunBlockly) return;

  if (state === "running") {
    btnRunBlockly.innerHTML = "<span>▶</span> Running...";
    btnRunBlockly.disabled = true;
    return;
  }

  btnRunBlockly.innerHTML = '<span>▶</span> Run Blockly Program';
  btnRunBlockly.disabled = false;
}

function setPlayLauncherState() {
  if (!btnPlayLauncher) return;
  btnPlayLauncher.disabled = !ESP32_IP || usbCalibrationConnecting || usbCalibrationDisconnecting;
}

function setPlayControlsEnabled(isEnabled) {
  if (btnRunBlockly) btnRunBlockly.disabled = !isEnabled;
  if (btnPlayBack) btnPlayBack.disabled = false;

  playActionButtons.forEach((button) => {
    button.disabled = !isEnabled;
  });

  if (joystickPad) {
    joystickPad.classList.toggle("is-disabled", !isEnabled);
  }

  if (joystickKnob && !isEnabled) {
    joystickKnob.style.transform = "translate3d(0, 0, 0)";
  }

  if (!isEnabled && joystickReadout) {
    joystickReadout.textContent = "X 0 | Y 0";
  }
}

function appendPlayLog(message, color) {
  if (!playLog) return;

  const row = document.createElement("div");
  row.textContent = message;
  if (color) {
    row.style.color = color;
  }
  playLog.appendChild(row);
  playLog.scrollTop = playLog.scrollHeight;
}

function hideWorkspaceViews() {
  if (document.getElementById("calibration-panel")) {
    document.getElementById("calibration-panel").style.display = "none";
  }

  if (playPanel) playPanel.style.display = "none";
  if (blocklyToolbar) blocklyToolbar.style.display = "none";
  if (blocklyMain) blocklyMain.style.display = "none";
  if (blocklySerial) blocklySerial.style.display = "none";
  if (blocklyFooter) blocklyFooter.style.display = "none";
}

function showCalibrationPage() {
  hideWorkspaceViews();
  const calibrationPanel = document.getElementById("calibration-panel");
  if (calibrationPanel) calibrationPanel.style.display = "block";
  currentAppView = "calibration";
}

function showBlocklyProgrammingPage() {
  hideWorkspaceViews();

  if (blocklyToolbar) blocklyToolbar.style.display = "flex";
  if (blocklyMain) blocklyMain.style.display = "flex";
  if (blocklySerial) blocklySerial.style.display = "block";
  if (blocklyFooter) blocklyFooter.style.display = "flex";

  currentAppView = "blockly";

  setTimeout(() => {
    if (typeof workspace !== "undefined") {
      Blockly.svgResize(workspace);
    }
  }, 50);
}

function showPlayPanel() {
  previousAppView = currentAppView === "play" ? previousAppView : currentAppView;
  hideWorkspaceViews();
  if (playPanel) playPanel.style.display = "block";
  currentAppView = "play";
  setPlayControlsEnabled(!!ESP32_IP);
}

function returnFromPlayPanel() {
  if (previousAppView === "blockly") {
    showBlocklyProgrammingPage();
  } else {
    showCalibrationPage();
  }
}

async function sendRobotControlCommand(payload) {
  if (!ESP32_IP) {
    showNotification("Pair your robot via Bluetooth first.", "warning");
    return null;
  }

  const response = await fetch(`${ESP32_IP}/control`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json().catch(() => ({}));
}

function updateJoystickReadout(x, y) {
  if (joystickReadout) {
    joystickReadout.textContent = `X ${x} | Y ${y}`;
  }
}

function setJoystickKnobPosition(x, y) {
  if (!joystickKnob) return;
  joystickKnob.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function sendJoystickControl(x, y) {
  const now = Date.now();
  if (now - joystickLastSendAt < 120) {
    return;
  }

  joystickLastSendAt = now;
  sendRobotControlCommand({ action: "joy", x, y })
    .then(() => {
      appendPlayLog(`Joystick x:${x} y:${y}`);
    })
    .catch((error) => {
      console.error("Joystick control error:", error);
      showNotification("Could not send joystick command.", "error");
    });
}

function resetJoystick() {
  setJoystickKnobPosition(0, 0);
  updateJoystickReadout(0, 0);
  if (ESP32_IP) {
    sendRobotControlCommand({ action: "joy", x: 0, y: 0 })
      .catch((error) => console.error("Joystick reset error:", error));
  }
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

function setUsbCalibrationStatus(message, color) {
  if (usbStatusText) {
    usbStatusText.textContent = message;
    usbStatusText.style.color = color;
  }

  if (usbStatusDot) {
    usbStatusDot.style.background = color;
    usbStatusDot.classList.toggle("connected", color === "green");
  }
}

function appendUsbCalibrationLog(message, color) {
  if (!usbCalibrationLog) return;

  const row = document.createElement("div");
  row.textContent = message;
  if (color) {
    row.style.color = color;
  }
  usbCalibrationLog.appendChild(row);
  usbCalibrationLog.scrollTop = usbCalibrationLog.scrollHeight;
}

function setCalibrationSaveState(message, stateClass) {
  if (!calibrationSaveState) return;

  calibrationSaveState.textContent = message;
  calibrationSaveState.className = `calibration-save-state ${stateClass || ""}`.trim();
}

function setTrimDisplay(axis, value) {
  if (!trimValueEls[axis]) return;
  trimValueEls[axis].value = typeof value === "number" ? String(value) : "";
}

function renderTrimState() {
  for (const axis of Object.keys(trimValueEls)) {
    setTrimDisplay(axis, trimState[axis]);
  }
}

function applyTrimSnapshot(snapshot) {
  trimState.YL = snapshot.YL;
  trimState.YR = snapshot.YR;
  trimState.RL = snapshot.RL;
  trimState.RR = snapshot.RR;
  renderTrimState();
}

function updateTrimStateForCommand(command) {
  const commandInfo = TRIM_COMMANDS[command];
  if (!commandInfo) return;

  const currentValue = trimState[commandInfo.axis];
  if (typeof currentValue === "number") {
    trimState[commandInfo.axis] = currentValue + commandInfo.delta;
    setTrimDisplay(commandInfo.axis, trimState[commandInfo.axis]);
  }
}

function clampTrimValue(value) {
  if (!Number.isFinite(value)) return null;
  return Math.max(-90, Math.min(90, Math.trunc(value)));
}

function buildAbsoluteTrimCommand(axis, value) {
  return `SET ${axis} ${value}`;
}

async function sendAbsoluteTrimValue(axis, value) {
  const clamped = clampTrimValue(value);
  if (clamped === null) {
    showNotification("Enter a valid trim number.", "warning");
    return;
  }

  try {
    await writeUsbCalibrationCommand(buildAbsoluteTrimCommand(axis, clamped));
    trimState[axis] = clamped;
    setTrimDisplay(axis, clamped);
    setCalibrationSaveState("Unsaved changes. Click Save when finished.", "unsaved");
    appendUsbCalibrationLog(`Updated ${axis} trim to ${clamped}.`);
  } catch (error) {
    console.error("Wireless trim write failed:", error);
    showNotification("Could not send trim value over Wi-Fi.", "error");
    setCalibrationSaveState("Save failed. Check the Wi-Fi connection.", "unsaved");
  }
}

function parseTrimLine(line) {
  if (/EEPROM SAVED/i.test(line)) {
    setCalibrationSaveState("EEPROM saved successfully.", "saved");
    return true;
  }

  const match = line.match(/(?:CURRENT_TRIMS|Trims updated ->|Loaded Trims from EEPROM ->)\s*YL:\s*(-?\d+)[,\s]+YR:\s*(-?\d+)[,\s]+RL:\s*(-?\d+)[,\s]+RR:\s*(-?\d+)/i);
  if (!match) return false;

  applyTrimSnapshot({
    YL: Number(match[1]),
    YR: Number(match[2]),
    RL: Number(match[3]),
    RR: Number(match[4])
  });

  return true;
}

function processUsbCalibrationLine(line) {
  const trimmedLine = line.trim();
  if (!trimmedLine) return;

  const replacementCount = (trimmedLine.match(/\uFFFD/g) || []).length;
  if (replacementCount >= 3) {
    if (!usbCalibrationGarbledWarned) {
      usbCalibrationGarbledWarned = true;
      appendUsbCalibrationLog("Unreadable wireless data received. Check firmware baud rate, then reconnect.", "#f97316");
    }
    return;
  }

  appendUsbCalibrationLog(trimmedLine);
  parseTrimLine(trimmedLine);
}

async function writeUsbCalibrationCommand(command) {
  if (!ESP32_IP) {
    throw new Error("Robot is not connected over Wi-Fi.");
  }

  const response = await fetch(`${ESP32_IP}/calibration`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: `${command}`
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload && payload.trims) {
    applyTrimSnapshot(payload.trims);
  }

  return payload;
}

function waitMs(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function readUsbCalibrationStream() {
  if (!usbCalibrationReader || usbCalibrationReadActive) return;

  usbCalibrationReadActive = true;
  const decoder = new TextDecoder();
  let shouldDisconnect = false;
  let disconnectReason = "USB stream stopped unexpectedly.";

  try {
    while (usbCalibrationConnected) {
      if (!usbCalibrationReader) {
        if (!usbCalibrationPort || !usbCalibrationPort.readable) {
          usbCalibrationReadFailures += 1;
          if (usbCalibrationReadFailures >= 4) {
            shouldDisconnect = true;
            disconnectReason = "USB stream stopped unexpectedly.";
            break;
          }

          await waitMs(250);
          continue;
        }

        usbCalibrationReader = usbCalibrationPort.readable.getReader();
      }

      const { value, done } = await usbCalibrationReader.read();

      if (done) {
        try {
          usbCalibrationReader.releaseLock();
        } catch (releaseError) {
          console.warn("USB reader release after done failed:", releaseError);
        }

        usbCalibrationReader = null;
        usbCalibrationReadFailures += 1;

        if (usbCalibrationReadFailures >= 4) {
          shouldDisconnect = true;
          disconnectReason = "USB stream stopped unexpectedly.";
          break;
        }

        await waitMs(250);
        continue;
      }

      if (!value) {
        continue;
      }

      usbCalibrationReadFailures = 0;

      usbCalibrationBuffer += decoder.decode(value, { stream: true });

      let newlineIndex = usbCalibrationBuffer.indexOf("\n");
      while (newlineIndex !== -1) {
        const line = usbCalibrationBuffer.slice(0, newlineIndex).replace(/\r$/, "");
        usbCalibrationBuffer = usbCalibrationBuffer.slice(newlineIndex + 1);
        processUsbCalibrationLine(line);
        newlineIndex = usbCalibrationBuffer.indexOf("\n");
      }
    }
  } catch (error) {
    if (error && error.name === "AbortError" && !usbCalibrationConnected) {
      // Expected during manual disconnect.
    } else if (usbCalibrationConnected) {
      console.error("USB calibration stream error:", error);
      shouldDisconnect = true;
      disconnectReason = "USB stream stopped unexpectedly.";
    }
  } finally {
    if (usbCalibrationBuffer.trim()) {
      processUsbCalibrationLine(usbCalibrationBuffer);
      usbCalibrationBuffer = "";
    }

    usbCalibrationReadActive = false;

    if (shouldDisconnect && usbCalibrationConnected && !usbCalibrationDisconnecting) {
      await disconnectUsbCalibration({
        reasonMessage: disconnectReason,
        logClosed: false
      });
    }
  }
}

function setUsbCalibrationControlsEnabled(isEnabled) {
  if (btnUsbConnect) {
    btnUsbConnect.textContent = usbCalibrationConnected ? "Bluetooth Connected" : "Connect Bluetooth";
    btnUsbConnect.disabled = usbCalibrationConnected || usbCalibrationConnecting || usbCalibrationDisconnecting;
  }

  if (btnUsbDisconnect) btnUsbDisconnect.disabled = !isEnabled;
  if (btnUsbHome) btnUsbHome.disabled = !isEnabled;
  if (btnUsbWalk) btnUsbWalk.disabled = !isEnabled;
  if (btnUsbReset) btnUsbReset.disabled = !isEnabled;
  if (btnUsbSave) btnUsbSave.disabled = !isEnabled;
  if (btnCalibrationPlay) btnCalibrationPlay.disabled = !isEnabled;
  if (btnNextBlockly) btnNextBlockly.disabled = !usbCalibrationSessionReady;

  usbTrimButtons.forEach((button) => {
    button.disabled = !isEnabled;
  });

  Object.values(trimValueEls).forEach((input) => {
    if (input) {
      input.disabled = !isEnabled;
    }
  });

  setPlayLauncherState();
  setPlayControlsEnabled(isEnabled);
}

async function releaseUsbCalibrationHandles({ closePort = true } = {}) {
  usbCalibrationReader = null;
  usbCalibrationWriter = null;
  usbCalibrationPort = null;
}

async function connectUsbCalibration() {
  if (usbCalibrationConnecting || usbCalibrationDisconnecting) {
    return;
  }

  if (usbCalibrationConnected || usbCalibrationPort) {
    await disconnectUsbCalibration({ logClosed: false });
  }

  if (!ESP32_IP) {
    showNotification("Pair your robot via Bluetooth first.", "warning");
    return;
  }

  usbCalibrationConnecting = true;
  setUsbCalibrationControlsEnabled(false);

  try {
    usbCalibrationConnected = true;
    usbCalibrationBuffer = "";
    usbCalibrationSessionReady = true;
    usbCalibrationGarbledWarned = false;
    usbCalibrationReadFailures = 0;

    setUsbCalibrationStatus("Wireless connected", "green");
    setUsbCalibrationControlsEnabled(true);
    setPlayLauncherState();
    appendUsbCalibrationLog("Wireless calibration link opened.");
    setCalibrationSaveState("Connected. Make changes, then click Save.", "unsaved");
    const initialState = await fetch(`${ESP32_IP}/calibration`, {
      method: "GET",
      cache: "no-store"
    });

    if (!initialState.ok) {
      throw new Error(`HTTP ${initialState.status}`);
    }

    const calibrationState = await initialState.json();
    if (calibrationState && calibrationState.trims) {
      applyTrimSnapshot(calibrationState.trims);
    }

    appendUsbCalibrationLog("Current trims loaded from the board.");

    await writeUsbCalibrationCommand("P");
  } catch (error) {
    console.error("Wireless calibration connection error:", error);
    setUsbCalibrationStatus("Wireless disconnected", "#b91c1c");
    usbCalibrationConnected = false;
    usbCalibrationSessionReady = false;
    await releaseUsbCalibrationHandles({ closePort: true });
    if (btnUsbConnect) {
      btnUsbConnect.textContent = "Connect Bluetooth";
    }
    setUsbCalibrationControlsEnabled(false);
    setPlayLauncherState();
    setPlayControlsEnabled(false);
    appendUsbCalibrationLog(error && error.message ? error.message : "Wireless connection failed.", "#f87171");
  } finally {
    usbCalibrationConnecting = false;
    setUsbCalibrationControlsEnabled(usbCalibrationConnected);
    setPlayLauncherState();
  }
}

async function disconnectUsbCalibration(options = {}) {
  const { reasonMessage = "", logClosed = true } = options;

  if (usbCalibrationDisconnecting) return;

  usbCalibrationDisconnecting = true;
  usbCalibrationConnected = false;
  usbCalibrationSessionReady = false;
  if (btnUsbConnect) {
    btnUsbConnect.textContent = "Connect Bluetooth";
  }
  setUsbCalibrationControlsEnabled(false);
  setPlayLauncherState();
  setPlayControlsEnabled(false);
  setUsbCalibrationStatus("Wireless disconnected", "#b91c1c");
  usbCalibrationBuffer = "";

  try {
    await releaseUsbCalibrationHandles({ closePort: true });
  } finally {
    usbCalibrationDisconnecting = false;
    setUsbCalibrationControlsEnabled(false);
    setPlayLauncherState();
  }

  if (reasonMessage) {
    appendUsbCalibrationLog(reasonMessage, "#f97316");
  }

  if (logClosed) {
    appendUsbCalibrationLog("Wireless calibration link closed.");
  }
}

async function sendUsbCalibrationCommand(command) {
  if (!usbCalibrationConnected) {
    showNotification("Connect the robot wirelessly first.", "warning");
    return;
  }

  try {
    await writeUsbCalibrationCommand(command);
    if (command.toUpperCase() === "H") {
      appendUsbCalibrationLog("Home position command sent.");
    } else if (command.toUpperCase() === "F") {
      appendUsbCalibrationLog("Walk test command sent.");
    } else {
      appendUsbCalibrationLog(`Sent calibration command: ${command.toUpperCase()}`);
    }
    updateTrimStateForCommand(command);
  } catch (error) {
    console.error("Wireless command write failed:", error);
    showNotification("Could not send command over Wi-Fi.", "error");
  }
}

async function resetUsbCalibrationPresets() {
  if (!usbCalibrationConnected) {
    showNotification("Connect the robot wirelessly first.", "warning");
    return;
  }

  try {
    await writeUsbCalibrationCommand("RESET");
    trimState.YL = 0;
    trimState.YR = 0;
    trimState.RL = 0;
    trimState.RR = 0;
    renderTrimState();
    setCalibrationSaveState("All trims reset to 0. Click Save to store changes.", "unsaved");
    appendUsbCalibrationLog("Reset command sent to the robot.");
  } catch (error) {
    console.error("Wireless reset write failed:", error);
    showNotification("Could not reset trims over Wi-Fi.", "error");
    setCalibrationSaveState("Reset failed. Check the Wi-Fi connection.", "unsaved");
  }
}

async function saveUsbCalibrationConfig() {
  if (!usbCalibrationConnected) {
    showNotification("Connect the robot wirelessly first.", "warning");
    return;
  }

  try {
    await writeUsbCalibrationCommand("SAVE");
    setCalibrationSaveState("EEPROM saved successfully.", "saved");
    appendUsbCalibrationLog("EEPROM save requested.");
  } catch (error) {
    console.error("Wireless save write failed:", error);
    showNotification("Could not save EEPROM over Wi-Fi.", "error");
    setCalibrationSaveState("Save failed. Check the Wi-Fi connection.", "unsaved");
  }
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
    if (confirm("Clear all blocks? This cannot be undone.")) {
      workspace.clear();
      localStorage.removeItem("primevu_saved_workspace");
    }
  });
}

// ── Bluetooth Pairing Logic ────────────────────────────────
const btnPair = document.getElementById("btn-pair") || btnUsbConnect;
const headerStatusText = usbStatusText;
const statusDot = usbStatusDot;

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

if (btnUsbDisconnect) {
  btnUsbDisconnect.addEventListener("click", disconnectUsbCalibration);
}

if (btnUsbHome) {
  btnUsbHome.addEventListener("click", () => sendUsbCalibrationCommand("h"));
}

if (btnUsbWalk) {
  btnUsbWalk.addEventListener("click", () => sendUsbCalibrationCommand("f"));
}

if (btnUsbReset) {
  btnUsbReset.addEventListener("click", resetUsbCalibrationPresets);
}

if (btnUsbSave) {
  btnUsbSave.addEventListener("click", saveUsbCalibrationConfig);
}

if (btnCalibrationPlay) {
  btnCalibrationPlay.addEventListener("click", () => {
    if (!ESP32_IP) {
      showNotification("Pair your robot via Bluetooth first.", "warning");
      return;
    }

    showPlayPanel();
  });
}

if (btnNextBlockly) {
  btnNextBlockly.addEventListener("click", showBlocklyProgrammingPage);
}

usbTrimButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const axis = button.getAttribute("data-trim-axis");
    const step = Number(button.getAttribute("data-trim-step") || 0);
    if (axis && Number.isFinite(step)) {
      const currentValue = trimState[axis];
      const nextValue = typeof currentValue === "number" ? currentValue + step : step;
      sendAbsoluteTrimValue(axis, nextValue);
    }
  });
});

Object.entries(trimValueEls).forEach(([axis, input]) => {
  if (!input) return;

  input.addEventListener("change", () => {
    if (!usbCalibrationConnected) return;
    sendAbsoluteTrimValue(axis, Number(input.value));
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      input.blur();
    }
  });
});

renderTrimState();
setUsbCalibrationControlsEnabled(false);
setUsbCalibrationStatus("Wireless disconnected", "#b91c1c");
setCalibrationSaveState("No changes saved yet.");

// ═══════════════════════════════════════════════
// 7. WORKSPACE AUTO-SAVE & RESTORE
// ═══════════════════════════════════════════════

const AUTOSAVE_KEY = "primevu_saved_workspace";

function restoreWorkspace() {
  const savedData = localStorage.getItem(AUTOSAVE_KEY);
  if (savedData) {
    try {
      Blockly.serialization.workspaces.load(JSON.parse(savedData), workspace);
      console.log("Previous workspace restored from localStorage.");
    } catch (error) {
      console.error("Error restoring workspace:", error);
    }
  }
}

function saveWorkspace() {
  try {
    const state = Blockly.serialization.workspaces.save(workspace);
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving workspace:", error);
  }
}

setTimeout(restoreWorkspace, 300);
setInterval(saveWorkspace, 5000);

if (btnPair) btnPair.addEventListener("click", async () => {
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
    setUsbCalibrationControlsEnabled(false);
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
            usbCalibrationConnected = true;
            usbCalibrationSessionReady = true;

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

            setUsbCalibrationControlsEnabled(true);
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

// ── Play button logic (Play Zone + Blockly upload) ─────────
async function uploadCurrentBlocklyProgram() {
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
  setPlayButtonState("running");
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
    setPlayButtonState("idle");
  }
}

if (btnPlayLauncher) {
  btnPlayLauncher.addEventListener("click", () => {
    if (!ESP32_IP) {
      showNotification("Pair your robot via Bluetooth first.", "warning");
      return;
    }

    showPlayPanel();
  });
}

if (btnPlayBack) {
  btnPlayBack.addEventListener("click", returnFromPlayPanel);
}

if (btnRunBlockly) {
  btnRunBlockly.addEventListener("click", uploadCurrentBlocklyProgram);
}

playActionButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const action = button.getAttribute("data-play-action");
    if (!action) return;

    button.disabled = true;
    try {
      await sendRobotControlCommand({ action });
      appendPlayLog(`${action.charAt(0).toUpperCase() + action.slice(1)} requested.`);
    } catch (error) {
      console.error("Play action error:", error);
      showNotification("Could not send the play action.", "error");
    } finally {
      setPlayControlsEnabled(!!ESP32_IP);
    }
  });
});

if (joystickPad) {
  const moveJoystick = (event) => {
    if (!joystickPointerActive) return;

    const rect = joystickPad.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawDx = event.clientX - centerX;
    const rawDy = event.clientY - centerY;
    const radius = Math.max(1, rect.width / 2 - 44);
    const distance = Math.min(radius, Math.hypot(rawDx, rawDy));
    const angle = Math.atan2(rawDy, rawDx);
    const offsetX = Math.round(Math.cos(angle) * distance);
    const offsetY = Math.round(Math.sin(angle) * distance);
    const normalizedX = Math.round((offsetX / radius) * 100);
    const normalizedY = Math.round((offsetY / radius) * 100);

    setJoystickKnobPosition(offsetX, offsetY);
    updateJoystickReadout(normalizedX, normalizedY);
    sendJoystickControl(normalizedX, normalizedY);
  };

  joystickPad.addEventListener("pointerdown", (event) => {
    if (!ESP32_IP) {
      showNotification("Pair your robot via Bluetooth first.", "warning");
      return;
    }

    joystickPointerActive = true;
    joystickPad.setPointerCapture(event.pointerId);
    moveJoystick(event);
  });

  joystickPad.addEventListener("pointermove", moveJoystick);

  const releaseJoystick = () => {
    if (!joystickPointerActive) return;

    joystickPointerActive = false;
    resetJoystick();
  };

  joystickPad.addEventListener("pointerup", releaseJoystick);
  joystickPad.addEventListener("pointercancel", releaseJoystick);
  joystickPad.addEventListener("lostpointercapture", releaseJoystick);
}

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
