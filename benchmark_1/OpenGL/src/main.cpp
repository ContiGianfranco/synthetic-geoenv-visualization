#include "config.h"
#include "celda.h"
#include "camera.h"

#include <thread> 

unsigned int make_module(const std::string& filepath, unsigned int module_type);

unsigned int make_shader(const std::string& vertex_filepath, const std::string& fragment_filepath) {

	//To store all the shader modules
	std::vector<unsigned int> modules;

	//Add a vertex shader module
	modules.push_back(make_module(vertex_filepath, GL_VERTEX_SHADER));

	//Add a fragment shader module
	modules.push_back(make_module(fragment_filepath, GL_FRAGMENT_SHADER));

	//Attach all the modules then link the program
	unsigned int shader = glCreateProgram();
	for (unsigned int shaderModule : modules) {
		glAttachShader(shader, shaderModule);
	}
	glLinkProgram(shader);

	//Check the linking worked
	int success;
	glGetProgramiv(shader, GL_LINK_STATUS, &success);
	if (!success) {
		char errorLog[1024];
		glGetProgramInfoLog(shader, 1024, NULL, errorLog);
		std::cout << "Shader linking error:\n" << errorLog << '\n';
	}

	//Modules are now unneeded and can be freed
	for (unsigned int shaderModule : modules) {
		glDeleteShader(shaderModule);
	}

	return shader;

}

unsigned int make_module(const std::string& filepath, unsigned int module_type) {
	
	std::ifstream file;
	std::stringstream bufferedLines;
	std::string line;

	file.open(filepath);
	while (std::getline(file, line)) {
		//std::cout << line << std::endl;
		bufferedLines << line << '\n';
	}
	std::string shaderSource = bufferedLines.str();
	const char* shaderSrc = shaderSource.c_str();
	bufferedLines.str("");
	file.close();

	unsigned int shaderModule = glCreateShader(module_type);
	glShaderSource(shaderModule, 1, &shaderSrc, NULL);
	glCompileShader(shaderModule);

	int success;
	glGetShaderiv(shaderModule, GL_COMPILE_STATUS, &success);
	if (!success) {
		char errorLog[1024];
		glGetShaderInfoLog(shaderModule, 1024, NULL, errorLog);
		std::cout << "Shader Module compilation error:\n" << errorLog << std::endl;
	}

	return shaderModule;
}

GLFWwindow* set_up_glfw() {

	GLFWwindow* window;

	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
	glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_TRUE);
	
	window = glfwCreateWindow(1920, 1080, "Demo OpenGL", NULL, NULL);
	glfwMakeContextCurrent(window);
	glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_HIDDEN);

	return window;
}

void set_up_opengl(GLFWwindow* window) {
	glClearColor(0.25f, 0.5f, 0.75f, 1.0f);
	//Set the rendering region to the actual screen size
	int w,h;
	glfwGetFramebufferSize(window, &w, &h);
	//(left, top, width, height)
	glViewport(0,0,w,h);

	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LESS);
	glEnable(GL_CULL_FACE);
    glCullFace(GL_BACK);
}

int main() {

	if (!glfwInit()) {
		return -1;
	}
	GLFWwindow* window = set_up_glfw();

	if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
		std::cout << "Couldn't load opengl" << std::endl;
		glfwTerminate();
		return -1;
	}

	set_up_opengl(window);

	std::vector<Celda*> celdas;

	auto startCreateTerrain = std::chrono::high_resolution_clock::now();
	std::ifstream file("../../data/data.txt");
	std::vector<float> datos;
	datos.reserve(1048576);
	float valor;

	while (file >> valor)
	{
		datos.emplace_back(valor * 0.0001f);
	}

	int gridSize = 1;
	int halfGrid = gridSize / 2;

	for (int i = 0; i < gridSize*gridSize; i++)
	{
		int row = i / gridSize;
        int col = i % gridSize;

        float x = static_cast<float>(col - halfGrid);
        float z = static_cast<float>(halfGrid - row);

		celdas.emplace_back(new Celda({-0.5f+x, -0.5f+z, 0.0f}, datos));
		if (i==0)
		{
			auto finishCreateTerrain = std::chrono::high_resolution_clock::now();

			std::cout << "Terrain (ms): " << std::chrono::duration_cast<std::chrono::milliseconds>(finishCreateTerrain - startCreateTerrain).count() << std::endl;			
		}
	}

	
	Camera* player = new Camera({-.5f, 0.0f, .5f});

	unsigned int shader = make_shader(
		"../../shaders/vertex.txt", 
		"../../shaders/fragment.txt"
	);

	//Configure shader
	glUseProgram(shader);
	unsigned int view_location = glGetUniformLocation(shader, "view");
	unsigned int proj_location = glGetUniformLocation(shader, "projection");
	unsigned int player_pos_location = glGetUniformLocation(shader, "player_pos");
	glm::mat4 projection = glm::perspective(
		glm::radians(75.0f), 1920.0f / 1080.0f, 0.1f, 10.0f);
	glUniformMatrix4fv(proj_location, 1, GL_FALSE, glm::value_ptr(projection));


	auto start = std::chrono::high_resolution_clock::now();
	auto lastFrame = std::chrono::high_resolution_clock::now();
	float delta = 0;

	bool endBench = false;
	double fpsSum = 0;
	float prosTimeSum = 0;
	int count = 0;

	
	while (!glfwWindowShouldClose(window) && !endBench) {
		auto startFrame = std::chrono::high_resolution_clock::now();

		//player->move_forward(delta);

		if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS) {
			break;
		}

		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
		glUseProgram(shader);
		glUniformMatrix4fv(
			view_location, 1, GL_FALSE, 
			glm::value_ptr(player->get_view_transform()));

		glUniform3f(player_pos_location, player->position.x, player->position.y, player->position.z);

		for (size_t i = 0; i < celdas.size(); i++)
		{
			celdas[i]->draw(shader);
		}
		glfwSwapBuffers(window);
		
		auto endFrame = std::chrono::high_resolution_clock::now();

		delta = std::chrono::duration_cast<std::chrono::nanoseconds>(endFrame - lastFrame).count();

		count++;
		if (delta && count > 2)
		{
			fpsSum += (static_cast<float>(1000000000.0) / static_cast<float>(delta));
			//std::cout << "fpsSum: " << fpsSum << " delta: " << delta << " fps actual: " << (static_cast<double>(1000000000.0) / static_cast<double>(delta)) << std::endl;
			prosTimeSum += std::chrono::duration_cast<std::chrono::nanoseconds>(endFrame - startFrame).count();
		}

		if (std::chrono::duration_cast<std::chrono::seconds>(endFrame - start).count() >= 30 && !endBench)
		{
			std::cout << prosTimeSum << " " << count << std::endl;
			std::cout << "Tiempo proces: " << (prosTimeSum / static_cast<float>(count-2)) / 1000000.0 << std::endl;
			std::cout << fpsSum << " " << count << std::endl;
			std::cout << "FPS: " << (fpsSum / static_cast<float>(count-2)) << std::endl;

			endBench = true;
		}

		lastFrame = std::chrono::high_resolution_clock::now();
		glfwPollEvents();
	}

	glDeleteProgram(shader);\

	for (size_t i = 0; i < celdas.size(); i++)
	{
		delete celdas[i];
	}
	

	delete player;
	glfwTerminate();
	return 0;
}