import { 
  PS2Button, 
  PS2KeyDef, 
  InputConfig, 
  DEFAULT_KEYBOARD_MAP, 
  DEFAULT_GAMEPAD_MAP 
} from "./InputConfig";

export class InputManager {
  private config: InputConfig;
  private canvasElement: HTMLCanvasElement | null = null;
  private gamepadPollInterval: number | null = null;
  private activeGamepadState: Record<PS2Button, boolean> = {} as any;
  private customKeyboardActive: Record<string, boolean> = {};

  constructor() {
    this.config = this.loadConfig();
    this.setupListeners();
  }

  public setCanvas(canvas: HTMLCanvasElement | null) {
    this.canvasElement = canvas;
  }

  public getConfig(): InputConfig {
    return this.config;
  }

  public updateConfig(newConfig: InputConfig) {
    this.config = newConfig;
    this.saveConfig(newConfig);
  }

  private loadConfig(): InputConfig {
    if (typeof window === "undefined") {
      return {
        inputMode: "keyboard",
        gamepadIndex: 0,
        keyboardMap: { ...DEFAULT_KEYBOARD_MAP },
        gamepadButtonMap: { ...DEFAULT_GAMEPAD_MAP },
      };
    }

    try {
      const saved = localStorage.getItem("playsphere_input_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          inputMode: parsed.inputMode || "keyboard",
          gamepadIndex: parsed.gamepadIndex ?? 0,
          keyboardMap: { ...DEFAULT_KEYBOARD_MAP, ...(parsed.keyboardMap || {}) },
          gamepadButtonMap: { ...DEFAULT_GAMEPAD_MAP, ...(parsed.gamepadButtonMap || {}) },
        };
      }
    } catch (e) {
      console.error("Failed to load saved input config", e);
    }

    return {
      inputMode: "keyboard",
      gamepadIndex: 0,
      keyboardMap: { ...DEFAULT_KEYBOARD_MAP },
      gamepadButtonMap: { ...DEFAULT_GAMEPAD_MAP },
    };
  }

  private saveConfig(config: InputConfig) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("playsphere_input_config", JSON.stringify(config));
    } catch (e) {
      console.error("Failed to save input config", e);
    }
  }

  private setupListeners() {
    if (typeof window === "undefined") return;

    // Listen to custom keyboard remaps
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;

      // Find if this pressed physical key is remapped to a PS2 button
      for (const [btn, keyDef] of Object.entries(this.config.keyboardMap) as [PS2Button, PS2KeyDef][]) {
        if (e.code === keyDef.code && !this.customKeyboardActive[btn]) {
          this.customKeyboardActive[btn] = true;

          // If the mapped key is different from Play!'s native default key, synthesize the native event
          const nativeKey = DEFAULT_KEYBOARD_MAP[btn];
          if (nativeKey && nativeKey.code !== keyDef.code) {
            this.dispatchNativeKeyEvent("keydown", nativeKey);
          }
          break;
        }
      }
    });

    window.addEventListener("keyup", (e: KeyboardEvent) => {
      for (const [btn, keyDef] of Object.entries(this.config.keyboardMap) as [PS2Button, PS2KeyDef][]) {
        if (e.code === keyDef.code) {
          this.customKeyboardActive[btn] = false;
          const nativeKey = DEFAULT_KEYBOARD_MAP[btn];
          if (nativeKey && nativeKey.code !== keyDef.code) {
            this.dispatchNativeKeyEvent("keyup", nativeKey);
          }
          break;
        }
      }
    });

    // Start gamepad polling loop
    this.startGamepadPolling();
  }

  public dispatchNativeKeyEvent(type: "keydown" | "keyup", keyDef: PS2KeyDef) {
    const target = this.canvasElement || document.getElementById("outputCanvas") || document;

    const event = new KeyboardEvent(type, {
      key: keyDef.key,
      code: keyDef.code,
      keyCode: keyDef.keyCode,
      which: keyDef.keyCode,
      bubbles: true,
      cancelable: true,
    });

    target.dispatchEvent(event);
  }

  private startGamepadPolling() {
    if (typeof window === "undefined") return;

    const poll = () => {
      if (this.config.inputMode === "gamepad" || this.config.inputMode === "keyboard") {
        this.pollGamepads();
      }
      this.gamepadPollInterval = requestAnimationFrame(poll);
    };

    this.gamepadPollInterval = requestAnimationFrame(poll);
  }

  private pollGamepads() {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return;

    const gamepads = navigator.getGamepads();
    const gp = gamepads[this.config.gamepadIndex] || gamepads.find((g) => g !== null);
    if (!gp) return;

    const buttons = gp.buttons;
    const axes = gp.axes;

    const checkButton = (index: number): boolean => {
      // Standard buttons (0-15)
      if (index < 100) {
        return buttons[index]?.pressed || false;
      }
      // Analog Stick Axis Emulation
      const DEADZONE = 0.4;
      if (index === 101) return (axes[1] || 0) < -DEADZONE; // Left Stick Up
      if (index === 102) return (axes[1] || 0) > DEADZONE; // Left Stick Down
      if (index === 103) return (axes[0] || 0) < -DEADZONE; // Left Stick Left
      if (index === 104) return (axes[0] || 0) > DEADZONE; // Left Stick Right

      if (index === 105) return (axes[3] || 0) < -DEADZONE; // Right Stick Up
      if (index === 106) return (axes[3] || 0) > DEADZONE; // Right Stick Down
      if (index === 107) return (axes[2] || 0) < -DEADZONE; // Right Stick Left
      if (index === 108) return (axes[2] || 0) > DEADZONE; // Right Stick Right

      return false;
    };

    // Check all PS2 buttons
    for (const [btn, gpBtnIndex] of Object.entries(this.config.gamepadButtonMap) as [PS2Button, number][]) {
      const isPressed = checkButton(gpBtnIndex);
      const wasPressed = !!this.activeGamepadState[btn];

      if (isPressed && !wasPressed) {
        this.activeGamepadState[btn] = true;
        const nativeKey = DEFAULT_KEYBOARD_MAP[btn];
        if (nativeKey) {
          this.dispatchNativeKeyEvent("keydown", nativeKey);
        }
      } else if (!isPressed && wasPressed) {
        this.activeGamepadState[btn] = false;
        const nativeKey = DEFAULT_KEYBOARD_MAP[btn];
        if (nativeKey) {
          this.dispatchNativeKeyEvent("keyup", nativeKey);
        }
      }
    }
  }

  public getConnectedGamepads(): Gamepad[] {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return [];
    const list: Gamepad[] = [];
    const gps = navigator.getGamepads();
    for (let i = 0; i < gps.length; i++) {
      if (gps[i]) list.push(gps[i]!);
    }
    return list;
  }
}

// Global Singleton
let inputManagerInstance: InputManager | null = null;
export function getInputManager(): InputManager {
  if (!inputManagerInstance) {
    inputManagerInstance = new InputManager();
  }
  return inputManagerInstance;
}
