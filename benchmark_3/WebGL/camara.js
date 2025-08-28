import {m4, v3} from "twgl.js";

function addScaled(a, b, scale, dst) {
    if (dst === undefined) {
        dst = v3.create();
    }
    dst[0] = a[0] + b[0] * scale;
    dst[1] = a[1] + b[1] * scale;
    dst[2] = a[2] + b[2] * scale;
    dst[3] = a[3] + b[3] * scale;
    return dst;
}

function rotate(vec, axis, angle) {
    return m4.transformPoint(m4.axisRotation(axis, angle), vec);
}

export class BasicCamara {

    constructor(position) {

        if (position !== undefined) {
            this.position = position;
        } else {
            this.position = v3.create(0,(0.1+10)/(0.1-10),(2*0.1*10)/(0.1-10));
        }

        this.matrix = m4.identity();

        this.right = v3.create(1,0,0);
        this.up = v3.create(0,1,0);
        this.back = v3.create(0,1,0);
    }

    update(deltaTime, input) {
        return m4.inverse(this.matrix);
    }

}

export class OrbilalCamara extends BasicCamara {

    constructor(position) {
        super(position);

        this.angularVelocity = 0;
        this.frictionCoefficient = 0.99;
        this.rotationSpeed = 1;
        this.zoomSpeed = 0.1;


        this.distance = v3.length(this.position);
        this.back = v3.normalize(this.position);



        console.log(`this.up ${this.up}, this.back ${this.back}, this.right ${this.right}`)
        this.recalcuateRight();
        this.recalcuateUp();
        this.updateMatrix();
        console.log(`this.up ${this.up}, this.back ${this.back}, this.right ${this.right}, pos ${this.position}`);
    }

    update(deltaTime, input) {
        const epsilon = 0.0000001;


        if (input.touching) {
            this.angularVelocity = 0;
        } else {
            this.angularVelocity *= Math.pow(1 - this.frictionCoefficient, 0.02);
        }


        // Calculate the movement vector
        const movement = v3.create(0,0,0);

        addScaled(movement, this.right, input.x, movement);
        addScaled(movement, this.up, -input.y, movement);

        // Cross the movement vector with the view direction to calculate the rotation axis x magnitude
        const crossProduct = v3.cross(movement, this.back);

        // Calculate the magnitude of the drag
        const magnitude = v3.length(crossProduct);


        if (magnitude > epsilon) {
            // Normalize the crossProduct to get the rotation axis
            this.axis = v3.normalize(crossProduct);

            // Remember the current angular velocity. This is used when the touch is released for a fling.
            this.angularVelocity = magnitude * this.rotationSpeed;
        }

        // The rotation around this.axis to apply to the camera matrix this update
        const rotationAngle = this.angularVelocity * 0.02;
        if (rotationAngle > epsilon) {
            // Rotate the matrix around axis
            // Note: The rotation is not done as a matrix-matrix multiply as the repeated multiplications
            // will quickly introduce substantial error into the matrix.
            this.back = v3.normalize(rotate(this.back, this.axis, rotationAngle));
            this.recalcuateRight();
            this.recalcuateUp();
        }

        // recalculate `this.position` from `this.back` considering zoom
        if (input.zoom !== 0) {
            this.distance *= 1 + input.zoom * this.zoomSpeed;
        }

        //this.position = v3.mulScalar(this.back, this.distance);

        // Displacement
        // this.position[0] += deltaTime * 0.000066666666;


        let angleRadians = Math.atan2(this.position[2], this.position[0]); // ángulo en radianes

        this.back = [Math.cos(angleRadians), 0,Math.sin(angleRadians)];
        this.recalcuateUp();
        this.recalcuateRight();

        this.updateMatrix(angleRadians);

        // Invert the camera matrix to build the view matrix
        this.view = m4.inverse(this.matrix);
        return this.view;
    }

    // Assigns `this.right` with the cross product of `this.up` and `this.back`
    recalcuateRight() {
        this.right = v3.normalize(v3.cross(this.up, this.back));
    }

    // Assigns `this.up` with the cross product of `this.back` and `this.right`
    recalcuateUp() {
        this.up = v3.normalize(v3.cross(this.back, this.right));
    }

    updateMatrix(angleRadians) {

        if (angleRadians < Math.PI/2)
        {

            this.matrix[0] = -this.right[0]
            this.matrix[1] = -this.right[1]
            this.matrix[2] = -this.right[2]

            this.matrix[4] = -this.up[0]
            this.matrix[5] = -this.up[1]
            this.matrix[6] = -this.up[2]
        } else {
            this.matrix[0] = this.right[0]
            this.matrix[1] = this.right[1]
            this.matrix[2] = this.right[2]

            this.matrix[4] = this.up[0]
            this.matrix[5] = this.up[1]
            this.matrix[6] = this.up[2]
        }

        this.matrix[8] = this.back[0]
        this.matrix[9] = this.back[1]
        this.matrix[10] = this.back[2]

        this.matrix[12] = this.position[0]
        this.matrix[13] = this.position[1]
        this.matrix[14] = this.position[2]

    }

}