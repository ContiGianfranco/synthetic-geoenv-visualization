import { App } from "./control/app";

const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("gfx-main");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const app = new App(canvas);
app.InitializeRenderer();
app.run();