import * as BABYLON from 'babylonjs';
import {getGeoTIFFRaster} from "./queryDB.js";

// Get the canvas DOM element
const canvas = document.getElementById('renderCanvas');
// Load the 3D engine
const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
// CreateScene function that creates and return the scene
const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 12, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);


    // lights
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 0.75, 0), scene);
    light.intensity = 0.7;

    var start = Date.now();
    const data = await getGeoTIFFRaster()
    function findMinMax(arr) {

        let min = arr[0];
        let max = arr[0];

        for (let i = 1; i < arr.length; i++) {
            if (arr[i] < min) {
                min = arr[i];
            }
            if (arr[i] > max) {
                max = arr[i];
            }
        }

        return {min, max};
    }
    function normalizeValue(min, max, value) {
        if (min > max) {
            throw new Error("El valor mínimo no puede ser mayor que el valor máximo.");
        }
        if (value < min || value > max) {
            throw new Error("El valor debe estar dentro del rango definido por el mínimo y el máximo.");
        }

        return (value - min) / (max - min);
    }
    const parcearData = function (arr) {
        const {min, max} = findMinMax(arr);

        console.log(`min: ${min}, max: ${max}`);

        const res = new Uint8Array(arr.length * 4);

        for (let i = 0; i < arr.length; i++) {
            let value = normalizeValue(min, max, arr[i]) * 255;

            res[i * 4] = value;
            res[i * 4 + 1] = value;
            res[i * 4 + 2] = value;
            res[i * 4 + 3] = 1;
        }

        return res;
    }
    const hmap = parcearData(data);
    console.log(hmap.length)
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("Terrain", {
        data: hmap,
        height: 1024,
        width: 1024
    }, {width: 5, height: 5, subdivisions: 1024, minHeight: 0, maxHeight: 1});
    console.log('Time: ', Date.now() - start);

    return scene;
};
// call the createScene function
const scene = await createScene();
// run the render loop
engine.runRenderLoop(function(){
    scene.render();
});
// the canvas/window resize event handler
window.addEventListener('resize', function(){
    engine.resize();
});