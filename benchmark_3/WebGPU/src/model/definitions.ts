import {mat4, vec3} from "gl-matrix";

export enum object_types {
    QUAD
}

export interface RenderData {
    camara_pos: vec3;
    view_transform: mat4;
    model_transforms: Float32Array;
    object_counts: {[obj in object_types]: number}
}