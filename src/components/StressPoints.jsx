import React, { useEffect, useState } from 'react';
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/TransformControls.js';

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

    return graph;
};

const ModelViewer = () => {
    const [graph, setGraph] = useState(null);
    const [model, setModel] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [nodeInfo] = useState({
        'node1': "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        'node2': "Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.",
        'node3': "Sed nisi. Nulla quis sem at nibh elementum imperdiet.",
    });

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(
            '/airplane/scene.gltf',
            (gltf) => {
                const graph_ = parseGltf(gltf);
                setGraph(graph_);

                gltf.scene.traverse((node) => {
                    if (node.isMesh) {
                        node.material = new THREE.MeshLambertMaterial({
                            color: 0xffffff,
                            transparent: true,
                            opacity: 0.5,
                        });
                    }
                });

                setModel(gltf.scene);
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

            // Initialize OrbitControls and TransformControls
            const controls = new OrbitControls(camera, renderer.domElement);
            const transformControls = new TransformControls(camera, renderer.domElement);
            scene.add(transformControls);

            controls.addEventListener('change', () => {
                renderer.render(scene, camera);
            });
            transformControls.addEventListener('change', () => {
                renderer.render(scene, camera);
            });

            // Add lights to the scene
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(5, 5, 5).normalize();
            scene.add(directionalLight);

            // Create a group to contain the model and the spheres
            const group = new THREE.Group();
            group.add(model);

            // Add spheres to the group
            const spheres = [];
            for (const node of graph.nodes) {
                const geometry = new THREE.SphereGeometry(0.02, 32, 32);
                const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.copy(node.position);
                sphere.userData = { id: node.id };
                spheres.push(sphere);
                group.add(sphere);
            }

            // Add the group to the scene
            scene.add(group);
            transformControls.attach(group);

            // Add event listener for clicking on spheres
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            const onMouseClick = (event) => {
                event.preventDefault();
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(spheres);
                if (intersects.length > 0) {
                    const selectedSphere = intersects[0].object;
                    spheres.forEach(s => {
                        s.material.color.set(0xffff00); // Reset color of all spheres
                        s.scale.set(1, 1, 1); // Reset size of all spheres
                    });
                    selectedSphere.material.color.set(0xff0000); // Change color to red
                    selectedSphere.scale.set(1.5, 1.5, 1.5); // Increase size
                    setSelectedNode(selectedSphere.userData.id); // Set selected node id
                }
            };

            window.addEventListener('click', onMouseClick);

            camera.position.z = 5;

            const animate = () => {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };

            animate();

            // Clean up event listener on component unmount
            return () => {
                window.removeEventListener('click', onMouseClick);
                document.body.removeChild(renderer.domElement);
            };
        }
    }, [graph, model]);

    return (
        <div>
            {selectedNode && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'white', padding: '10px', border: '1px solid black' }}>
                    <h3>Node Information</h3>
                    <p>{nodeInfo[selectedNode] || `Node ID: ${selectedNode}`}</p>
                </div>
            )}
        </div>
    );
};

export default ModelViewer;
