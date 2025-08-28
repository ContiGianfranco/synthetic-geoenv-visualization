struct TransformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    cam: vec3<f32>,
};


struct ObjectData {
    model: array<mat4x4<f32>>,
};

@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData;

struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) TexCoord : vec2<f32>,
    @location(1) vNormal : vec3<f32>,
    @location(2) vPosWorld : vec3<f32>,
};

fn phongAmbientIllumination (textureColor: vec4<f32>) -> vec3<f32> {
    var ia: vec3<f32> = vec3(1.,.75,.75);
    var ka: vec3<f32> = textureColor.yxz;
    var ambientIllumination: vec3<f32> = ka * ia;

    return ambientIllumination;
}

fn directPhong (textureColor: vec4<f32>, vNormal: vec3<f32>, vPosWorld: vec3<f32>) -> vec3<f32> {

    var lightVec: vec3<f32> = normalize(vec3(-.75,-.5,-1.));

    var kd: vec3<f32> = textureColor.yxz;
    var id: vec3<f32> = vec3(1.,.75,.75);
    var diffuseIllumination: vec3<f32> = clamp(dot(lightVec, vNormal), 0.0, 1.0) * kd * id;

    var ks: vec3<f32> = vec3(1.0,1.0,1.0);
    var is: vec3<f32> = id;

    var viewerVector: vec3<f32> = normalize(transformUBO.cam - vPosWorld);
    var reflectionVector: vec3<f32> = reflect(-lightVec, vNormal);

    var RdotV: f32 = clamp(dot(reflectionVector, viewerVector), 0.0, 1.0);

    var uGlossiness: f32 = 1.0;
    var uKsFactor: vec3<f32> = vec3(1.0,1.0,1.0);

    var specularIllumination: vec3<f32> = pow(RdotV, uGlossiness)*ks*is*uKsFactor;

    var phongIllumination: vec3<f32> = diffuseIllumination + specularIllumination;

    return phongIllumination;
}

@vertex
fn vs_main(
    @builtin(instance_index) ID: u32,
    @location(0) vertexPostion: vec3<f32>,
    @location(1) vertexTexCoord: vec2<f32>,
    @location(2) vertexNormal: vec3<f32>
    ) -> Fragment {

    var output : Fragment;
    output.Position = transformUBO.projection * transformUBO.view * objects.model[ID] * vec4<f32>(vertexPostion, 1.0);
    output.TexCoord = vertexTexCoord;
    output.vNormal = vertexNormal;
    output.vPosWorld = vertexPostion;

    return output;
}

@fragment
fn fs_main(@location(0) TexCoord : vec2<f32>, @location(1) vNormal : vec3<f32>, @location(2) vPosWorld : vec3<f32>) -> @location(0) vec4<f32> {

    var textureColor: vec4<f32> = vec4(0.9,0.5,0.6,1.0);;

    var resultColor = phongAmbientIllumination(textureColor) + directPhong(textureColor, vNormal, vPosWorld) ;

    return vec4(resultColor.xyz, 1.0);
}