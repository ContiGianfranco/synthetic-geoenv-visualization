#include "celda.h"
#include "stb_image.h"

#include <algorithm>

Celda::Celda(glm::vec3 position, const std::vector<float>& datos) {
    this->position = position;
    this->eulers = glm::vec3(0.0f, 0.0f, 0.0f);

    make_mesh(datos);
}

std::array<float, 3> Celda::get_pos(size_t i, size_t j, size_t segments, const std::vector<float>& datos) {

    // Asegurarse de que i y j estén dentro del rango permitido
    if (i < 0)
    {
        i = 0;
    }
    else if (i > segments)
    {
        i = segments;
    }
    else if (j < 0)
    {
        j = 0;
    }
    else if (j > segments)
    {
        j = segments;
    }


    float x = static_cast<float>(i) / static_cast<float>(segments);
    float y = static_cast<float>(j) / static_cast<float>(segments);

    float z = (datos[j * (segments + 1) + i]);

    return {x, y, z};
}

std::array<float, 3> Celda::get_normal(std::array<float, 3> p1, std::array<float, 3> p2, std::array<float, 3> p3) {

        // Vector p1 -> p2
    std::array<float, 3> v1 = {
        p2[0] - p1[0],
        p2[1] - p1[1],
        p2[2] - p1[2]
    };

    // Vector p1 -> p3
    std::array<float, 3> v2 = {
        p3[0] - p1[0],
        p3[1] - p1[1],
        p3[2] - p1[2]
    };

    // Producto cruzado v1 x v2
    std::array<float, 3> normal = {
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    };

    // Magnitud del vector normal
    float magnitude = std::sqrt(
        normal[0] * normal[0] +
        normal[1] * normal[1] +
        normal[2] * normal[2]
    );

    // Evitar división por cero
    if (magnitude == 0.0f) {
        throw std::runtime_error("Los puntos son colineales, no definen un plano.");
    }

    // Normalización
    std::array<float, 3> normalized = {
        normal[0] / magnitude,
        normal[1] / magnitude,
        normal[2] / magnitude
    };

    return normalized;
    
}

void Celda::make_mesh(const std::vector<float>&  datos) {
    std::vector<float> vertices;
    size_t segments = 1023;

    vertices.reserve(segments * segments * 6 * 6);

    std::array<float, 3> p1;
    std::array<float, 3> p2;
    std::array<float, 3> p3;
    std::array<float, 3> n;
    

    for (size_t i = 0; i < segments; i++)
    {
        for (size_t j = 0; j < segments; j++)
        {
            p1 = this->get_pos(i,j,segments, datos);
            p2 = this->get_pos(i+1,j,segments, datos);
            p3 = this->get_pos(i,j+1,segments, datos);

            n = this->get_normal(p1,p2,p3);

            vertices.emplace_back(p1[0]);
            vertices.emplace_back(p1[1]);
            vertices.emplace_back(p1[2]);

            vertices.emplace_back(n[0]);
            vertices.emplace_back(n[1]);
            vertices.emplace_back(n[2]);

            vertices.emplace_back(p2[0]);
            vertices.emplace_back(p2[1]);
            vertices.emplace_back(p2[2]);

            vertices.emplace_back(n[0]);
            vertices.emplace_back(n[1]);
            vertices.emplace_back(n[2]);

            vertices.emplace_back(p3[0]);
            vertices.emplace_back(p3[1]);
            vertices.emplace_back(p3[2]);

            vertices.emplace_back(n[0]);
            vertices.emplace_back(n[1]);
            vertices.emplace_back(n[2]);

            p1 = this->get_pos(i+1,j+1,segments, datos);
            n = this->get_normal(p1,p2,p3);

            vertices.emplace_back(p3[0]);
            vertices.emplace_back(p3[1]);
            vertices.emplace_back(p3[2]);

            vertices.emplace_back(-n[0]);
            vertices.emplace_back(-n[1]);
            vertices.emplace_back(-n[2]);

            vertices.emplace_back(p2[0]);
            vertices.emplace_back(p2[1]);
            vertices.emplace_back(p2[2]);

            vertices.emplace_back(-n[0]);
            vertices.emplace_back(-n[1]);
            vertices.emplace_back(-n[2]);

            vertices.emplace_back(p1[0]);
            vertices.emplace_back(p1[1]);
            vertices.emplace_back(p1[2]);

            vertices.emplace_back(-n[0]);
            vertices.emplace_back(-n[1]);
            vertices.emplace_back(-n[2]);
        }        
    }


    /*
    for (size_t i = 0; i < vertices.size(); i =i+5)
    {
        std::cout << vertices[i] << " "<< vertices[i+1] << " "<< vertices[i+2] << " "<< vertices[i+3] << " "<< vertices[i+4]  << std::endl;
    }*/
    
    std::cout << vertices.size() << std::endl;
    std::cout << vertices.size()/5 << std::endl;

    glGenVertexArrays(1, &VAO);
    glBindVertexArray(VAO);

    glGenBuffers(1, &VBO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(float), 
        vertices.data(), GL_STATIC_DRAW);
    //position
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 24, (void*)0);
    glEnableVertexAttribArray(0);

    //normal coordinates
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 24, (void*)12);
    glEnableVertexAttribArray(1);
}

void Celda::update(float dt) {

    //eulers.z += 10.0f * dt;

    if (eulers.z > 360) {
        eulers.z -= 360;
    }
}

void Celda::draw(unsigned int shader) {

    glUseProgram(shader);

    //model transform
    glm::mat4 model = glm::mat4(1.0f);
	model = glm::translate(model, position);
	model = glm::rotate(
        model, glm::radians(eulers.z), 
        { 0.0f, 0.0f, 1.0f });
	glUniformMatrix4fv(
        glGetUniformLocation(shader, "model"), 
        1, GL_FALSE, value_ptr(model));
    
    //mesh
    glBindVertexArray(VAO);

    glDrawArrays(GL_TRIANGLES, 0, 7535008);
}

Celda::~Celda() {
    glDeleteBuffers(1, &VBO);
    glDeleteVertexArrays(1, &VAO);
}