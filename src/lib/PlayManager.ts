import DiscImageDevice from "./DiscImageDevice";

export interface PlayModuleInstance {
  FS: any;
  HEAPU8: Uint8Array;
  ccall: (ident: string, returnType: string | null, argTypes: string[], args: any[]) => any;
  cwrap: (ident: string, returnType: string | null, argTypes: string[]) => any;
  discImageDevice?: DiscImageDevice;
  bootDiscImage: (fileName: string) => void;
  bootElf: (fileName: string) => void;
  getFrames?: () => number;
  clearStats?: () => void;
  pauseMainLoop?: () => void;
  resumeMainLoop?: () => void;
}


let playModuleInstance: PlayModuleInstance | null = null;
let initPromise: Promise<PlayModuleInstance> | null = null;

export async function loadPlayScript(): Promise<any> {
  if (typeof window === "undefined") return null;

  if ((window as any).Play) {
    return (window as any).Play;
  }

  // Play.js is an ES module (it has 'export default Play')
  // We use standard browser dynamic import
  const importFn = new Function("url", "return import(url)");
  const module = await importFn("/Play.js");
  const PlayFn = module.default || module.Play || module;
  (window as any).Play = PlayFn;
  return PlayFn;
}

export async function getPlayModule(canvas?: HTMLCanvasElement | null): Promise<PlayModuleInstance> {
  if (playModuleInstance) return playModuleInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const PlayConstructor = await loadPlayScript();
    const canvasElement = canvas || (document.getElementById("outputCanvas") as HTMLCanvasElement | null);

    // Intercept getContext on canvas to force M1 High-Performance Metal GPU pipeline & lowest latency
    if (canvasElement && !(canvasElement as any)._perfPatched) {
      (canvasElement as any)._perfPatched = true;
      const originalGetContext = canvasElement.getContext.bind(canvasElement);
      canvasElement.getContext = function (contextType: string, contextAttributes?: any): any {
        const enhancedAttrs = {
          ...(contextAttributes || {}),
          powerPreference: "high-performance",
          desynchronized: true,
          antialias: false, // Disabling antialias frees massive fillrate overhead on M1 GPU
          preserveDrawingBuffer: false,
        };
        return originalGetContext(contextType, enhancedAttrs);
      };
    }

    const moduleOverrides: any = {
      canvas: canvasElement,
      locateFile: function (path: string) {
        return "/" + path;
      },
      mainScriptUrlOrBlob: "/Play.js",
      contextAttributes: {
        powerPreference: "high-performance",
        desynchronized: true,
        antialias: false,
        preserveDrawingBuffer: false,
      },
      print: function (text: string) {
        console.log("[Play! core]:", text);
      },
      printErr: function (text: string) {
        console.error("[Play! err]:", text);
      },
    };

    const instance = await PlayConstructor(moduleOverrides);

    try {
      instance.FS.mkdir("/work");
    } catch {
      // directory might already exist
    }

    instance.discImageDevice = new DiscImageDevice(instance);
    instance.ccall("initVm", "", [], []);

    playModuleInstance = instance;
    return instance;
  })();

  return initPromise;
}

export async function bootPS2File(file: File, onProgress?: (msg: string) => void): Promise<void> {
  const instance = await getPlayModule();
  const fileName = file.name;
  const fileDotPos = fileName.lastIndexOf(".");
  if (fileDotPos === -1) {
    throw new Error("No file extension (.iso, .bin, .elf, etc.) found in the file.");
  }

  const ext = fileName.substring(fileDotPos).toLowerCase();

  onProgress?.(`Loading "${fileName}"...`);

  if (ext === ".elf") {
    onProgress?.("Writing ELF file into memory...");
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    const stream = instance.FS.open(fileName, "w+");
    instance.FS.write(stream, data, 0, data.length, 0);
    instance.FS.close(stream);
    onProgress?.("Booting ELF binary...");
    instance.bootElf(fileName);
  } else {
    // ISO, BIN, CSO, CHD, ISZ
    if (!instance.discImageDevice) {
      instance.discImageDevice = new DiscImageDevice(instance);
    }
    onProgress?.("Mounting disc streaming device...");
    instance.discImageDevice.setFile(file);
    onProgress?.("Booting disc image...");
    instance.bootDiscImage(fileName);
  }
}

export function pauseEmulation(): boolean {
  if (playModuleInstance && typeof playModuleInstance.pauseMainLoop === "function") {
    playModuleInstance.pauseMainLoop();
    return true;
  }
  return false;
}

export function resumeEmulation(): boolean {
  if (playModuleInstance && typeof playModuleInstance.resumeMainLoop === "function") {
    playModuleInstance.resumeMainLoop();
    return true;
  }
  return false;
}

