class Material {
    constructor(program, glossiness = 1, ksFactor = 0.1) {
        this.glossiness = glossiness;
        this.ksFactor = ksFactor;
        this.program = program;
    }

    apply(gl) {

        gl.uniform1f(gl.getUniformLocation(this.program, 'uGlossiness'), this.glossiness);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uKsFactor'), this.ksFactor);

        gl.uniform3f(gl.getUniformLocation(this.program, 'directColor'), 0.99, 0.8, 0.8);
        gl.uniform3f(gl.getUniformLocation(this.program, 'ia'), 0.99, 0.8, 0.8);
    }
}

export { Material };