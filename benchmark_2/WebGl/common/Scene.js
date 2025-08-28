import {Plane} from "./Plane.js";
import {Object3D} from "./Object3D.js";
import {Material} from "./material.js";

class Scene extends Object3D {

    constructor(gl) {
        super(null,null,null, gl);
    }

    init(program, geoData) {
        let material = new Material(program);
        let plane = new Plane(10, 10, [0.0, 1.0, 0.0], material, this.gl, geoData);
        plane.trasladar([-0.5,-0.5, 0])
        this.addChild(plane);
    }
}

export {Scene}