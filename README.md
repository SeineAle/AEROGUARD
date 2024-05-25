# Stress Point Analysis and Shortest Path Detection

This React application visualizes a 3D model loaded from a GLTF file, performs shortest path calculations between nodes, and identifies stress points on the model. It uses Three.js for 3D rendering and interaction.

## Table of Contents

- [Getting Started](#getting-started)
- [Dependencies](#dependencies)
- [Code Overview](#code-overview)
  - [Shortest Path Calculation](#shortest-path-calculation)
  - [Stress Point Analysis](#stress-point-analysis)
- [Usage](#usage)
- [License](#license)

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js and npm installed on your local machine.

### Installation

1. Clone the repository:

```sh
git clone https://github.com/your-username/model-viewer.git
cd model-viewer
```

2. Install the dependencies:

```sh
npm install
```

3. Start the development server:

```sh
npm run dev
```

The application will run on `http://localhost:3000`.

## Dependencies

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [Three.js](https://threejs.org/) - A JavaScript 3D library that makes WebGL simpler.
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls) - Enables orbiting around objects.
- [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader) - Loads GLTF 3D models.
- [Line2, LineGeometry, LineMaterial](https://threejs.org/docs/#examples/en/lines/Line2) - Used for rendering lines in the scene.
- [TransformControls](https://threejs.org/docs/#examples/en/controls/TransformControls) - Enables transformation of objects.

## Code Overview

### Shortest Path Calculation

This section of the code computes the shortest path between two points in the 3D model.

- **parseGltf Function**: Processes the loaded GLTF model to create a graph of nodes and edges. Nodes represent positions of mesh objects, and edges are randomly connected between nodes within a defined proximity threshold.
- **pathfinder Function**: Uses Dijkstra's algorithm to calculate the shortest path between nodes in the graph. The adjacency matrix represents distances between nodes.

### Stress Point Analysis

This section of the code identifies and visualizes stress points on the 3D model.

- **parseGltf Function**: Processes the loaded GLTF model to create a graph of nodes representing stress points. It ensures no nodes are too close to each other based on a proximity threshold to avoid redundancy.
- **ModelViewer Component**: Initializes the Three.js scene, loads the GLTF model, processes the graph, and renders the 3D scene. It also handles interactions like clicking on nodes to display additional information in a modal.

### ModelViewer Component

Combines both functionalities:

- **GLTF Model Loading**: Loads and parses the model, modifying its material for transparency.
- **Three.js Scene Setup**: Sets up the scene, camera, renderer, and lights.
- **Graph Visualization**: Adds nodes (as spheres) and edges (as lines) to the scene.
- **Shortest Path Visualization**: Renders the shortest path between nodes using animated lines.
- **Stress Point Analysis**: Uses raycasting to detect and respond to clicks on spheres, displaying detailed information in a modal.
- **Orbit and Transform Controls**: Allows the user to interact with the 3D scene by orbiting around the model and transforming objects.

## Usage

To use this project, follow the instructions in the [Getting Started](#getting-started) section. Ensure your GLTF model is placed in the `public` directory at `/airplane/scene.gltf`.

### Example Data Structure

Ensure your `data.js` file follows this structure:

```javascript
const data = {
    "123.456.789": {
        title: "Stress Point 1",
        data: "Detailed information about stress point 1."
    },
    // Add more data entries as needed
};

export default data;
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


---
