// Target Practice 3D - Three.js Game
class TargetPractice3D {
    constructor() {
        // Configurações do jogo
        this.gameWidth = 20;
        this.gameHeight = 15;
        this.gameDepth = 10;
        this.gameTime = 60;
        this.spawnInterval = 1500;
        
        // Configurações de dificuldade
        this.difficulty = 'easy';
        this.difficultySettings = {
            easy: {
                gameTime: 90,
                spawnInterval: 2000,
                speedMultiplier: 1,
                penaltyChance: 0.03,
                complexTargetChance: 0.1,
                obstacles: {
                    boxes: 4,
                    cylinders: 3,
                    spheres: 2,
                    cones: 2,
                    torus: 1
                }
            },
            medium: {
                gameTime: 60,
                spawnInterval: 1500,
                speedMultiplier: 1.5,
                penaltyChance: 0.05,
                complexTargetChance: 0.2,
                obstacles: {
                    boxes: 6,
                    cylinders: 4,
                    spheres: 3,
                    cones: 3,
                    torus: 2
                }
            },
            hard: {
                gameTime: 45,
                spawnInterval: 1000,
                speedMultiplier: 2,
                penaltyChance: 0.08,
                complexTargetChance: 0.3,
                obstacles: {
                    boxes: 8,
                    cylinders: 6,
                    spheres: 4,
                    cones: 5,
                    torus: 3
                }
            }
        };
        
        this.gameState = 'menu'; // menu, playing, gameOver
        this.score = 0;
        this.targetsHit = 0;
        this.targetsTotal = 0;
        this.shotsTotal = 0;
        this.gameTime = 60;
        this.timeLeft = this.gameTime;
        
        // Arrays de objetos
        this.targets = [];
        this.movingTargets = [];
        this.decorativeObjects = [];
        this.allSceneObjects = []; // Novo array para todos os objetos clicáveis
        
        // Raycaster para detecção de clique
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Timers
        this.gameTimer = null;
        this.spawnTimer = null;
        
        // Inicializar
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Configurar canvas
        this.canvas = document.getElementById("game-canvas");
        
        // Criar cena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
        
        // Configurar câmera ortográfica
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 20;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            1,
            1000
        );
        this.camera.position.set(0, 0, 30);
        this.camera.lookAt(0, 0, 0);

        // Configurar renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Configurar iluminação
        this.setupLighting();
        
        // Criar objetos do jogo
        this.createGameObjects();
    }
    
    setupLighting() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Luz direcional principal
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(15, 15, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;
        this.scene.add(directionalLight);
        
        // Luz pontual colorida
        const pointLight = new THREE.PointLight(0x00aaff, 0.6, 50);
        pointLight.position.set(-10, 10, 15);
        this.scene.add(pointLight);
        
        // Luz spot para efeito dramático
        const spotLight = new THREE.SpotLight(0xffaa00, 0.7, 40, Math.PI / 8, 0.1);
        spotLight.position.set(10, -10, 20);
        spotLight.target.position.set(0, 0, 0);
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
    }
    
    createGameObjects() {
        // Criar elementos decorativos
        this.createDecorations();
        
        // Criar modelo 3D simples (substituindo modelo externo)
        this.createSimpleModel();
    }
    
    createDecorations() {
        // Limpar obstáculos existentes
        this.decorativeObjects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.decorativeObjects = [];
        
        // Obter configurações de obstáculos baseadas na dificuldade
        const settings = this.difficultySettings[this.difficulty];
        const obstacles = settings.obstacles;
        
        // Criar obstáculos/decorações usando diferentes geometrias
        
        // Caixas decorativas
        const boxGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        
        for (let i = 0; i < obstacles.boxes; i++) {
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            this.randomizeObjectPosition(box);
            box.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            box.castShadow = true;
            box.userData = { isObstacle: true }; // Adiciona userData
            this.scene.add(box);
            this.decorativeObjects.push(box);
            this.allSceneObjects.push(box);
        }
        
        // Cilindros decorativos
        const cylinderGeometry = new THREE.CylinderGeometry(0.4, 0.4, 2.5, 8);
        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        
        for (let i = 0; i < obstacles.cylinders; i++) {
            const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            this.randomizeObjectPosition(cylinder);
            cylinder.castShadow = true;
            cylinder.userData = { isObstacle: true }; // Adiciona userData
            this.scene.add(cylinder);
            this.decorativeObjects.push(cylinder);
            this.allSceneObjects.push(cylinder);
        }
        
        // Esferas decorativas
        const sphereGeometry = new THREE.SphereGeometry(0.7, 12, 12);
        const sphereMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            transparent: true,
            opacity: 0.7
        });
        
        for (let i = 0; i < obstacles.spheres; i++) {
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            this.randomizeObjectPosition(sphere);
            sphere.castShadow = true;
            sphere.userData = { isObstacle: true }; // Adiciona userData
            this.scene.add(sphere);
            this.decorativeObjects.push(sphere);
            this.allSceneObjects.push(sphere);
        }
        
        // Cones decorativos
        const coneGeometry = new THREE.ConeGeometry(0.6, 1.8, 8);
        const coneMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
        
        for (let i = 0; i < obstacles.cones; i++) {
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            this.randomizeObjectPosition(cone);
            cone.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            cone.castShadow = true;
            cone.userData = { isObstacle: true }; // Adiciona userData
            this.scene.add(cone);
            this.decorativeObjects.push(cone);
            this.allSceneObjects.push(cone);
        }
        
        // Torus decorativos
        const torusGeometry = new THREE.TorusGeometry(0.8, 0.25, 8, 16);
        const torusMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x777777,
            emissive: 0x111111
        });
        
        for (let i = 0; i < obstacles.torus; i++) {
            const torus = new THREE.Mesh(torusGeometry, torusMaterial);
            this.randomizeObjectPosition(torus);
            torus.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            torus.castShadow = true;
            torus.userData = { isObstacle: true }; // Adiciona userData
            this.scene.add(torus);
            this.decorativeObjects.push(torus);
            this.allSceneObjects.push(torus);
        }
    }
    
    createSimpleModel() {
        // Criar um modelo abstrato (icosaedro) como substituto do modelo externo
        const icosahedronGeometry = new THREE.IcosahedronGeometry(1.5);
        const icosahedronMaterial = new THREE.MeshPhongMaterial({
            color: 0xff6600,
            emissive: 0x331100,
            shininess: 100
        });
        this.simpleModel = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
        this.simpleModel.position.set(0, 8, -5);
        this.simpleModel.castShadow = true;
        this.simpleModel.userData = { isObstacle: true }; // Adiciona userData
        this.scene.add(this.simpleModel);
        this.allSceneObjects.push(this.simpleModel);
    }
    
    randomizeObjectPosition(object) {
        object.position.set(
            (Math.random() - 0.5) * this.gameWidth * 1.2,
            (Math.random() - 0.5) * this.gameHeight * 1.0,
            (Math.random() - 0.5) * this.gameDepth * 0.8
        );
    }
    
    randomizeAllDecorations() {
        this.decorativeObjects.forEach(obj => {
            this.randomizeObjectPosition(obj);
            // Também randomizar rotação para mais variedade
            obj.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
        });
    }
    
    createTarget(type = 'normal') {
        let geometry, material, points, speed, movementPattern = 'linear';
        
        switch(type) {
            case 'golden':
                geometry = new THREE.SphereGeometry(1, 12, 12);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0xffd700,
                    emissive: 0x443300,
                    shininess: 150
                });
                points = 50;
                speed = 0;
                break;
                
            case 'moving':
                geometry = new THREE.OctahedronGeometry(1);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0x00ff44,
                    emissive: 0x003311,
                    shininess: 120
                });
                points = 100;
                speed = 0.02;
                break;
                
            case 'circular':
                geometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 8);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0x0088ff,
                    emissive: 0x002244,
                    shininess: 120
                });
                points = 150;
                speed = 0.03;
                movementPattern = 'circular';
                break;
                
            case 'sine':
                geometry = new THREE.DodecahedronGeometry(1);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0xaa44ff,
                    emissive: 0x221144,
                    shininess: 120
                });
                points = 200;
                speed = 0.025;
                movementPattern = 'sine';
                break;
                
            case 'penalty':
                geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0x000000,
                    emissive: 0x440000,
                    shininess: 50
                });
                points = -50; // Pontos negativos
                speed = 0.01;
                movementPattern = 'erratic';
                break;
                
            default: // normal
                geometry = new THREE.SphereGeometry(1, 12, 12);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0xff4444,
                    emissive: 0x331111,
                    shininess: 100
                });
                points = 10;
        }
        
        const target = new THREE.Mesh(geometry, material);
        target.position.set(
            (Math.random() - 0.5) * this.gameWidth * 0.8,
            (Math.random() - 0.5) * this.gameHeight * 0.6,
            (Math.random() - 0.5) * this.gameDepth * 0.4
        );
        target.castShadow = true;
        target.userData.isObstacle = false; // Garante que alvos não são obstáculos
        
        // Aplicar multiplicador de velocidade baseado na dificuldade
        const settings = this.difficultySettings[this.difficulty];
        const adjustedSpeed = speed * settings.speedMultiplier;
        
        target.userData = { 
            points: points, 
            speed: adjustedSpeed,
            movementPattern: movementPattern,
            time: 0,
            centerPosition: target.position.clone(),
            radius: Math.random() * 3 + 2,
            direction: new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize()
        };
        
        this.scene.add(target);
        this.targets.push(target);
        this.targetsTotal++;
        this.allSceneObjects.push(target); // Adiciona o alvo à lista de todos os objetos
        
        if (type === 'moving' || type === 'circular' || type === 'sine') {
            this.movingTargets.push(target);
        }
        
        // Remover alvo após um tempo
        let targetLifetime = 5000 + Math.random() * 3000; // Padrão
        if (this.difficulty === 'hard' && !target.userData.isObstacle) {
            targetLifetime = 1000; // 1 segundo para todos os alvos (não obstáculos) na dificuldade difícil
        }

        setTimeout(() => {
            this.removeTarget(target);
        }, targetLifetime);
    }
    
    removeTarget(target) {
        const index = this.targets.indexOf(target);
        if (index > -1) {
            this.targets.splice(index, 1);
            this.scene.remove(target);
        }
        
        const movingIndex = this.movingTargets.indexOf(target);
        if (movingIndex > -1) {
            this.movingTargets.splice(movingIndex, 1);
        }
    }
    
    setupEventListeners() {
        // Eventos de mouse
        this.canvas.addEventListener('click', (event) => {
            if (this.gameState === 'playing') {
                this.handleClick(event);
            }
        });
        
        this.canvas.addEventListener('mousemove', (event) => {
            this.updateMousePosition(event);
        });
        
        // Botões da interface
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restartGame();
            });
        }
        
        // Event listeners para dificuldade
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectDifficulty(e.target.dataset.difficulty);
            });
        });
        
        // Botão de sair para lobby
        const exitBtn = document.getElementById('exit-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                this.exitToLobby();
            });
        }
        
        // Redimensionamento da janela
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }
    
    selectDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        // Atualizar botões ativos
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const selectedBtn = document.querySelector(`[data-difficulty="${difficulty}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
        
        // Atualizar descrição
        const descriptions = {
            easy: 'Fácil: 90s, alvos lentos, poucos obstáculos',
            medium: 'Médio: 60s, alvos normais, obstáculos moderados',
            hard: 'Difícil: 45s, alvos rápidos, muitos obstáculos'
        };
        
        const descElement = document.getElementById('difficulty-description');
        if (descElement) {
            descElement.textContent = descriptions[difficulty];
        }
        
        // Recriar obstáculos baseados na nova dificuldade
        this.createDecorations();
    }
    
    exitToLobby() {
        // Parar o jogo atual
        this.gameState = 'menu';
        
        // Limpar timers
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
            this.spawnTimer = null;
        }
        
        // Limpar alvos
        this.targets.forEach(target => {
            this.scene.remove(target);
        });
        this.targets = [];
        this.movingTargets = [];
        
        // Esconder elementos do jogo
        const exitBtn = document.getElementById('exit-btn');
        if (exitBtn) exitBtn.classList.add('hidden');
        
        const gameOver = document.getElementById('game-over');
        if (gameOver) gameOver.classList.add('hidden');
        
        // Mostrar lobby
        const instructions = document.getElementById('instructions');
        if (instructions) instructions.classList.remove('hidden');
        
        // Randomizar obstáculos
        this.randomizeAllDecorations();
        
        // Resetar UI
        this.score = 0;
        this.targetsHit = 0;
        this.targetsTotal = 0;
        this.shotsTotal = 0;
        this.timeLeft = 0;
        this.updateUI();
        
        console.log('Voltou para o lobby');
    }
    
    updateMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    handleClick(event) {
        this.shotsTotal++;
        
        // Configurar raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Verificar intersecções com todos os objetos na cena
        const intersects = this.raycaster.intersectObjects(this.allSceneObjects);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            
            if (clickedObject.userData.isObstacle && !this.targets.includes(clickedObject)) {
                // Clicou em um obstáculo (que não é um alvo), perde 1 ponto
                this.score -= 1;
                this.updateUI();
                this.showPenaltyEffect(event, -1, 0); // Mostrar efeito de -1 ponto, sem redução de tempo
            } else if (this.targets.includes(clickedObject)) {
                // Clicou em um alvo (pode ser normal ou de penalidade)
                this.hitTarget(clickedObject, event);
            }
        }
    }
    
    hitTarget(target, event) {
        const points = target.userData.points;
        
        if (points < 0) {
            // Alvo penalidade
            this.score += points; // Subtrai pontos
            this.timeLeft = Math.max(0, this.timeLeft - 5); // Reduz 5 segundos
            
            // Efeito visual negativo
            this.showPenaltyEffect(event, points, 5); // Passa 5 para timeReduction
            
            // Efeito de tela vermelha
            this.showScreenEffect("penalty");
        } else {
            // Alvo normal
            this.score += points;
            this.targetsHit++;
            
            // Efeito visual de hit
            this.showHitEffect(event, points);
        }
        
        // Remover alvo
        this.removeTarget(target);
        
        // Atualizar UI
        this.updateUI();
    }
    
    showPenaltyEffect(event, points, timeReduction = 5) {
        const penaltyEffect = document.createElement("div");
        penaltyEffect.className = "penalty-effect";
        let textContent = `${points}pts`;
        if (timeReduction > 0) {
            textContent += ` (-${timeReduction}s)`;
        }
        penaltyEffect.textContent = textContent;
        penaltyEffect.style.left = event.clientX + "px";
        penaltyEffect.style.top = event.clientY + "px";
        penaltyEffect.style.position = "fixed";
        penaltyEffect.style.color = "#ff0000";
        penaltyEffect.style.fontSize = "20px";
        penaltyEffect.style.fontWeight = "bold";
        penaltyEffect.style.pointerEvents = "none";
        penaltyEffect.style.zIndex = "1000";
        penaltyEffect.style.animation = "fadeOut 1s ease-out forwards";
        
        document.body.appendChild(penaltyEffect);
        
        setTimeout(() => {
            if (document.body.contains(penaltyEffect)) {
                document.body.removeChild(penaltyEffect);
            }
        }, 1000);
    }
    
    showScreenEffect(type) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '999';
        
        if (type === 'penalty') {
            overlay.style.background = 'rgba(255, 0, 0, 0.3)';
        }
        
        overlay.style.animation = 'flashEffect 0.5s ease-out forwards';
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 500);
    }
    
    showHitEffect(event, points) {
        const hitEffect = document.createElement('div');
        hitEffect.className = 'hit-effect';
        hitEffect.textContent = `+${points}`;
        hitEffect.style.left = event.clientX + 'px';
        hitEffect.style.top = event.clientY + 'px';
        hitEffect.style.position = 'fixed';
        hitEffect.style.color = '#00ff00';
        hitEffect.style.fontSize = '20px';
        hitEffect.style.fontWeight = 'bold';
        hitEffect.style.pointerEvents = 'none';
        hitEffect.style.zIndex = '1000';
        hitEffect.style.animation = 'fadeOut 1s ease-out forwards';
        
        document.body.appendChild(hitEffect);
        
        setTimeout(() => {
            if (document.body.contains(hitEffect)) {
                document.body.removeChild(hitEffect);
            }
        }, 1000);
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.targetsHit = 0;
        this.targetsTotal = 0;
        this.shotsTotal = 0;
        
        // Aplicar configurações de dificuldade
        const settings = this.difficultySettings[this.difficulty];
        this.timeLeft = settings.gameTime;
        
        // Recriar obstáculos baseados na dificuldade selecionada
        this.createDecorations();
        
        // Esconder menu
        const instructions = document.getElementById('instructions');
        if (instructions) instructions.classList.add('hidden');
        
        // Mostrar botão de sair
        const exitBtn = document.getElementById('exit-btn');
        if (exitBtn) exitBtn.classList.remove('hidden');
        
        // Iniciar timers
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                this.endGame();
            }
            this.updateUI();
        }, 1000);
        
        this.spawnTimer = setInterval(() => {
            this.spawnRandomTarget();
        }, settings.spawnInterval);
        
        this.updateUI();
    }
    
    spawnRandomTarget() {
        if (this.gameState !== 'playing') return;
        
        const settings = this.difficultySettings[this.difficulty];
        const rand = Math.random();
        let type = 'normal';
        
        if (rand < settings.penaltyChance) {
            type = 'penalty';
        } else if (rand < settings.penaltyChance + settings.complexTargetChance * 0.2) {
            type = 'golden';
        } else if (rand < settings.penaltyChance + settings.complexTargetChance * 0.4) {
            type = 'moving';
        } else if (rand < settings.penaltyChance + settings.complexTargetChance * 0.7) {
            type = 'circular';
        } else if (rand < settings.penaltyChance + settings.complexTargetChance) {
            type = 'sine';
        }
        
        this.createTarget(type);
    }
    
    endGame() {
        this.gameState = 'gameOver';
        
        // Parar timers
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
            this.spawnTimer = null;
        }
        
        // Limpar alvos
        this.targets.forEach(target => {
            this.scene.remove(target);
        });
        this.targets = [];
        this.movingTargets = [];
        
        // Mostrar tela de fim de jogo
        const accuracy = this.shotsTotal > 0 ? Math.round((this.targetsHit / this.shotsTotal) * 100) : 0;
        
        const finalScoreElement = document.getElementById('final-score');
        if (finalScoreElement) finalScoreElement.textContent = this.score;
        
        const accuracyElement = document.getElementById('accuracy');
        if (accuracyElement) accuracyElement.textContent = accuracy;
        
        const gameOverElement = document.getElementById('game-over');
        if (gameOverElement) gameOverElement.classList.remove('hidden');
    }
    
    restartGame() {
        const gameOverElement = document.getElementById('game-over');
        if (gameOverElement) gameOverElement.classList.add('hidden');
        
        const instructionsElement = document.getElementById('instructions');
        if (instructionsElement) instructionsElement.classList.remove('hidden');
        
        this.gameState = 'menu';
        
        // Randomizar posições dos obstáculos para uma nova experiência
        this.randomizeAllDecorations();
    }
    
    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 20;
        
        this.camera.left = frustumSize * aspect / -2;
        this.camera.right = frustumSize * aspect / 2;
        this.camera.top = frustumSize / 2;
        this.camera.bottom = frustumSize / -2;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    updateGame() {
        this.movingTargets.forEach(target => {
            if (target.userData.speed > 0) {
                target.userData.time += 0.016; // ~60fps
                
                switch(target.userData.movementPattern) {
                    case 'linear':
                        // Movimento linear simples
                        target.position.x += target.userData.direction.x * target.userData.speed;
                        target.position.y += target.userData.direction.y * target.userData.speed;
                        target.position.z += target.userData.direction.z * target.userData.speed;
                        break;
                        
                    case 'circular':
                        // Movimento circular
                        const circularTime = target.userData.time * target.userData.speed * 2;
                        target.position.x = target.userData.centerPosition.x + Math.cos(circularTime) * target.userData.radius;
                        target.position.y = target.userData.centerPosition.y + Math.sin(circularTime) * target.userData.radius;
                        target.position.z = target.userData.centerPosition.z + Math.sin(circularTime * 0.5) * 1;
                        target.rotation.y += target.userData.speed * 3;
                        break;
                        
                    case 'sine':
                        // Movimento senoidal
                        const sineTime = target.userData.time * target.userData.speed * 3;
                        target.position.x = target.userData.centerPosition.x + Math.sin(sineTime) * target.userData.radius;
                        target.position.y = target.userData.centerPosition.y + Math.sin(sineTime * 1.5) * (target.userData.radius * 0.7);
                        target.position.z = target.userData.centerPosition.z + Math.cos(sineTime * 0.8) * 2;
                        target.rotation.x += target.userData.speed * 2;
                        target.rotation.y += target.userData.speed * 1.5;
                        target.rotation.z += target.userData.speed * 2.5;
                        break;
                        
                    case 'erratic':
                        // Movimento errático (mudança aleatória de direção)
                        if (Math.random() < 0.1) { // 10% chance de mudar direção
                            target.userData.direction.set(
                                (Math.random() - 0.5) * 2,
                                (Math.random() - 0.5) * 2,
                                (Math.random() - 0.5) * 2
                            ).normalize();
                        }
                        target.position.add(target.userData.direction.clone().multiplyScalar(target.userData.speed));
                        target.rotation.x += target.userData.speed * 4;
                        target.rotation.y += target.userData.speed * 3;
                        target.rotation.z += target.userData.speed * 2;
                        break;
                        
                    default: // linear movement
                        target.position.add(target.userData.direction.clone().multiplyScalar(target.userData.speed));
                        target.rotation.x += target.userData.speed * 2;
                        target.rotation.y += target.userData.speed * 1.5;
                }
                
                // Verificar limites e reposicionar se necessário
                if (Math.abs(target.position.x) > this.gameWidth/2 || 
                    Math.abs(target.position.y) > this.gameHeight/2 || 
                    Math.abs(target.position.z) > this.gameDepth/2) {
                    
                    if (target.userData.movementPattern === 'circular' || target.userData.movementPattern === 'sine') {
                        // Reposicionar centro do movimento circular/senoidal
                        target.userData.centerPosition.set(
                            (Math.random() - 0.5) * this.gameWidth * 0.6,
                            (Math.random() - 0.5) * this.gameHeight * 0.4,
                            (Math.random() - 0.5) * this.gameDepth * 0.3
                        );
                        target.userData.time = 0; // Reset time
                    } else {
                        // Inverter direção para outros tipos
                        target.userData.direction.multiplyScalar(-1);
                    }
                }
            }
        });
        
        // Animar todos os alvos (rotação)
        this.targets.forEach(target => {
            target.rotation.x += 0.02;
            target.rotation.y += 0.03;
        });
        
        // Animar objetos decorativos
        this.decorativeObjects.forEach((obj, index) => {
            obj.rotation.y += 0.01 * (index % 2 === 0 ? 1 : -1);
        });
        
        // Animar modelo simples
        if (this.simpleModel) {
            this.simpleModel.rotation.x += 0.02;
            this.simpleModel.rotation.y += 0.01;
        }
    }
    
    updateUI() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) scoreElement.textContent = this.score;
        
        const targetsHitElement = document.getElementById('targets-hit');
        if (targetsHitElement) targetsHitElement.textContent = this.targetsHit;
        
        const targetsTotalElement = document.getElementById('targets-total');
        if (targetsTotalElement) targetsTotalElement.textContent = this.targetsTotal;
        
        const timeElement = document.getElementById('time');
        if (timeElement) timeElement.textContent = this.timeLeft;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateGame();
        this.renderer.render(this.scene, this.camera);
    }
}

// Inicializar o jogo quando a página carregar
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        window.game = new TargetPractice3D();
    });
} else {
    window.game = new TargetPractice3D();
}

