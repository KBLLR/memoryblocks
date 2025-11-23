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
    maxHeight?: number;
    size?: number;
    center?: boolean;
    mode?: number;
    parent?: HTMLElement | null;
    isCanvas?: boolean;
    close?: boolean;
    transparent?: boolean;
    autoWidth?: boolean;
    fontColor?: string;
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
    type?: string;
    w?: number;
    multiplicator?: number;
    autoWidth?: boolean;
    [key: string]: any;
  }

  export class Gui {
    canvas: HTMLCanvasElement;
    onDraw?: () => void;

    constructor(options?: GuiOptions);

    /**
     * Add a control to the GUI
     * @param type - Control type: 'group', 'button', 'slide', 'list', 'string', 'bool', 'number', etc.
     * @param options - Control-specific options
     */
    add(type: string, options?: ControlOptions): GuiControl;
    /**
     * Add a control bound to an object's property (dat.GUI style)
     * @param object - Target object containing the property
     * @param property - Property name on the target object
     * @param options - Control-specific options
     */
    add(object: Record<string, any>, property: string, options?: ControlOptions): GuiControl;

    /**
     * Set the value of a named control
     */
    setVal(name: string, value: any): void;

    /**
     * Dispose of all GUI resources
     */
    dispose(): void;
    onChange(callback: (value: string) => void): Gui;
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
