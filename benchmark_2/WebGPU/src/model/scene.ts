import { Quad } from "./quad.ts";
import { Camera } from "./camera.ts";
import { vec3,mat4 } from "gl-matrix";
import { object_types, RenderData } from "./definitions.ts";

export class Scene {

    quads: Quad[];
    player: Camera;
    object_data: Float32Array;
    quad_count: number;
    lastFrameTime: number;

    constructor() {
        this.lastFrameTime = 0;
        this.quads = [];
        this.object_data = new Float32Array(16 * 1024);
        this.quad_count = 0;

        this.make_quads();

        this.player = new Camera(
            [0, 1, 0.5], 270, -30
        );

    }

    make_quads() {
        var i: number = 0;

        for (var x: number = 0; x < 1; x++) {
            this.quads.push(
                new Quad(
                    [-0.5, -0.5, 0]
                )
            );

            var blank_matrix = mat4.create();
            for (var j: number = 0; j < 16; j++) {
                this.object_data[16 * i + j] = <number>blank_matrix.at(j);
            }
            i++;
            this.quad_count++;
        }
    }

    update(elapsed: number) {
        if (!elapsed) elapsed = 0;

        var i: number = 0;

        this.quads.forEach(
            (quad) => {
                quad.update();
                var model = quad.get_model();
                for (var j: number = 0; j < 16; j++) {
                    this.object_data[16 * i + j] = <number>model.at(j);
                }
                i++;
            }
        );


        //TODO
        this.player.position[1] = this.player.position[1] - (elapsed-this.lastFrameTime) * 0.000066666666;

        const angleRadians = Math.atan2(this.player.position[2], this.player.position[1]); // ángulo en radianes
        const angleDegrees = angleRadians * (180 / Math.PI);
        this.player.eulers[1] = -angleDegrees;
        this.player.update();
        this.lastFrameTime = elapsed;
    }

    get_player(): Camera {
        return this.player;
    }

    get_renderables(): RenderData {
        return {
            camara_pos: this.player.position,
            view_transform: this.player.get_view(),
            model_transforms: this.object_data,
            object_counts: {
                [object_types.QUAD]: this.quad_count,
            }
        }
    }

    spin_player(dX: number, dY: number) {
        this.player.eulers[2] -= dX;
        this.player.eulers[2] %= 360;

        this.player.eulers[1] = Math.min(
            89, Math.max(
                -89,
                this.player.eulers[1] - dY
            )
        );
    }

    move_player(forwards_amount: number, right_amount: number) {
        vec3.scaleAndAdd(
            this.player.position, this.player.position, 
            this.player.forwards, forwards_amount
        );

        vec3.scaleAndAdd(
            this.player.position, this.player.position, 
            this.player.right, right_amount
        );
    }
}