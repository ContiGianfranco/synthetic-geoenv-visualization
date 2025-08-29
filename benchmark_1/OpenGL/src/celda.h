#include "config.h"

class Celda {

public:
    Celda(glm::vec3 position, const std::vector<float>& datos);

    ~Celda();

    void update(float dt);

    void draw(unsigned int shader);
private:
    glm::vec3 position, eulers;
    unsigned int VAO, VBO;

    void make_mesh(const std::vector<float>& datos);
    std::array<float, 3> Celda::get_pos(size_t i, size_t j, size_t segments, const std::vector<float>& datos);
    std::array<float, 3> Celda::get_normal(std::array<float, 3> p1, std::array<float, 3> p2, std::array<float, 3> p3);
};