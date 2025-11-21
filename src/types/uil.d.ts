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
    add(type: string, options?: ControlOptions): GuiControl;
    add(settings: any, property: string, options?: ControlOptions): GuiControl;
    setVal(name: string, value: any): void;
    dispose(): void;
    onChange(callback: (value: string) => void): Gui;
  }

  export interface GuiControl {
    onChange(callback: (value: any) => void): GuiControl;
    setValue(value: any): void;
  }
}
