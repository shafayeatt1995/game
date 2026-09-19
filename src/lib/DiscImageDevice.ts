export default class DiscImageDevice {
  module: any;
  doneFlag: boolean;
  file: File | null;

  constructor(module: any) {
    this.module = module;
    this.doneFlag = false;
    this.file = null;
  }

  read(dstPtr: number, offset: number, size: number) {
    if (!this.file) {
      throw new Error("No disc file set.");
    }
    this.doneFlag = false;
    const subsection = this.file.slice(offset, offset + size);
    subsection.arrayBuffer().then((value: ArrayBuffer) => {
      this.module.HEAPU8.set(new Uint8Array(value), dstPtr);
      this.doneFlag = true;
    });
  }

  getFileSize() {
    if (!this.file) {
      throw new Error("No disc file set.");
    }
    return this.file.size;
  }

  isDone() {
    return this.doneFlag;
  }

  setFile(file: File) {
    this.file = file;
  }
}
