import {Object3D} from "./Object3D.js";

function newGetPos(i, j){
    let x = i/(1023);
    let y = j/(1023);


    return [50*(y-0.5),50*(x-0.5),0];
}

function getPos(i, j, segments, data){
    let x = i/segments;
    let y = j/segments;

    if (i < 0)
    {
        i = 0
    }
    else if (i > segments)
    {
        i = segments
    }
    else if (j < 0)
    {
        j = 0
    }
    else if (j > segments)
    {
        j = segments
    }

    let z = data[j * (segments+1) + i]* 1/10000;

    return [x,y,z];
}

function getNor(p1, p2, p3) {
    const v1= [
        p2[0] - p1[0],
        p2[1] - p1[1],
        p2[2] - p1[2]
    ];

    // Vector p1 -> p3
    const v2 = [
        p3[0] - p1[0],
        p3[1] - p1[1],
        p3[2] - p1[2]
    ];

    // Producto cruzado v1 x v2
    const normal = [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    ];

    // Magnitud del vector normal
    const magnitud = Math.sqrt(
        normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2
    );

    // Evitar división por cero
    if (magnitud === 0) {
        throw new Error('Los puntos son colineales, no definen un plano.');
    }

    // Normalización
    const normalizada = [
        normal[0] / magnitud,
        normal[1] / magnitud,
        normal[2] / magnitud
    ];

    return normalizada;
}

class Plane extends Object3D {

    constructor(length, high, color, material, gl, geoData) {
        let pos = [];
        let normal = [];

        let rows = 1024;
        let cols = 1024;

        let segments = rows -1;

        let p1,p2,p3,n;

        for (let i=0;i<segments;i++){
            for (let j=0;j<segments;j++){

                p1 = getPos(i,j,segments,geoData);

                pos.push(p1[0]);
                pos.push(p1[1]);
                pos.push(p1[2]);

                p2 = getPos(i,j+1,segments,geoData)

                pos.push(p2[0]);
                pos.push(p2[1]);
                pos.push(p2[2]);

                p3 = getPos(i+1,j,segments,geoData)

                pos.push(p3[0]);
                pos.push(p3[1]);
                pos.push(p3[2]);

                n = getNor(p1,p2,p3);

                normal.push(-n[0]);
                normal.push(-n[1]);
                normal.push(-n[2]);
                normal.push(-n[0]);
                normal.push(-n[1]);
                normal.push(-n[2]);
                normal.push(-n[0]);
                normal.push(-n[1]);
                normal.push(-n[2]);

                p1 = getPos(i,j+1,segments,geoData)

                pos.push(p1[0]);
                pos.push(p1[1]);
                pos.push(p1[2]);

                p2 = getPos(i+1,j,segments,geoData)

                pos.push(p2[0]);
                pos.push(p2[1]);
                pos.push(p2[2]);

                p3 = getPos(i+1,j+1,segments,geoData)

                pos.push(p3[0]);
                pos.push(p3[1]);
                pos.push(p3[2]);

                n = getNor(p1,p2,p3);

                normal.push(n[0]);
                normal.push(n[1]);
                normal.push(n[2]);
                normal.push(n[0]);
                normal.push(n[1]);
                normal.push(n[2]);
                normal.push(n[0]);
                normal.push(n[1]);
                normal.push(n[2]);
            }
        }

        let trianglesVerticeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
        trianglesVerticeBuffer.itemSize = 3;
        trianglesVerticeBuffer.numItems = pos.length / 3;


        let trianglesNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglesNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);
        trianglesNormalBuffer.itemSize = 3;
        trianglesNormalBuffer.numItems = normal.length / 3;

        super(trianglesVerticeBuffer, trianglesNormalBuffer, material, gl);

        this.color = color;
    }

}

export {Plane}