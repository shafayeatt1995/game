export type PS2Button =
  | "dpadUp"
  | "dpadDown"
  | "dpadLeft"
  | "dpadRight"
  | "leftStickUp"
  | "leftStickDown"
  | "leftStickLeft"
  | "leftStickRight"
  | "rightStickUp"
  | "rightStickDown"
  | "rightStickLeft"
  | "rightStickRight"
  | "cross"
  | "square"
  | "circle"
  | "triangle"
  | "l1"
  | "l2"
  | "l3"
  | "r1"
  | "r2"
  | "r3"
  | "start"
  | "select";

export interface PS2KeyDef {
  code: string;
  key: string;
  keyCode: number;
}

export interface InputConfig {
  inputMode: "keyboard" | "gamepad";
  gamepadIndex: number;
  keyboardMap: Record<PS2Button, PS2KeyDef>;
  gamepadButtonMap: Record<PS2Button, number>; // Gamepad API button index
}

// Play!'s native default keyboard codes
export const DEFAULT_KEYBOARD_MAP: Record<PS2Button, PS2KeyDef> = {
  dpadUp: { code: "ArrowUp", key: "ArrowUp", keyCode: 38 },
  dpadDown: { code: "ArrowDown", key: "ArrowDown", keyCode: 40 },
  dpadLeft: { code: "ArrowLeft", key: "ArrowLeft", keyCode: 37 },
  dpadRight: { code: "ArrowRight", key: "ArrowRight", keyCode: 39 },
  leftStickUp: { code: "KeyT", key: "t", keyCode: 84 },
  leftStickDown: { code: "KeyG", key: "g", keyCode: 71 },
  leftStickLeft: { code: "KeyF", key: "f", keyCode: 70 },
  leftStickRight: { code: "KeyH", key: "h", keyCode: 72 },
  rightStickUp: { code: "KeyI", key: "i", keyCode: 73 },
  rightStickDown: { code: "KeyK", key: "k", keyCode: 75 },
  rightStickLeft: { code: "KeyJ", key: "j", keyCode: 74 },
  rightStickRight: { code: "KeyL", key: "l", keyCode: 76 },
  cross: { code: "KeyZ", key: "z", keyCode: 90 },
  square: { code: "KeyA", key: "a", keyCode: 65 },
  circle: { code: "KeyX", key: "x", keyCode: 88 },
  triangle: { code: "KeyS", key: "s", keyCode: 83 },
  l1: { code: "Digit1", key: "1", keyCode: 49 },
  l2: { code: "Digit2", key: "2", keyCode: 50 },
  l3: { code: "Digit3", key: "3", keyCode: 51 },
  r1: { code: "Digit8", key: "8", keyCode: 56 },
  r2: { code: "Digit9", key: "9", keyCode: 57 },
  r3: { code: "Digit0", key: "0", keyCode: 48 },
  start: { code: "Enter", key: "Enter", keyCode: 13 },
  select: { code: "Backspace", key: "Backspace", keyCode: 8 },
};

// Standard W3C Gamepad Button Mapping for PS / Xbox Controller
export const DEFAULT_GAMEPAD_MAP: Record<PS2Button, number> = {
  cross: 0, // A on Xbox / Cross on DualShock
  circle: 1, // B on Xbox / Circle on DualShock
  square: 2, // X on Xbox / Square on DualShock
  triangle: 3, // Y on Xbox / Triangle on DualShock
  l1: 4, // Left Bumper
  r1: 5, // Right Bumper
  l2: 6, // Left Trigger
  r2: 7, // Right Trigger
  select: 8, // Back / Select / Share
  start: 9, // Start / Options
  l3: 10, // Left stick click
  r3: 11, // Right stick click
  dpadUp: 12,
  dpadDown: 13,
  dpadLeft: 14,
  dpadRight: 15,
  // Analog sticks will also read standard axes (0,1 for left stick, 2,3 for right stick)
  leftStickUp: 101,
  leftStickDown: 102,
  leftStickLeft: 103,
  leftStickRight: 104,
  rightStickUp: 105,
  rightStickDown: 106,
  rightStickLeft: 107,
  rightStickRight: 108,
};

export const BUTTON_LABELS: Record<PS2Button, { title: string; symbol: string; category: string }> = {
  cross: { title: "Cross", symbol: "✕", category: "Action Buttons" },
  circle: { title: "Circle", symbol: "○", category: "Action Buttons" },
  square: { title: "Square", symbol: "□", category: "Action Buttons" },
  triangle: { title: "Triangle", symbol: "△", category: "Action Buttons" },

  dpadUp: { title: "D-Pad Up", symbol: "▲", category: "Directional Pad" },
  dpadDown: { title: "D-Pad Down", symbol: "▼", category: "Directional Pad" },
  dpadLeft: { title: "D-Pad Left", symbol: "◄", category: "Directional Pad" },
  dpadRight: { title: "D-Pad Right", symbol: "►", category: "Directional Pad" },

  leftStickUp: { title: "L-Stick Up", symbol: "LS-Up", category: "Left Analog Stick" },
  leftStickDown: { title: "L-Stick Down", symbol: "LS-Down", category: "Left Analog Stick" },
  leftStickLeft: { title: "L-Stick Left", symbol: "LS-Left", category: "Left Analog Stick" },
  leftStickRight: { title: "L-Stick Right", symbol: "LS-Right", category: "Left Analog Stick" },

  rightStickUp: { title: "R-Stick Up", symbol: "RS-Up", category: "Right Analog Stick" },
  rightStickDown: { title: "R-Stick Down", symbol: "RS-Down", category: "Right Analog Stick" },
  rightStickLeft: { title: "R-Stick Left", symbol: "RS-Left", category: "Right Analog Stick" },
  rightStickRight: { title: "R-Stick Right", symbol: "RS-Right", category: "Right Analog Stick" },

  l1: { title: "L1 Bumper", symbol: "L1", category: "Triggers & Bumpers" },
  l2: { title: "L2 Trigger", symbol: "L2", category: "Triggers & Bumpers" },
  l3: { title: "L3 Stick Click", symbol: "L3", category: "Triggers & Bumpers" },
  r1: { title: "R1 Bumper", symbol: "R1", category: "Triggers & Bumpers" },
  r2: { title: "R2 Trigger", symbol: "R2", category: "Triggers & Bumpers" },
  r3: { title: "R3 Stick Click", symbol: "R3", category: "Triggers & Bumpers" },

  start: { title: "Start", symbol: "Start", category: "System Buttons" },
  select: { title: "Select", symbol: "Select", category: "System Buttons" },
};
