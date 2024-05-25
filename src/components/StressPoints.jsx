import React, { useEffect, useState } from 'react';
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/TransformControls.js';
import data from './data';

const parseGltf = (gltf) => {
    const graph = { nodes: [], edges: [] };
    const proximityThreshold = 0.25; 
    gltf.scene.traverse((node) => {
        if (node.isMesh) {
            const position = new THREE.Vector3();
            node.getWorldPosition(position);
            const id = ((position.x).toString() + (position.y).toString() + (position.z).toString());
            let isClose = false;
            for (const existingNode of graph.nodes) {
                if (position.distanceTo(existingNode.position) < proximityThreshold) {
                    isClose = true;
                    break;
                }
            }
            if (!isClose) {
                graph.nodes.push({
                    id: node.uuid,
                    position: position.clone(),
                    info_id: id
                });
            }
        }
    });

    return graph;
};

const ModelViewer = () => {
    const [graph, setGraph] = useState(null);
    const [model, setModel] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [nodeInfo] = useState(data);

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
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            // Add grey-black gradient background
            const gradientBackground = document.createElement('style');
            gradientBackground.innerHTML = `
                body {
                    margin: 0;
                    overflow: hidden;
                    background: linear-gradient(to bottom, grey, black);
                }
            `;
            document.head.appendChild(gradientBackground);

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
                const geometry = new THREE.SphereGeometry(0.05, 32, 32);
                const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.copy(node.position);
                sphere.userData = { id: node.id, info_id: node.info_id };
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
                    setSelectedNode(selectedSphere.userData.info_id); // Set selected node id
                    setIsVisible(true); // Make modal visible
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

    const modalStyles = {
        modalContainer: {
            maxHeight: '300px',
            maxWidth: '400px',
            position: 'fixed',
            top: '10px',
            right: '10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            fontFamily: 'Arial, sans-serif',
            color: '#333',
            animation: 'fadeIn 0.5s ease-in-out', // Add animation
        },
        modalContainerHeader: {
            padding: '12px 24px',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#750550',
            color: '#fff',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
        },
        modalContainerTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            lineHeight: '1',
            fontWeight: '700',
            fontSize: '1rem',
        },
        modalContainerTitleSvg: {
            width: '24px',
            height: '24px',
            color: '#fff',
        },
        modalContainerBody: {
            padding: '16px 24px',
            overflowY: 'auto',
            flex: '1',
        },
        modalContainerFooter: {
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderTop: '1px solid #ddd',
            gap: '8px',
            backgroundColor: '#f1f1f1',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
        },
        button: {
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: '#750550',
            color: '#fff',
            border: '0',
            fontWeight: '600',
            cursor: 'pointer',
            transition: '0.15s ease',
        },
        buttonPrimary: {
            backgroundColor: '#750550',
            color: '#fff',
        },
        buttonPrimaryHover: {
            backgroundColor: '#4a0433',
        },
        iconButton: {
            padding: '0',
            border: '0',
            backgroundColor: 'transparent',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: '0.15s ease',
        },
        iconButtonHover: {
            backgroundColor: '#dfdad7',
        },
    };

    return (
        <>
            {isVisible && selectedNode && (
                <div className="fade-in" style={modalStyles.modalContainer}>
                    <article style={modalStyles.modalContainer}>
                        <header style={modalStyles.modalContainerHeader}>
                            <span style={modalStyles.modalContainerTitle}>
                                <svg aria-hidden="true" height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={modalStyles.modalContainerTitleSvg}>
                                    <path d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M14 9V4H5v16h6.056c.328.417.724.785 1.18 1.085l1.39.915H3.993A.993.993 0 0 1 3 21.008V2.992C3 2.455 3.449 2 4.002 2h10.995L21 8v1h-7zm-2 2h9v5.949c0 .99-.501 1.916-1.336 2.465L16.5 21.498l-3.164-2.084A2.953 2.953 0 0 1 12 16.95V11zm2 5.949c0 .316.162.614.436.795l2.064 1.36 2.064-1.36a.954.954 0 0 0 .436-.795V13h-5v3.949z" fill="currentColor"></path>
                                </svg>
                                {data[selectedNode].title}
                            </span>
                            <button style={modalStyles.iconButton} onClick={() => setIsVisible(false)}>
                                <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="currentColor"></path>
                                </svg>
                            </button>
                        </header>
                        <section style={modalStyles.modalContainerBody}>
                            <p>{data[selectedNode].data}</p>
                        </section>
                        <footer style={modalStyles.modalContainerFooter}>
                        <a href="https://www.airbus.com/en/products-services/commercial-aircraft/the-life-cycle-of-an-aircraft/design" target="_blank" style={{ ...modalStyles.button, ...modalStyles.buttonPrimary }}>Know More</a>
                        </footer>
                    </article>
                </div>
            )}
        </>
    );
};

export default ModelViewer;
