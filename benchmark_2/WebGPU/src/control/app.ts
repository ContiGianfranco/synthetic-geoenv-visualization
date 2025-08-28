import { Renderer } from "../view/renderer";
import { Scene } from "../model/scene";
import $ from "jquery"

export class App {

    canvas: HTMLCanvasElement;
    renderer: Renderer;
    scene: Scene;

    forwards_amount: number;
    right_amount: number;
    lastframe: number;
    fpsSum:number = 0;
    fpsCount:number = 0;
    noStop: boolean = true;
    startFM: boolean = false;
    timer: number = 0;
    sumProsTime = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.renderer = new Renderer(canvas);

        this.scene = new Scene();

        this.forwards_amount = 0;
        this.right_amount = 0;
        this.lastframe = 0;
        $(document).on(
            "keydown",
            (event) => {
                this.handle_keypress(event);
            }
        );
        $(document).on(
            "keyup",
            (event) => {
                this.handle_keyrelease(event);
            }
        );
        this.canvas.onclick = () => {
            this.canvas.requestPointerLock();
        }
        /*this.canvas.addEventListener(
            "mousemove",
            (event: MouseEvent) => {this.handle_mouse_move(event);}
        );*/

    }

    async InitializeRenderer() {
        await this.renderer.Initialize();
    }

    run = (elapsed: number) => {
        const startTime = Date.now();
        if (elapsed !== 0 && elapsed !== undefined)
        {
            if (!this.startFM)
            {
                this.startFM = true;
                this.lastframe = elapsed;
                this.timer = Date.now()
                requestAnimationFrame(this.run);
            }

            const delta = (elapsed - this.lastframe) / 1000; // en segundos

            if (delta && elapsed > 1000)
            {
                this.fpsSum += 1 / delta;
                this.fpsCount += 1;
            }

            if (elapsed > 30000 && this.noStop)
            {
                const averageFps = this.fpsSum / this.fpsCount;
                console.log("FPS promedio:", averageFps.toFixed(2));
                const averageTime = this.sumProsTime / this.fpsCount;
                console.log("Tiempo promedio:", averageTime.toFixed(2));
                this.noStop = false;
            }
        }



        this.scene.update(elapsed);
        this.scene.move_player(this.forwards_amount, this.right_amount);

        this.renderer.render(
            this.scene.get_renderables()
        );

        this.sumProsTime += Date.now() - startTime;
        this.lastframe = elapsed;
        requestAnimationFrame(this.run);
    }

    handle_keypress(event: JQuery.KeyDownEvent) {

        if (event.code == "KeyW") {
            this.forwards_amount = 0.02;
        }
        if (event.code == "KeyS") {
            this.forwards_amount = -0.02;
        }
        if (event.code == "KeyA") {
            this.right_amount = -0.02;
        }
        if (event.code == "KeyD") {
            this.right_amount = 0.02;
        }

    }

    handle_keyrelease(event: JQuery.KeyUpEvent) {

        if (event.code == "KeyW") {
            this.forwards_amount = 0;
        }
        if (event.code == "KeyS") {
            this.forwards_amount = 0;
        }
        if (event.code == "KeyA") {
            this.right_amount = 0;
        }
        if (event.code == "KeyD") {
            this.right_amount = 0;
        }

    }

    handle_mouse_move(event: MouseEvent) {

        this.scene.spin_player(
            event.movementX / 5, event.movementY / 5
        );
    }

}