const initThreeJS = () => {
    const canvas = document.getElementById('three-canvas');
    // Get the actual game canvas dimensions from the 2D game
    const gameCanvas = document.getElementById('canvas');
    
    // We wait until the canvas has actual dimensions set by the game
    const updateSize = () => {
        const width = gameCanvas.clientWidth || window.innerWidth;
        const height = gameCanvas.clientHeight || window.innerHeight;
        
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        camera.left = width / -2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        
        return { width, height };
    };

    const scene = new THREE.Scene();
    
    // Orthographic camera for 1:1 pixel mapping with 2D canvas
    const camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0.1, 1000 );
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); // Transparent

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    let mixer;
    let lastRaikuX = 0;
    let raikuFacingRight = true; // track facing direction
    let raikuModel;

    const loader = new THREE.GLTFLoader();
    loader.load('./assets/raiku_fly.glb', (gltf) => {
        raikuModel = gltf.scene;
        
        // Scale and rotation adjustments
        raikuModel.scale.set(0.35, 0.35, 0.35); 
        raikuModel.rotation.y = Math.PI; // Face forward/camera (adjust if backwards)
        
        raikuModel.traverse(child => {
            if (child.isMesh) {
                child.material.wireframe = true;
                child.material.color.set(0xccff00);
                child.material.emissive = new THREE.Color(0xccff00);
                child.material.emissiveIntensity = 1.0;
            }
        });

        scene.add(raikuModel);

        if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(raikuModel);
            mixer.clipAction(gltf.animations[0]).play();
        }
    });

    const clock = new THREE.Clock();
    let size = { width: 1, height: 1 };

    const animate = () => {
        requestAnimationFrame(animate);
        const dt = clock.getDelta();
        if (mixer) mixer.update(dt);
        
        if (gameCanvas.clientWidth > 0 && size.width !== gameCanvas.clientWidth) {
            size = updateSize();
        }

        // Sync with cooljs game engine
        if (window.game && raikuModel) {
            const hook = window.game.getInstance('hook');
            const block = window.game.getInstance('block_0') || window.game.getInstance(`block_${window.game.getVariable('BLOCK_COUNT')}`);
            
            let targetX = window.game.width / 2;
            let targetY = window.game.height * 0.4 * 0.5; // Default hook y (ropeHeight * 0.5)

            if (block && block.status === 'SWING') {
                targetX = block.weightX;
                // Raiku grabs the top center of the block
                targetY = block.weightY + block.height * 0.3;
            } else if (hook && hook.ready) {
                targetX = hook.x;
                targetY = hook.y;
            }
            
            // Map 2D logical coordinates to 3D CSS coordinates
            const scaleX = size.width / window.game.width;
            const scaleY = size.height / window.game.height;
            
            const mappedTargetX = targetX * scaleX;
            const mappedTargetY = targetY * scaleY;
            
            // Map to 3D center origin
            const threeX = mappedTargetX - (size.width / 2);
            const threeY = -(mappedTargetY - (size.height / 2));
            
            // Smoothly move Raiku to target
            const dx = threeX - raikuModel.position.x;
            raikuModel.position.x += dx * 0.3;
            raikuModel.position.y += ((threeY + 20) - raikuModel.position.y) * 0.3;

            // Determine facing direction based on movement
            if (Math.abs(dx) > 0.5) {
                raikuFacingRight = dx > 0;
            }
            // Face right = rotation.y = 0, face left = rotation.y = Math.PI
            const targetRotY = raikuFacingRight ? 0 : Math.PI;
            // Smoothly interpolate rotation
            let rotDiff = targetRotY - raikuModel.rotation.y;
            // Normalize to [-PI, PI]
            while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
            while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
            raikuModel.rotation.y += rotDiff * 0.15;
        }

        renderer.render(scene, camera);
    };

    animate();
    
    window.addEventListener('resize', () => {
        size = updateSize();
    });
};

window.addEventListener('load', initThreeJS);
