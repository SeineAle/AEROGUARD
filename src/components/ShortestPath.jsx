import React, { useEffect, useState } from 'react';
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

const parseGltf = (gltf) => {
    const graph = { nodes: [], edges: [] };

    gltf.scene.traverse((node) => {
        if (node.isMesh) {
            const position = new THREE.Vector3();
            node.getWorldPosition(position);
            graph.nodes.push({
                id: node.uuid,
                position: position.clone(),
            });
        }
    });

    // Create edges by connecting each node to the next one
    for (let i = 0; i < graph.nodes.length - 1; i++) {
        for(let j = i+ 1; j < graph.nodes.length; j = j += 100){
            
            graph.edges.push({
                start: graph.nodes[i].position,
                end: graph.nodes[j].position,
            });
        }
    }


    return graph;
};

const pathfinder = (nodes) => {
    const nodeCount = nodes.length;
    const adjacencyMatrix = Array(nodeCount).fill().map(() => Array(nodeCount).fill(Infinity))
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j += 5) {
            const distance = nodes[i].position.distanceTo(nodes[j].position);
            adjacencyMatrix[i][j] = distance;
            adjacencyMatrix[j][i] = distance;
        }
    }
    const dijkstra = (start, end) => {
        const distances = Array(nodeCount).fill(Infinity);
        const previous = Array(nodeCount).fill(null);
        const visited = Array(nodeCount).fill(false);
        distances[start] = 0;

        for (let i = 0; i < nodeCount; i++) {
            let u = -1;
            for (let j = 0; j < nodeCount; j++) {
                if (!visited[j] && (u === -1 || distances[j] < distances[u])) {
                    u = j;
                }
            }
            if (distances[u] === Infinity) break;
            visited[u] = true;
            for (let v = 0; v < nodeCount; v++) {
                if (!visited[v] && adjacencyMatrix[u][v] !== Infinity) {
                    const alt = distances[u] + adjacencyMatrix[u][v];
                    if (alt < distances[v]) {
                        distances[v] = alt;
                        previous[v] = u;
                    }
                }
            }
        }

        const path = [];
        for (let at = end; at !== null; at = previous[at]) {
            path.push(at);
        }
        path.reverse();
        return path;
    };
    const startNode = 50;
    const endNode = 100;
    const shortestPath = dijkstra(startNode, endNode);
    return shortestPath;
}

const ModelViewer = () => {
    const [graph, setGraph] = useState(null);
    const [model, setModel] = useState(null); // State to hold the original model
    const [path, setPath] = useState(null);
    
    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(
            '/airplane/scene.gltf',
            (gltf) => {
                const graph_ = parseGltf(gltf);
                setGraph(graph_);
                const path_ = pathfinder(graph_.nodes);
                setPath(path_);
                
                // Traverse the model to modify its materials
                gltf.scene.traverse((node) => {
                    if (node.isMesh) {
                        node.material = new THREE.MeshLambertMaterial({
                            color: 0xffffff, // Set color to white
                            transparent: true,
                            opacity: 0.5, // Set desired opacity
                        });
                    }
                });
                
                setModel(gltf.scene); // Set the original model
            }
        );
    }, []);
    
    useEffect(() => {
        if (graph && model) {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            // Initialize OrbitControls
            const controls = new OrbitControls(camera, renderer.domElement);

            // Add lights to the scene
            const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(5, 5, 5).normalize();
            scene.add(directionalLight);

            // Add the original model to the scene
            scene.add(model);

            // Add spheres to the scene
            for (const node of graph.nodes) {
                const geometry = new THREE.SphereGeometry(0.02, 32, 32);  // Use sphereRadius variable here
                const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.copy(node.position);
                scene.add(sphere);
            }

            // Add edges to the scene
            for (const edge of graph.edges) {
                const geometry = new THREE.BufferGeometry().setFromPoints([edge.start, edge.end]);
                const material = new THREE.LineBasicMaterial({ color: 0xff00ff });
                const line = new THREE.Line(geometry, material);
                scene.add(line);
            }

            for (let i = 0; i < path.length - 1; i++) {
                const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
                const geometry = new THREE.BufferGeometry().setFromPoints([
                    graph.nodes[path[i]].position,
                    graph.nodes[path[i + 1]].position
                ]);
                const line = new THREE.Line(geometry, material);
                scene.add(line);
            }
    
            camera.position.z = 5;
    
            const animate = () => {
                requestAnimationFrame(animate);
                controls.update();  // Update controls
                renderer.render(scene, camera);
            };
    
            animate();
        }

    }, [graph, model]);

    return null;
}

export default ModelViewer;
