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
let ESP32_IP = ""; 
let connectedGattServer = null;
let serialPollTimer = null;
let serialPollActive = false;
let serialLastLogId = 0;

// 💡 NEW: Aggressive timeouts for auto-disconnecting
const SERIAL_POLL_TIMEOUT_MS = 1500; 
const SERIAL_HEARTBEAT_INTERVAL_MS = 10000;

const WIFI_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const WIFI_WRITE_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const WIFI_IP_CHARACTERISTIC_UUID = "e3238001-c534-4bc1-ad09-eb44dfedbcdd";

const notificationEl = document.getElementById("notification");
const wifiModal = document.getElementById("wifi-modal");
const boardNameLabel = document.getElementById("board-name");
const batteryStatusPanel = document.getElementById("battery-status");
const batteryPctText = document.getElementById("battery-pct");

const wifiSsidInput = document.getElementById("wifi-ssid");
const wifiPassInput = document.getElementById("wifi-pass");
const btnCancelWifi = document.getElementById("btn-cancel-wifi");
const btnSubmitWifi = document.getElementById("btn-submit-wifi");

const serialLogWindow = document.getElementById("serial-log");
const usbCalibrationLog = document.getElementById("usb-calibration-log");
const playLog = document.getElementById("play-log");

const codeViewElement = document.getElementById("code-view");
const usbStatusDot = document.getElementById("usb-status-dot");
const usbStatusText = document.getElementById("usb-status-text");
const btnUsbConnect = document.getElementById("btn-usb-connect");
const btnUsbDisconnect = document.getElementById("btn-usb-disconnect");
const btnUsbHome = document.getElementById("btn-usb-home");
const btnUsbWalk = document.getElementById("btn-usb-walk");
const btnUsbReset = document.getElementById("btn-usb-reset");
const btnUsbSave = document.getElementById("btn-usb-save");
const btnClearSerial = document.getElementById("btn-clear-serial");

// Navigation Buttons
const btnCalibrationPlay = document.getElementById("btn-calibration-play");
const btnNextBlockly = document.getElementById("btn-next-blockly");
const btnGotoCalibFromPlay = document.getElementById("btn-goto-calib-from-play");
const btnGotoBlocklyFromPlay = document.getElementById("btn-goto-blockly-from-play");
const btnGotoCalibFromBlockly = document.getElementById("btn-goto-calib-from-blockly");

const calibrationSaveState = document.getElementById("calibration-save-state");
const playPanel = document.getElementById("play-panel");
const btnPlayLauncher = document.getElementById("btn-play");
const btnRunBlocklyFooter = document.getElementById("btn-run-blockly-footer");
const joystickPad = document.getElementById("joystick-pad");
const joystickKnob = document.getElementById("joystick-knob");
const joystickReadout = document.getElementById("joystick-readout");
const playActionButtons = document.querySelectorAll("[data-play-action]");
const PLAY_ACTION_CONNECTION_GRACE_MS = 15000;

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

const trimState = { YL: null, RL: null, YR: null, RR: null };

let usbCalibrationConnected = false;
let currentAppView = "calibration";
let serialPollFailureCount = 0;
let playActionGraceUntil = 0;
let joystickPointerActive = false;
let joystickLoopTimer = null;
let currentJoyX = 0;
let currentJoyY = 0;
let isSendingJoy = false;

// ── Tab Key Fix ────────────────
if (codeViewElement) {
  codeViewElement.addEventListener("keydown", function(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "  ");
    }
  });
}

let notificationTimer = null;

function setPlayButtonState(state) {
  if (!btnRunBlocklyFooter) return;
  if (state === "running") {
    btnRunBlocklyFooter.innerHTML = "<span>🚀</span> Uploading...";
    btnRunBlocklyFooter.disabled = true;
    return;
  }
  btnRunBlocklyFooter.innerHTML = '<span>🚀</span> Upload Code';
  btnRunBlocklyFooter.disabled = false;
}

function setPlayControlsEnabled(isEnabled) {
  if (btnRunBlocklyFooter) btnRunBlocklyFooter.disabled = !isEnabled;
  playActionButtons.forEach((btn) => btn.disabled = !isEnabled);
  if (joystickPad) joystickPad.classList.toggle("is-disabled", !isEnabled);
  if (joystickKnob && !isEnabled) joystickKnob.style.transform = "translate3d(0, 0, 0)";
  if (!isEnabled && joystickReadout) joystickReadout.textContent = "X 0 | Y 0";
}

// ── Page Routing System ────────────────
function hideWorkspaceViews() {
  document.getElementById("calibration-panel").style.display = "none";
  if (playPanel) playPanel.style.display = "none";
  if (blocklyToolbar) blocklyToolbar.style.display = "none";
  if (blocklyMain) blocklyMain.style.display = "none";
  if (blocklyFooter) blocklyFooter.style.display = "none";
}

function setSerialMonitorVisible(isVisible) {
  if (blocklySerial) blocklySerial.style.display = isVisible ? "block" : "none";
}

function showCalibrationPage() {
  hideWorkspaceViews();
  document.getElementById("calibration-panel").style.display = "block";
  setSerialMonitorVisible(true);
  currentAppView = "calibration";
}

function showBlocklyProgrammingPage() {
  hideWorkspaceViews();
  if (blocklyToolbar) blocklyToolbar.style.display = "flex";
  if (blocklyMain) blocklyMain.style.display = "flex";
  setSerialMonitorVisible(true);
  if (blocklyFooter) blocklyFooter.style.display = "flex";
  currentAppView = "blockly";
  setTimeout(() => Blockly.svgResize(workspace), 50);
}

function showPlayPanel() {
  hideWorkspaceViews();
  if (playPanel) playPanel.style.display = "block";
  setSerialMonitorVisible(true);
  currentAppView = "play";
  setPlayControlsEnabled(!!ESP32_IP);
}

// Button Hooks for Pages
if (btnCalibrationPlay) btnCalibrationPlay.addEventListener("click", showPlayPanel);
if (btnNextBlockly) btnNextBlockly.addEventListener("click", showBlocklyProgrammingPage);
if (btnGotoCalibFromPlay) btnGotoCalibFromPlay.addEventListener("click", showCalibrationPage);
if (btnGotoBlocklyFromPlay) btnGotoBlocklyFromPlay.addEventListener("click", showBlocklyProgrammingPage);
if (btnGotoCalibFromBlockly) btnGotoCalibFromBlockly.addEventListener("click", showCalibrationPage);
if (btnPlayLauncher) btnPlayLauncher.addEventListener("click", showPlayPanel);

// ── Networking / HTTP ────────────────
async function sendRobotControlCommand(payload) {
  if (!ESP32_IP) return null;
  const response = await fetch(`${ESP32_IP}/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json().catch(() => ({}));
}

// ── Joystick Continuous Send Engine ────────────────
function updateJoystickReadout(x, y) {
  if (joystickReadout) joystickReadout.textContent = `X ${x} | Y ${y}`;
}

function setJoystickKnobPosition(x, y) {
  if (!joystickKnob) return;
  joystickKnob.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function resetJoystick() {
  currentJoyX = 0;
  currentJoyY = 0;
  setJoystickKnobPosition(0, 0);
  updateJoystickReadout(0, 0);
  if (ESP32_IP) sendRobotControlCommand({ action: "joy", x: 0, y: 0 }).catch(console.error);
}

if (joystickPad) {
  const moveJoystick = (event) => {
    if (!joystickPointerActive) return;
    const rect = joystickPad.getBoundingClientRect();
    const radius = Math.max(1, rect.width / 2 - 44);
    const rawDx = event.clientX - (rect.left + rect.width / 2);
    const rawDy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.min(radius, Math.hypot(rawDx, rawDy));
    const angle = Math.atan2(rawDy, rawDx);
    const offsetX = Math.round(Math.cos(angle) * distance);
    const offsetY = Math.round(Math.sin(angle) * distance);
    
    currentJoyX = Math.round((offsetX / radius) * 100);
    currentJoyY = Math.round((offsetY / radius) * 100);

    setJoystickKnobPosition(offsetX, offsetY);
    updateJoystickReadout(currentJoyX, currentJoyY);
  };

  joystickPad.addEventListener("pointerdown", (event) => {
    if (!ESP32_IP) { showNotification("Connect to Wi-Fi first.", "warning"); return; }
    joystickPointerActive = true;
    joystickPad.setPointerCapture(event.pointerId);
    moveJoystick(event);

    if (!joystickLoopTimer) {
      joystickLoopTimer = setInterval(async () => {
        if (isSendingJoy) return;
        isSendingJoy = true;
        try {
          await sendRobotControlCommand({ action: "joy", x: currentJoyX, y: currentJoyY });
        } catch(e) { } 
        isSendingJoy = false;
      }, 150);
    }
  });

  joystickPad.addEventListener("pointermove", moveJoystick);

  const releaseJoystick = () => {
    if (!joystickPointerActive) return;
    joystickPointerActive = false;
    if (joystickLoopTimer) {
      clearInterval(joystickLoopTimer);
      joystickLoopTimer = null;
    }
    resetJoystick();
  };

  joystickPad.addEventListener("pointerup", releaseJoystick);
  joystickPad.addEventListener("pointercancel", releaseJoystick);
  joystickPad.addEventListener("lostpointercapture", releaseJoystick);
}

// ── UI Updates ────────────────
function showNotification(message, type = "warning") {
  if (!notificationEl) return;
  notificationEl.textContent = message;
  notificationEl.className = `notification ${type} show`;
  if (notificationTimer) clearTimeout(notificationTimer);
  notificationTimer = setTimeout(() => {
    notificationEl.className = "notification";
    notificationEl.textContent = "";
  }, 3500);
}

function setUsbCalibrationStatus(message, color) {
  if (usbStatusText) { usbStatusText.textContent = message; usbStatusText.style.color = color; }
  if (usbStatusDot) { usbStatusDot.style.background = color; usbStatusDot.classList.toggle("connected", color === "green"); }
}

function setCalibrationSaveState(message, stateClass) {
  if (!calibrationSaveState) return;
  calibrationSaveState.textContent = message;
  calibrationSaveState.className = `calibration-save-state ${stateClass || ""}`.trim();
}

// ── Calibration Trims ────────────────
function setTrimDisplay(axis, value) {
  if (!trimValueEls[axis]) return;
  trimValueEls[axis].value = typeof value === "number" ? String(value) : "";
}

function renderTrimState() {
  for (const axis of Object.keys(trimValueEls)) setTrimDisplay(axis, trimState[axis]);
}

function applyTrimSnapshot(snapshot) {
  trimState.YL = snapshot.YL; trimState.YR = snapshot.YR;
  trimState.RL = snapshot.RL; trimState.RR = snapshot.RR;
  renderTrimState();
}

function clampTrimValue(value) {
  if (!Number.isFinite(value)) return null;
  return Math.max(-90, Math.min(90, Math.trunc(value)));
}

async function sendAbsoluteTrimValue(axis, value) {
  const clamped = clampTrimValue(value);
  if (clamped === null) return;
  try {
    await writeUsbCalibrationCommand(`SET ${axis} ${clamped}`);
    trimState[axis] = clamped;
    setTrimDisplay(axis, clamped);
    setCalibrationSaveState("Unsaved changes. Click Save when finished.", "unsaved");
  } catch (error) {
    showNotification("Could not send trim value over Wi-Fi.", "error");
  }
}

async function writeUsbCalibrationCommand(command) {
  if (!ESP32_IP) throw new Error("Not connected.");
  const response = await fetch(`${ESP32_IP}/calibration`, {
    method: "POST", headers: { "Content-Type": "text/plain" }, body: command
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  if (payload && payload.trims) applyTrimSnapshot(payload.trims);
  return payload;
}

function setUsbCalibrationControlsEnabled(isEnabled) {
  if (btnUsbConnect) {
    btnUsbConnect.textContent = usbCalibrationConnected ? "Bluetooth Connected" : "Connect Bluetooth";
    btnUsbConnect.disabled = usbCalibrationConnected;
  }
  if (btnUsbDisconnect) btnUsbDisconnect.disabled = !isEnabled;
  if (btnUsbHome) btnUsbHome.disabled = !isEnabled;
  if (btnUsbWalk) btnUsbWalk.disabled = !isEnabled;
  if (btnUsbReset) btnUsbReset.disabled = !isEnabled;
  if (btnUsbSave) btnUsbSave.disabled = !isEnabled;
  if (btnCalibrationPlay) btnCalibrationPlay.disabled = !isEnabled;
  if (btnNextBlockly) btnNextBlockly.disabled = !isEnabled;

  usbTrimButtons.forEach((b) => b.disabled = !isEnabled);
  Object.values(trimValueEls).forEach((i) => { if (i) i.disabled = !isEnabled; });
  setPlayControlsEnabled(isEnabled);
}

// ── Bluetooth Connection ────────────────
function setBoardName(boardName) {
  if (!boardNameLabel) return;
  const resolvedName = boardName && boardName.trim() ? boardName.trim() : "";
  boardNameLabel.textContent = resolvedName;
  boardNameLabel.style.display = resolvedName ? "inline-flex" : "none";
}

function resetBluetoothSession() {
  if (connectedGattServer && connectedGattServer.connected) connectedGattServer.disconnect();
  connectedGattServer = null;
  stopWirelessSerialMonitor();
  setBoardName("");
  if (batteryStatusPanel) batteryStatusPanel.style.display = "none";
}

// 💡 FIXED: Aggressively resets ALL UI elements when connection is lost
function handleWirelessDisconnect(statusMessage = "Wireless disconnected") {
  usbCalibrationConnected = false;
  ESP32_IP = "";
  serialPollFailureCount = 0;
  playActionGraceUntil = 0;
  
  resetBluetoothSession();
  setUsbCalibrationControlsEnabled(false);
  setUsbCalibrationStatus(statusMessage, "#b91c1c");
  setPlayControlsEnabled(false);
  
  // Wipe all 3 log windows
  const lostMsg = "<div>Connection lost. Reconnect to resume live messages.</div>";
  if (serialLogWindow) serialLogWindow.innerHTML = lostMsg;
  if (usbCalibrationLog) usbCalibrationLog.innerHTML = lostMsg;
  if (playLog) playLog.innerHTML = lostMsg;
  
  // Kill phantom joystick loops
  if (joystickLoopTimer) {
    clearInterval(joystickLoopTimer);
    joystickLoopTimer = null;
  }
  joystickPointerActive = false;
}

function stopWirelessSerialMonitor() {
  serialPollActive = false;
  if (serialPollTimer) { clearTimeout(serialPollTimer); serialPollTimer = null; }
}

// 💡 FIXED: Live Poller now routes to all 3 windows and enforces strict dropouts
async function pollWirelessSerialMonitor(ipAddress) {
  if (!serialPollActive) return;
  
  const abortController = new AbortController();
  const pollTimeout = window.setTimeout(() => abortController.abort(), SERIAL_POLL_TIMEOUT_MS);
  
  try {
    const response = await fetch(`${ipAddress}/serial?since=${serialLastLogId}`, { 
      cache: "no-store", 
      signal: abortController.signal 
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    serialPollFailureCount = 0; // Reset failure count on success
    
    // Battery UI Update
    if (typeof payload.battery === "number" && typeof payload.voltage === "number" && batteryStatusPanel) {
      batteryStatusPanel.style.display = "inline-flex";
      batteryPctText.innerText = `${payload.voltage.toFixed(1)}V | ${payload.battery}%`;
      batteryStatusPanel.style.borderColor = payload.battery > 20 ? "rgba(20, 184, 166, 0.4)" : "rgba(239, 68, 68, 0.6)";
      batteryStatusPanel.style.color = payload.battery > 20 ? "#0f766e" : "#b91c1c";
    }

    // 💡 FIXED: Route logs to ALL 3 UI windows simultaneously
    const lines = Array.isArray(payload.lines) ? payload.lines : [];
    for (const entry of lines) {
      if (!entry || typeof entry.text !== "string") continue;
      
      const logContainers = [serialLogWindow, usbCalibrationLog, playLog];
      logContainers.forEach(container => {
        if (container) {
          const row = document.createElement("div");
          row.className = "log-line";
          row.innerText = entry.text;
          container.appendChild(row);
          container.scrollTop = container.scrollHeight;
        }
      });
    }
    
    if (typeof payload.next === "number") serialLastLogId = payload.next;

  } catch (err) {
    // 💡 FIXED: Aggressively disconnect if the robot misses 2 rapid pings (power loss)
    if (Date.now() < playActionGraceUntil) {
      serialPollFailureCount = 0;
      return;
    }
    serialPollFailureCount += 1;
    if (serialPollFailureCount >= 2) {
      handleWirelessDisconnect("Connection Lost (Power/Range)");
      return; // Exit loop completely
    }
  } finally {
    clearTimeout(pollTimeout);
    if (serialPollActive) {
      serialPollTimer = window.setTimeout(() => pollWirelessSerialMonitor(ipAddress), 1000);
    }
  }
}

function startWirelessSerialMonitor(ipAddress) {
  const initMsg = "<div>Connecting to live serial stream...</div>";
  if (serialLogWindow) serialLogWindow.innerHTML = initMsg;
  if (usbCalibrationLog) usbCalibrationLog.innerHTML = initMsg;
  if (playLog) playLog.innerHTML = initMsg;
  
  stopWirelessSerialMonitor();
  setSerialMonitorVisible(true);
  serialPollActive = true;
  serialLastLogId = 0;
  serialPollFailureCount = 0;
  pollWirelessSerialMonitor(ipAddress);
}

// ── Auth & Handlers ────────────────
if (btnUsbDisconnect) {
  btnUsbDisconnect.addEventListener("click", () => {
    handleWirelessDisconnect();
  });
}
if (btnUsbHome) btnUsbHome.addEventListener("click", () => writeUsbCalibrationCommand("H"));
if (btnUsbWalk) btnUsbWalk.addEventListener("click", () => writeUsbCalibrationCommand("F"));
if (btnUsbReset) btnUsbReset.addEventListener("click", () => writeUsbCalibrationCommand("RESET"));
if (btnUsbSave) btnUsbSave.addEventListener("click", () => {
  writeUsbCalibrationCommand("SAVE");
  setCalibrationSaveState("EEPROM saved successfully.", "saved");
});

if (btnClearSerial) {
  btnClearSerial.addEventListener("click", () => {
    if (serialLogWindow) serialLogWindow.innerHTML = "<div>Log cleared.</div>";
    if (usbCalibrationLog) usbCalibrationLog.innerHTML = "<div>Log cleared.</div>";
    if (playLog) playLog.innerHTML = "<div>Log cleared.</div>";
  });
}

usbTrimButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const axis = btn.getAttribute("data-trim-axis");
    const step = Number(btn.getAttribute("data-trim-step") || 0);
    sendAbsoluteTrimValue(axis, (trimState[axis] || 0) + step);
  });
});

Object.entries(trimValueEls).forEach(([axis, input]) => {
  input.addEventListener("change", () => sendAbsoluteTrimValue(axis, Number(input.value)));
  input.addEventListener("keydown", (event) => { if (event.key === "Enter") input.blur(); });
});

// ── Bluetooth Connection Sequence ────────────────
const btnPair = document.getElementById("btn-usb-connect");
if (btnPair) btnPair.addEventListener("click", async () => {
  try {
    setUsbCalibrationStatus("Pairing...", "orange");
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "PrimeBot" }],
      optionalServices: [WIFI_SERVICE_UUID]
    });
    connectedGattServer = await device.gatt.connect();
    setBoardName(device.name || "ESP32");
    setUsbCalibrationStatus("Awaiting Credentials", "orange");
    if (wifiModal) wifiModal.style.display = "flex";
  } catch (err) {
    showNotification("Pairing Failed.", "error");
    setUsbCalibrationStatus("Disconnected", "red");
  }
});

if (btnCancelWifi) btnCancelWifi.addEventListener("click", () => {
  if (wifiModal) wifiModal.style.display = "none";
  handleWirelessDisconnect("Disconnected");
});

if (btnSubmitWifi) btnSubmitWifi.addEventListener("click", async () => {
  const ssid = wifiSsidInput.value.trim();
  const pass = wifiPassInput.value.trim();
  if (!ssid) return alert("Please enter SSID!");
  if (wifiModal) wifiModal.style.display = "none";

  try {
    const service = await connectedGattServer.getPrimaryService(WIFI_SERVICE_UUID);
    const writeChar = await service.getCharacteristic(WIFI_WRITE_CHARACTERISTIC_UUID);
    await writeChar.writeValue(new TextEncoder().encode(`${ssid}||${pass}`));

    setUsbCalibrationStatus("Connecting Wi-Fi...", "orange");
    const readChar = await service.getCharacteristic(WIFI_IP_CHARACTERISTIC_UUID);
    
    let attempts = 0;
    const checkInterval = setInterval(async () => {
      attempts++;
      const valBuffer = await readChar.readValue();
      const rawPayload = new TextDecoder('utf-8').decode(valBuffer);
      const parts = rawPayload.split("||");
      const resolvedIP = parts[0] ? parts[0].trim() : "0.0.0.0";

      if (resolvedIP !== "0.0.0.0" && resolvedIP !== "ERROR") {
        clearInterval(checkInterval);
        ESP32_IP = "http://" + resolvedIP;
        startWirelessSerialMonitor(ESP32_IP);
        usbCalibrationConnected = true;
        setUsbCalibrationStatus(`Connected! (${resolvedIP})`, "green");
        setUsbCalibrationControlsEnabled(true);
        
        fetch(`${ESP32_IP}/calibration`).then(r => r.json()).then(d => applyTrimSnapshot(d.trims));
      } else if (resolvedIP === "ERROR" || attempts > 20) {
        clearInterval(checkInterval);
        setUsbCalibrationStatus("Wi-Fi Failed", "red");
      }
    }, 1500);
  } catch (err) {
    handleWirelessDisconnect("Provision Error");
  }
});

// ── Blockly Upload & Play Actions ────────────────
async function uploadCurrentBlocklyProgram() {
  const programPayload = getProgramCommands();
  if (!ESP32_IP) { showNotification("Connect to Wi-Fi first.", "warning"); return; }

  setPlayButtonState("running");
  try {
    const response = await fetch(`${ESP32_IP}/run`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(programPayload),
    });
    if (response.ok) showNotification("Program uploaded successfully.", "success");
    else showNotification("Robot returned an error.", "error");
  } catch (err) {
    showNotification("Network Error.", "error");
  } finally {
    setPlayButtonState("idle");
  }
}

if (btnRunBlocklyFooter) btnRunBlocklyFooter.addEventListener("click", uploadCurrentBlocklyProgram);

playActionButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const action = btn.getAttribute("data-play-action");
    if (!action) return;
    btn.disabled = true;
    playActionGraceUntil = Date.now() + PLAY_ACTION_CONNECTION_GRACE_MS;
    try {
      await sendRobotControlCommand({ action });
    } finally {
      btn.disabled = false;
    }
  });
});

const btnStop = document.getElementById("btn-stop");
if (btnStop) btnStop.addEventListener("click", async () => {
  if (!ESP32_IP) return showNotification("Not connected.", "warning");
  btnStop.disabled = true;
  try {
    await fetch(`${ESP32_IP}/run`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setupCmds: [], loopCmds: [] }),
    });
    showNotification("Robot stopped.", "success");
  } finally {
    btnStop.disabled = false;
  }
});

// ── Divider & Auto-Save ────────────────
const divider = document.getElementById("divider");
const blocklyWrap = document.getElementById("blockly-wrap");
const codePanel = document.getElementById("code-panel");
let dragging = false;
if (divider) divider.addEventListener("mousedown", () => dragging = true);
document.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const totalWidth = divider.parentElement.getBoundingClientRect().width - 6; 
  const leftWidth = e.clientX - divider.parentElement.getBoundingClientRect().left;
  if (leftWidth > 250 && leftWidth < totalWidth - 180) {
    blocklyWrap.style.flex = "none"; blocklyWrap.style.width = leftWidth + "px";
    codePanel.style.flex = "none"; codePanel.style.width = totalWidth - leftWidth + "px";
    Blockly.svgResize(workspace);
  }
});
document.addEventListener("mouseup", () => dragging = false);

document.getElementById("view-select").addEventListener("change", function () {
  if (this.value === "blocks") { codePanel.style.display = "none"; divider.style.display = "none"; blocklyWrap.style.width = "100%"; }
  else { codePanel.style.display = "flex"; divider.style.display = "block"; blocklyWrap.style.width = ""; blocklyWrap.style.flex = "2"; codePanel.style.width = ""; codePanel.style.flex = "1"; }
  Blockly.svgResize(workspace);
});

function restoreWorkspace() {
  const savedData = localStorage.getItem("primevu_saved_workspace");
  if (savedData) try { Blockly.serialization.workspaces.load(JSON.parse(savedData), workspace); } catch(e){}
}
function saveWorkspace() { try { localStorage.setItem("primevu_saved_workspace", JSON.stringify(Blockly.serialization.workspaces.save(workspace))); } catch(e){} }
setTimeout(restoreWorkspace, 300);
setInterval(saveWorkspace, 5000);

const btnClearWorkspace = document.getElementById("btn-clear-workspace");
if (btnClearWorkspace) btnClearWorkspace.addEventListener("click", function () {
  if (confirm("Clear all blocks? This cannot be undone.")) { workspace.clear(); localStorage.removeItem("primevu_saved_workspace"); }
});

function getProgramCommands() {
  const rawCodeText = document.getElementById("code-view")?.innerText || "";
  const programData = { setupCmds: [], loopCmds: [] };
  const lines = rawCodeText.split("\n");
  let currentSection = "loop"; 
  lines.forEach((line) => {
    line = line.trim();
    if (!line || line === "}" || line === "{" || line.startsWith("//") || line.startsWith("/*") || line.startsWith("*")) return;
    if (line.toLowerCase().includes("void setup")) { currentSection = "setup"; return; }
    if (line.toLowerCase().includes("void loop")) { currentSection = "loop"; return; }
    const match = line.match(/^([a-zA-Z0-9_.]+)\(([^)]*)\)/);
    if (!match) return;
    const cmd = match[1].trim();   
    let args = match[2].trim();    
    if (args.endsWith(";")) args = args.slice(0, -1).trim();
    if (args.endsWith(")")) args = args.slice(0, -1).trim();
    if (currentSection === "setup") programData.setupCmds.push({ cmd: cmd, args: args });
    else programData.loopCmds.push({ cmd: cmd, args: args });
  });
  return programData;
}

showCalibrationPage();
