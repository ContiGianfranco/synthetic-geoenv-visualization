import * as BABYLON from 'babylonjs';
import {getGeoTIFFRaster} from "./queryDB.js";

// Get the canvas DOM element
const canvas = document.getElementById('renderCanvas');
// Load the 3D engine
const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
engine.enableOfflineSupport = false;

// CreateScene function that creates and return the scene
const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 7, 0), scene);
    camera.minZ = 0.1
    camera.fov = BABYLON.Tools.ToRadians(75);
    camera.setTarget(new BABYLON.Vector3(0,0,0));

    camera.attachControl(true);

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

        min = min;
        max = max;

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
            res[i * 4 + 3] = 0;
        }

        return res;
    }
    const hmap = parcearData(data);
    console.log(hmap.length)

    const gridSize = 5;
    const halfGrid = Math.floor(gridSize / 2);

    for (let i = 0; i < gridSize*gridSize; i++){
        const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("Terrain", {
            data: hmap,
            height: 1024,
            width: 1024
        }, {width: 1, height: 1, subdivisions: 1024, minHeight: 0, maxHeight: 1/4});

        const row = Math.floor(i / gridSize);
        const col = i % gridSize;

        ground.position.x = col - halfGrid;
        ground.position.z = halfGrid - row;
        ground.position.y = 1;
    }

    console.log('Time: ', Date.now() - start);

    return scene;
};
// call the createScene function
const scene = await createScene();
// run the render loop

let fpsSum=0, sumDelta= 0, sumProsTime=0, timer = 0, lastframe = 0, fpsCount=0, noStop = true, startFM = false;
engine.runRenderLoop(function(){
    const elapsed = performance.now();
    const startTime = performance.now();
    scene.render();
    sumProsTime += performance.now() - startTime;

    if (performance.now() !== 0 && performance.now() !== undefined)
    {
        if (!startFM)
        {
            startFM = true;
            lastframe = elapsed;
            timer = Date.now();
        } else {
            const delta = elapsed - lastframe;

            fpsSum += 1000 / delta;
            fpsCount += 1;
            sumDelta += delta;

            lastframe = elapsed;

            if (Date.now() > (30000 + timer) && noStop)
            {
                const averageFps = fpsSum / fpsCount;
                const averageFrameTime = sumDelta / fpsCount;
                const averageProcTime = sumProsTime / fpsCount;

                console.log("FPS promedio:", averageFps.toFixed(2));
                console.log("Tiempo entre frames promedio (ms):", averageFrameTime.toFixed(2));
                console.log("Tiempo de procesamiento promedio (ms):", averageProcTime.toFixed(2));

                noStop = false;
            }
        }
    }


});

// the canvas/window resize event handler
window.addEventListener('resize', function(){
    engine.resize();
});