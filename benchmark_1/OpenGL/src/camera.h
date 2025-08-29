#include "config.h"

class Camera {
public:
    Camera(glm::vec3 position);

    glm::vec3 position;

    glm::mat4 get_view_transform();

    void Camera::move_forward(float delta);
    void Camera::move(glm::vec3 dPos);

    void spin(glm::vec3 dEulers);
private:
    glm::vec3 eulers;
    glm::vec3 global_up = {0.0f, 0.0f, 1.0f};
    glm::vec3 forwards, right, up;
};