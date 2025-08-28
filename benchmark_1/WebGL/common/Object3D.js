import {m4} from "twgl.js";

export function setupVertexShaderMatrix(program, gl, viewMatrix, projMatrix){
    let viewMatrixUniform  = gl.getUniformLocation(program, "viewMatrix");
    let projMatrixUniform  = gl.getUniformLocation(program, "projMatrix");
    let ViewerPositionUniform  = gl.getUniformLocation(program, "uViewerPosition");

    let tmp = m4.inverse(viewMatrix)
    let viewerPosition = tmp.slice(12, 15);

    gl.uniformMatrix4fv(viewMatrixUniform, false, viewMatrix);
    gl.uniformMatrix4fv(projMatrixUniform, false, projMatrix);
    gl.uniform3f(ViewerPositionUniform, viewerPosition[0], viewerPosition[1], viewerPosition[2]);
}

class Object3D {
    constructor(vertexBuffer, normalBuffer, material, gl) {
        this.vertexBuffer = vertexBuffer;
        this.normalBuffer = normalBuffer;

        this.modelMatrix = glMatrix.mat4.create();
        this.normalMatrix = glMatrix.mat4.create();

        this.material = material;
        this.gl = gl;

        this.childes = [];
    }

    draw(matrix, normal, viewMatrix, projMatrix) {
        let modelMatrix = m4.multiply(matrix, this.modelMatrix);
        let normalMatrix = m4.multiply(normal, this.normalMatrix);

        if (this.vertexBuffer && this.normalBuffer) {
            let program = this.material.program;

            this.gl.useProgram(program);
            setupVertexShaderMatrix(program, this.gl, viewMatrix, projMatrix);

            let modelMatrixUniform = this.gl.getUniformLocation(program, "modelMatrix");
            let normalMatrixUniform = this.gl.getUniformLocation(program, "normalMatrix");

            this.gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);
            this.gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix);

            if (this.color) {
                this.gl.uniform3f(this.gl.getUniformLocation(program, "uColor"), this.color[0], this.color[1], this.color[2]);
            }

            if (this.material) {
                this.material.apply(this.gl);
            }

            let vertexPositionAttribute = this.gl.getAttribLocation(program, "aVertexPosition");
            this.gl.enableVertexAttribArray(vertexPositionAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.vertexAttribPointer(vertexPositionAttribute, this.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

            let vertexNormalAttribute = this.gl.getAttribLocation(program, "aVertexNormal");
            this.gl.enableVertexAttribArray(vertexNormalAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            this.gl.vertexAttribPointer(vertexNormalAttribute, this.normalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexBuffer.numItems);
        }

        for (let i = 0; i < this.childes.length; i++) {
            this.childes[i].draw(modelMatrix, normalMatrix, viewMatrix, projMatrix);
        }
    }

    rotar(angulo, eje) {
        glMatrix.mat4.rotate(this.modelMatrix, this.modelMatrix, angulo, eje);
        glMatrix.mat4.rotate(this.normalMatrix, this.normalMatrix, angulo, eje);
    }

    escalar(escala) {
        glMatrix.mat4.scale(this.modelMatrix, this.modelMatrix, escala);
    }

    trasladar(pos) {
        glMatrix.mat4.translate(this.modelMatrix, this.modelMatrix, pos);
    }

    addChild(child) {
        this.childes.push(child);
    }
}

export { Object3D };
