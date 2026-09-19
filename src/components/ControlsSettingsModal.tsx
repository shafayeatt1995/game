"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Gamepad2, 
  Keyboard, 
  RotateCcw, 
  Save, 
  Check, 
  SlidersHorizontal,
  ChevronRight,
  Disc,
  Info
} from "lucide-react";
import { 
  PS2Button, 
  PS2KeyDef, 
  InputConfig, 
  DEFAULT_KEYBOARD_MAP, 
  DEFAULT_GAMEPAD_MAP, 
  BUTTON_LABELS 
} from "@/lib/InputConfig";
import { getInputManager } from "@/lib/InputManager";

interface ControlsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ControlsSettingsModal({ isOpen, onClose }: ControlsSettingsModalProps) {
  const [config, setConfig] = useState<InputConfig>(() => getInputManager().getConfig());
  const [recordingButton, setRecordingButton] = useState<PS2Button | null>(null);
  const [connectedGamepads, setConnectedGamepads] = useState<Gamepad[]>([]);
  const [saveToast, setSaveToast] = useState(false);

  // Poll available gamepads when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const checkGamepads = () => {
      const gps = getInputManager().getConnectedGamepads();
      setConnectedGamepads(gps);
    };

    checkGamepads();
    const interval = setInterval(checkGamepads, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Key recording listener
  useEffect(() => {
    if (!recordingButton) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const newKeyDef: PS2KeyDef = {
        code: e.code,
        key: e.key,
        keyCode: e.keyCode,
      };

      setConfig((prev) => ({
        ...prev,
        keyboardMap: {
          ...prev.keyboardMap,
          [recordingButton]: newKeyDef,
        },
      }));

      setRecordingButton(null);
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [recordingButton]);

  if (!isOpen) return null;

  const handleSave = () => {
    getInputManager().updateConfig(config);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 600);
  };

  const handleResetDefaults = () => {
    if (confirm("Do you want to reset all controls to default settings?")) {
      const resetConfig: InputConfig = {
        inputMode: config.inputMode,
        gamepadIndex: 0,
        keyboardMap: { ...DEFAULT_KEYBOARD_MAP },
        gamepadButtonMap: { ...DEFAULT_GAMEPAD_MAP },
      };
      setConfig(resetConfig);
      getInputManager().updateConfig(resetConfig);
    }
  };

  const categories = Array.from(new Set(Object.values(BUTTON_LABELS).map((b) => b.category)));

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Controller & Input Configuration
              </h2>
              <p className="text-xs text-zinc-400">Configure keybindings for your keyboard or USB / Bluetooth gamepad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Mode Selector (Keyboard vs Gamepad) */}
        <div className="p-4 sm:p-6 border-b border-zinc-800/60 bg-zinc-900/30">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
            Select Primary Input Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setConfig((prev) => ({ ...prev, inputMode: "keyboard" }))}
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                config.inputMode === "keyboard"
                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <div className={`p-2.5 rounded-xl ${config.inputMode === "keyboard" ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                <Keyboard className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Keyboard Mode</div>
                <div className="text-xs text-zinc-400">Play using customizable keyboard keys</div>
              </div>
            </button>

            <button
              onClick={() => setConfig((prev) => ({ ...prev, inputMode: "gamepad" }))}
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                config.inputMode === "gamepad"
                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <div className={`p-2.5 rounded-xl ${config.inputMode === "gamepad" ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Gamepad / Controller Mode</div>
                <div className="text-xs text-zinc-400">
                  {connectedGamepads.length > 0 
                    ? `Connected: ${connectedGamepads[0].id.substring(0, 20)}...`
                    : "No controller detected (press any button)"}
                </div>
              </div>
            </button>
          </div>

          {/* Gamepad Status Banner */}
          {config.inputMode === "gamepad" && (
            <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${connectedGamepads.length > 0 ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                <span>
                  {connectedGamepads.length > 0
                    ? `Active Controller: ${connectedGamepads[0].id}`
                    : "Press any button on your gamepad so the browser can detect it."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Remapping List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {config.inputMode === "keyboard" ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-zinc-400">Click any key badge and press a new key to remap</span>
                {recordingButton && (
                  <span className="text-xs font-bold text-amber-400 animate-pulse">
                    Press new key... (Esc to cancel)
                  </span>
                )}
              </div>

              <div className="space-y-5">
                {categories.map((cat) => (
                  <div key={cat} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                      {cat}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(Object.keys(BUTTON_LABELS) as PS2Button[])
                        .filter((btn) => BUTTON_LABELS[btn].category === cat)
                        .map((btn) => {
                          const meta = BUTTON_LABELS[btn];
                          const keyDef = config.keyboardMap[btn] || DEFAULT_KEYBOARD_MAP[btn];
                          const isRec = recordingButton === btn;

                          return (
                            <div
                              key={btn}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all"
                            >
                              <div className="flex items-center gap-2 text-xs">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-zinc-800 text-zinc-300 font-mono font-bold text-[11px]">
                                  {meta.symbol}
                                </span>
                                <span className="text-zinc-200 font-medium">{meta.title}</span>
                              </div>

                              <button
                                onClick={() => setRecordingButton(btn)}
                                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                  isRec
                                    ? "bg-amber-500 text-black animate-pulse"
                                    : "bg-zinc-800 hover:bg-zinc-700 text-cyan-400 border border-zinc-700"
                                }`}
                              >
                                {isRec ? "Press..." : keyDef.code || keyDef.key}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-cyan-400" />
                  Automatic Gamepad Mapping (W3C Standard)
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your controller works instantly out of the box. Below is the standard mapping configured for PlayStation, Xbox, and generic controllers:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850">
                    <span className="text-zinc-400">Cross (✕)</span>
                    <span className="text-emerald-400 font-bold">Button A / 0</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850">
                    <span className="text-zinc-400">Circle (○)</span>
                    <span className="text-rose-400 font-bold">Button B / 1</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850">
                    <span className="text-zinc-400">Square (□)</span>
                    <span className="text-indigo-400 font-bold">Button X / 2</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850">
                    <span className="text-zinc-400">Triangle (△)</span>
                    <span className="text-amber-400 font-bold">Button Y / 3</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850">
                    <span className="text-zinc-400">D-Pad & Analog</span>
                    <span className="text-cyan-400 font-bold">D-Pad & Analog Sticks</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850">
                    <span className="text-zinc-400">L1, L2, R1, R2</span>
                    <span className="text-purple-400 font-bold">Bumpers & Triggers</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850">
                    <span className="text-zinc-400">Start / Select</span>
                    <span className="text-cyan-400 font-bold">Menu / Back</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              {saveToast ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
