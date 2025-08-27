import * as THREE from 'three';
import {getGeoTIFFRaster} from "./src/queryDB.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xefd1b5 );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
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
const LODCell = createLODCell(geoData);
scene.add( LODCell );
console.log('Time: ', Date.now() - start)

// CAMARA
camera.position.z = 5;
camera.position.y = 5;
camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );


function animate() {
    renderer.render( scene, camera );
}

function createLODCell(geoData){

    const segments = Math.sqrt(geoData.length) - 1;
    console.log(`segments: ${segments}`);


    const geometry = new THREE.PlaneGeometry( 5, 5, segments, segments );
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