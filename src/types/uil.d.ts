/**
 * TypeScript declarations for UIL (User Interface Library)
 * UIL is a lightweight UI library for 3D applications
 *
 * Enhanced with additional control types and options
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

    /**
     * Add a control to the GUI
     * @param type - Control type: 'group', 'button', 'slide', 'list', 'string', 'bool', 'number', etc.
     * @param options - Control-specific options
     */
    add(type: string, options?: ControlOptions): GuiControl;

    /**
     * Set the value of a named control
     */
    setVal(name: string, value: any): void;

    /**
     * Dispose of all GUI resources
     */
    dispose(): void;
  }

  export interface GuiControl {
    /**
     * Register a callback for when the control value changes
     */
    onChange(callback: (value: any) => void): GuiControl;

    /**
     * Programmatically set the control value
     */
    setValue(value: any): void;

    /**
     * Dispose of this control
     */
    dispose?(): void;
  }
}
