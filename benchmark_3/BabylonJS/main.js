import * as THREE from 'three';
import {getGeoTIFFRaster} from "./src/queryDB.js";

// bench data
let lastframe = 0, fpsSum = 0, sumDelta =0, fpsCount = 0, sumProsTime = 0,noStop = true;
let startFM = false, timer;
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xefd1b5 );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


// ILUMINACION
const light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 0, 1, 1 ).normalize();
scene.add(light);

// GEOMETRIA
//const axesHelper = new THREE.AxesHelper( 5 );
//scene.add( axesHelper );

var start = Date.now();

const geoData = await getGeoTIFFRaster()

const gridSize = 7;
const halfGrid = Math.floor(gridSize / 2);

for (let i = 0; i < gridSize*gridSize; i++) {
    const LODCell = createLODCell(geoData);

    // Cálculo de posición en la grilla
    const row = Math.floor(i / gridSize); // índice de fila
    const col = i % gridSize;             // índice de columna

    // Convertir a coordenadas centradas en (0, 0)
    const x = col - halfGrid;
    const z = halfGrid - row;

    // Asignar posición (suponiendo que cada celda tiene tamaño 1; puedes multiplicar si necesitas separación mayor)
    LODCell.position.x = x;
    LODCell.position.z = z;

    scene.add(LODCell);
}


console.log('Time: ', Date.now() - start)

// CAMARA
camera.position.x = 0;
camera.position.y = 5;
camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

function animate(elapsed) {
    const startTime = performance.now();
    if (elapsed !== 0 && elapsed !== undefined)
    {
        if (!startFM)
        {
            startFM = true;
            lastframe = elapsed;
            timer = Date.now()
        } else {
            const delta = elapsed - lastframe; // en ms

            if (fpsCount > 2){

                sumDelta += delta;
                fpsSum += 1000 / delta;
            }


            fpsCount += 1;

            camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
            renderer.render( scene, camera );
            lastframe = elapsed;
            sumProsTime += performance.now() - startTime;

            if (Date.now() > (30000 + timer) && noStop)
            {
                const averageFps = fpsSum / (fpsCount-2);
                const averageFrameTime = sumDelta / (fpsCount-2);
                const averageProcTime = sumProsTime / (fpsCount-2);

                console.log("FPS count:", fpsCount);

                console.log("FPS promedio:", averageFps.toFixed(2));
                console.log("Tiempo entre frames promedio (ms):", averageFrameTime.toFixed(2));
                console.log("Tiempo de procesamiento promedio (ms):", averageProcTime.toFixed(2));

                noStop = false;
            }
        }
    }

    requestAnimationFrame(animate);
}

function createLODCell(geoData){

    const segments = Math.sqrt(geoData.length) - 1;
    console.log(`segments: ${segments}`);


    const geometry = new THREE.PlaneGeometry( 1, 1, segments, segments );
    geometry.rotateX( - Math.PI / 2 );

    const vertices = geometry.attributes.position.array;

    for ( let i = 0, j = 0; i < vertices.length; i ++, j += 3 ) {

        if (geoData[ i ] === undefined) {
            vertices[ j + 1 ] = 0;
        } else {
            vertices[ j + 1 ] = geoData[ i ] * 1/10000;
        }

    }

    geometry.computeVertexNormals();
    geometry.attributes.position.needsUpdate = true;

    return new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        specular: 0x555555,
        shininess: 30
    }))
}

requestAnimationFrame(animate);