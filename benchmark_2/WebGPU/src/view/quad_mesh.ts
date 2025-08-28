import {getGeoTIFFRaster} from "../Query/query.ts";

type Vector3 = [number, number, number];

export class QuadMesh {

    buffer!: GPUBuffer
    bufferLayout!: GPUVertexBufferLayout

    normalBuffer!: GPUBuffer
    normalBufferLayout!: GPUVertexBufferLayout

    widthSegments: number = 1024 -1;
    heightSegments: number = 1024 -1;
    cols: number = this.widthSegments + 1;
    rows: number = this.heightSegments + 1;

    rasterData: any;

    /*private getPos(u: number,v: number,length: number, high: number){

        let x = length * (u-0.5);
        let y = high * (v-0.5);
        let z = Math.max(Math.abs(u-0.5)-0.5,Math.abs(v-0.5)-0.5);

        return [x,y,z];
    }*/

    private newGetPos(i: number, j: number){
        let x = i/(this.widthSegments);
        let y = j/(this.heightSegments);

        if (i < 0)
        {
            i = 0
        }
        else if (i > this.widthSegments)
        {
            i = this.widthSegments
        }
        else if (j < 0)
        {
            j = 0
        }
        else if (j > this.heightSegments)
        {
            j = this.heightSegments
        }

        let z = this.rasterData[j*this.rows+i]* 1/10000;

        return [y,x,z];
    }

    private newGetNor(p1: number[], p2: number[], p3: number[]) {

        const v1: Vector3 = [
            p2[0] - p1[0],
            p2[1] - p1[1],
            p2[2] - p1[2]
        ];

        // Vector p1 -> p3
        const v2: Vector3 = [
            p3[0] - p1[0],
            p3[1] - p1[1],
            p3[2] - p1[2]
        ];

        // Producto cruzado v1 x v2
        const normal: Vector3 = [
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
        const normalizada: Vector3 = [
            normal[0] / magnitud,
            normal[1] / magnitud,
            normal[2] / magnitud
        ];

        return normalizada;
    };

    /*private getNor(u: number, v: number) {
        const e = 0.001;

        const p1 = this.getPos(u + e, v, 1, 1);
        const p2 = this.getPos(u - e, v, 1, 1);
        const p3 = this.getPos(u, v + e, 1, 1);
        const p4 = this.getPos(u, v - e, 1, 1);

        const du = {
            x: p1[0] - p2[0],
            y: p1[1] - p2[1],
            z: p1[2] - p2[2]
        };

        const dv = {
            x: p3[0] - p4[0],
            y: p3[1] - p4[1],
            z: p3[2] - p4[2]
        };

        // Producto cruzado de du × dv
        const normal = {
            x: du.y * dv.z - du.z * dv.y,
            y: du.z * dv.x - du.x * dv.z,
            z: du.x * dv.y - du.y * dv.x
        };

        // Normalización
        const length = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
        return [normal.x / length, normal.y / length, normal.z / length]
    };*/

    private async creatrVertexBuffer(): Promise<Float32Array[]>{

        this.rasterData = await getGeoTIFFRaster();
        console.log(this.rasterData)

        let vec = [];
        let nor = [];

        const deltaUV= 1/this.heightSegments;

        let u,v,p1,p2,p3,n;


        for (let i=0;i<this.heightSegments;i++){
            u=i/(this.heightSegments);
            for (let j=0;j<this.widthSegments;j++){
                v=j/(this.widthSegments);

                p1 = this.newGetPos(i,j)

                vec.push(p1[0]);
                vec.push(p1[1]);
                vec.push(p1[2]);
                vec.push(u);
                vec.push(v);

                p2 = this.newGetPos(i,j+1)

                vec.push(p2[0]);
                vec.push(p2[1]);
                vec.push(p2[2]);
                vec.push(u);
                vec.push(v+deltaUV);

                p3 = this.newGetPos(i+1,j)

                vec.push(p3[0]);
                vec.push(p3[1]);
                vec.push(p3[2]);
                vec.push(u+deltaUV);
                vec.push(v);

                n = this.newGetNor(p1, p2, p3)

                nor.push(-n[0]);
                nor.push(-n[1]);
                nor.push(-n[2]);
                nor.push(-n[0]);
                nor.push(-n[1]);
                nor.push(-n[2]);
                nor.push(-n[0]);
                nor.push(-n[1]);
                nor.push(-n[2]);

                p1 = this.newGetPos(i,j+1)

                vec.push(p1[0]);
                vec.push(p1[1]);
                vec.push(p1[2]);
                vec.push(u);
                vec.push(v+deltaUV);

                p2 = this.newGetPos(i+1,j)

                vec.push(p2[0]);
                vec.push(p2[1]);
                vec.push(p2[2]);
                vec.push(u+deltaUV);
                vec.push(v);

                p3 = this.newGetPos(i+1,j+1)

                vec.push(p3[0]);
                vec.push(p3[1]);
                vec.push(p3[2]);
                vec.push(u+deltaUV);
                vec.push(v+deltaUV);

                n = this.newGetNor(p1, p2, p3)

                nor.push(n[0]);
                nor.push(n[1]);
                nor.push(n[2]);
                nor.push(n[0]);
                nor.push(n[1]);
                nor.push(n[2]);
                nor.push(n[0]);
                nor.push(n[1]);
                nor.push(n[2]);
            }
        }


        return [new Float32Array(vec), new Float32Array(nor)];
    }

    constructor(){}

    async init(device: GPUDevice) {

        // x y z u v
        const res: Float32Array[] = await this.creatrVertexBuffer();

        let vertices = res[0];
        let normals = res[1];

        const usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
        //VERTEX: the buffer can be used as a vertex buffer
        //COPY_DST: data can be copied to the buffer

        const descriptor: GPUBufferDescriptor = {
            size: vertices.byteLength,
            usage: usage,
            mappedAtCreation: true // similar to HOST_VISIBLE, allows buffer to be written by the CPU
        };

        this.buffer = device.createBuffer(descriptor);

        //Buffer has been created, now load in the vertices
        new Float32Array(this.buffer.getMappedRange()).set(vertices);
        this.buffer.unmap();

        //now define the buffer layout
        this.bufferLayout = {
            arrayStride: 20,
            attributes: [
                {
                    shaderLocation: 0,
                    format: "float32x3",
                    offset: 0
                },
                {
                    shaderLocation: 1,
                    format: "float32x2",
                    offset: 12
                }
            ]
        }

        const normalBufferDescriptor: GPUBufferDescriptor = {
            size: normals.byteLength,
            usage: usage,
            mappedAtCreation: true // similar to HOST_VISIBLE, allows buffer to be written by the CPU
        };

        this.normalBuffer = device.createBuffer(normalBufferDescriptor);

        new Float32Array(this.normalBuffer.getMappedRange()).set(normals);
        this.normalBuffer.unmap();

        this.normalBufferLayout = {
            arrayStride: 12,
            attributes: [
                {
                    shaderLocation: 2,
                    format: "float32x3",
                    offset: 0
                }
            ]
        }

    }
}