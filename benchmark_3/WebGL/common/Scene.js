import {Plane} from "./Plane.js";
import {Object3D} from "./Object3D.js";
import {Material} from "./material.js";

class Scene extends Object3D {

    constructor(gl) {
        super(null,null,null, gl);
    }

    init(program, geoData) {
        let material = new Material(program);

        const gridSize = 7;
        const halfGrid = Math.floor(gridSize / 2);

        for (let i = 0; i < gridSize*gridSize; i++)
        {
            let plane = new Plane(10, 10, [0.0, 1.0, 0.0], material, this.gl, geoData);

            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const x = col - halfGrid;
            const z = halfGrid - row;

            plane.trasladar([-0.5+x,-0.5+z, -1])
            this.addChild(plane);
        }
    }
}

export {Scene}