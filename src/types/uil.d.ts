/**
 * TypeScript declarations for UIL (User Interface Library)
 * UIL is a lightweight UI library for 3D applications
 */

declare module 'uil' {
  export interface GuiOptions {
    css?: string;
    name?: string;
    w?: number;
    h?: number;
    size?: number;
    center?: boolean;
    mode?: number;
    [key: string]: any;
  }

  export interface ControlOptions {
    name?: string;
    value?: any;
    min?: number;
    max?: number;
    precision?: number;
    step?: number;
    list?: string[];
    fontColor?: string;
    height?: number;
    mode?: string;
    open?: boolean;
    [key: string]: any;
  }

  export class Gui {
    constructor(options?: GuiOptions);
    add(type: string, options?: ControlOptions): GuiControl;
    setVal(name: string, value: any): void;
    dispose(): void;
  }

  export interface GuiControl {
    onChange(callback: (value: any) => void): GuiControl;
    setValue(value: any): void;
  }
}
