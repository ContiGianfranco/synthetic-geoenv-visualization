import {m4, v3} from "twgl.js";
import {BasicCamara, OrbilalCamara} from "./camara.js";
import {getGeoTIFFRaster} from "./common/queryDB.js";
import {createInputHandler} from "./input.js";
import {Scene} from "./common/Scene.js";
import * as twgl from "twgl.js";

let fpsSum = 0, fpsCount =0, sumProsTime = 0, noStop=true, startFM = false, lastframe =0, timer=0;

const vs = `#version 300 es
precision highp float;

in vec3 aVertexPosition;
in vec3 aVertexNormal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform mat4 normalMatrix;

out vec3 vNormal;
out vec3 vPosWorld;

void main(void) {
    gl_Position = projMatrix * viewMatrix * modelMatrix * vec4(aVertexPosition, 1.0);

    vPosWorld=(modelMatrix*vec4(aVertexPosition,1.0)).xyz;    //la posicion en coordenadas de mundo
    vNormal=(normalMatrix*vec4(aVertexNormal,1.0)).xyz;       //la normal en coordenadas de mundo
}
`;

const fs = `#version 300 es
precision highp float;

uniform vec3 uColor;

in vec3 vNormal;
in vec3 vPosWorld;

out vec4 fragColor;

vec3 lightVec;

uniform vec3 uViewerPosition;
uniform float uGlossiness;
uniform float uKsFactor;

uniform vec3 directColor;
uniform vec3 ia;

// Iluminacion ambiental de Phong
vec3 phongAmbientIllumination(vec4 textureColor) {
    vec3 ka = textureColor.xyz;
    vec3 ambientIllumination = ka * ia;

    return ambientIllumination;
}

// Iluminacion direccional de Phong
vec3 directPhong(vec3 lightVec, vec4 textureColor) {

    // Iluminacion difusa de Phong
    vec3 kd = textureColor.xyz;
    vec3 id = directColor;
    vec3 diffuseIllumination = clamp(dot(lightVec, vNormal), 0.0, 1.0)*kd*id;

    // Iluminacion especular de Phong
    vec3 ks = vec3(1.0,1.0,1.0);
    vec3 is = directColor;
    vec3 viewerVector = normalize(uViewerPosition - vPosWorld);
    vec3 reflectionVector = reflect(-lightVec, vNormal);
    float RdotV = clamp(dot(reflectionVector, viewerVector), 0.0, 1.0);
    vec3 specularIllumination = pow(RdotV, uGlossiness)*ks*is*uKsFactor;

    vec3 phongIllumination = diffuseIllumination + specularIllumination;
    return phongIllumination;
}

void main(void) {

    vec4 colorTerreno = vec4(0.4,0.6,0.0675, 1.0);
    vec3 sunDirection = normalize( vec3(1.0,1.0,1.0) );
    vec3 lightPos1 = vec3(-0.4,0.0675,0.5);
    vec3 lightPos2 = vec3(0.4,0.0675,0.6);

    vec3 ambientIllumination = phongAmbientIllumination(colorTerreno);
    vec3 directIlumination = directPhong(sunDirection,colorTerreno);

    vec3 resultColor = ambientIllumination + directIlumination;

    fragColor = vec4(resultColor.xyz,1.0);
}
`;

function initWebGL() {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("Error getting WebGL2 context");
    }
    return gl;
}

function setupWebGL(gl) {
    gl.enable(gl.DEPTH_TEST);

    //set the clear color
    gl.clearColor(0.1, 0.1, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    return m4.perspective(1.0472, aspect, 1, 2000);
}

function createProgram(gl, vertexShader, fragmentShader) {
    // create a program.
    let program = gl.createProgram();

    // attach the shaders.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // link the program.
    gl.linkProgram(program);

    // Check if it linked.
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        // something went wrong with the link
        throw ("program failed to link:" + gl.getProgramInfoLog (program));
    }

    return program;
}

function compileShader(gl, shaderSource, shaderType) {
    // Create the shader object
    let shader = gl.createShader(shaderType);

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }

    return shader;
}

async function mainNew() {
    let gl = initWebGL();
    const projectionMatrix = setupWebGL(gl);

    let camara = new OrbilalCamara(v3.create(-0.5, 0, 0.5));

    let vertex = compileShader(gl, vs, gl.VERTEX_SHADER);
    let fragment = compileShader(gl, fs, gl.FRAGMENT_SHADER);
    const program = createProgram(gl, vertex, fragment);

    console.log(program)

    const scene = new Scene(gl);

    const start = Date.now();
    const geoData = await getGeoTIFFRaster();

    scene.init(program, geoData);
    console.log("Time: ", (Date.now()-start))

    function drawScene(viewMatrix, projMatrix) {

        let m1 = m4.identity();
        let m2 = m4.identity();

        scene.draw(m1, m2, viewMatrix, projMatrix);
    }

    let deltaTime = 0;
    let last = 0;

    let input = createInputHandler(gl.canvas)

    function animationLoop(now) {
        const startTime = Date.now();
        if (now !== 0 && now !== undefined)
        {
            if (!startFM)
            {
                startFM = true;
                lastframe = now;
                timer = Date.now()
                requestAnimationFrame(animationLoop);
            }

            const delta = (now - lastframe) / 1000; // en segundos

            if (delta)
            {
                fpsSum += 1 / delta;
                fpsCount += 1;
            }

            if (Date.now() > (30000 + timer) && noStop)
            {
                const averageFps = fpsSum / fpsCount;
                console.log("FPS promedio:", averageFps.toFixed(2));
                const averageTime = sumProsTime / fpsCount;
                console.log("Tiempo promedio:", averageTime.toFixed(2));
                noStop = false;
            }

            deltaTime = now - lastframe;
            lastframe = now;
            let viewMatrix = camara.update(deltaTime, input());
            let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

            m4.perspective(1.0472, aspect, 0.1, 2000, projectionMatrix);
            drawScene(viewMatrix, projectionMatrix);
            sumProsTime += Date.now() - startTime;
            requestAnimationFrame(animationLoop);
        }
    }

    requestAnimationFrame(animationLoop)

}

await mainNew();