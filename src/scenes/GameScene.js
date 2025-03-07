/**
 * GameScene.js
 * Cena principal de jogo para "O Salto da Sobrevivência: Desafio das Dimensões"
 * Implementa a jogabilidade de plataforma, coleta de itens e obstáculos
 */
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  init(data) {
    // Inicializa variáveis do jogo
    this.score = 0;
    this.lives = 3;
    this.coinsCollected = 0;
    this.isInvulnerable = false;
    this.isDashing = false;
    this.canDoubleJump = true;
    this.gameTime = 0;

    // Inicializa cooldowns das habilidades
    this.shieldCooldown = 0;
    this.attackCooldown = 0;
    this.dashCooldown = 0;

    // Pega o nome do jogador (se existir)
    this.playerName = data.playerName || "Jogador";

    // Flag para tutorial de habilidades
    this.shieldTutorialShown = false;
    this.attackTutorialShown = false;
    this.dashTutorialShown = false;
    this.doubleJumpTutorialShown = false;
    this.allTutorialsShown = false;

    // Rastreia o uso das habilidades
    this.hasUsedShield = false;
    this.hasUsedAttack = false;
    this.hasUsedDash = false;
    this.hasUsedDoubleJump = false;

    // Registra a posição inicial do jogador
    this.startPosition = { x: 100, y: 450 };

    // Define a largura do nível (expandido para mais conteúdo)
    this.levelWidth = 6000;

    // Número de moedas necessárias para completar o nível
    this.requiredCoins = 7;
  }

  create() {
    // ===== CONFIGURAÇÃO DO CENÁRIO =====
    // Criamos vários backgrounds para cobrir todo o nível
    this.backgrounds = [];
    for (let i = 0; i < Math.ceil(this.levelWidth / 800); i++) {
      const bg = this.add.tileSprite(i * 800, 300, 1200, 400, "fundo");
      bg.setScale(0.7);
      bg.setScrollFactor(0.5); // Efeito de paralaxe
      this.backgrounds.push(bg);
    }

    // Cria um fundo de céu para evitar o "preto"
    this.skyBackground = this.add.rectangle(0, 0, this.levelWidth * 2, 600, 0x87ceeb);
    this.skyBackground.setOrigin(0, 0);
    this.skyBackground.setDepth(-2);

    // Cria grupos para os elementos do jogo
    this.createGroups();

    // Cria o mapa do nível (plataformas, moedas, obstáculos)
    this.createLevel();

    // ===== PERSONAGEM =====
    // Cria e configura o personagem jogável
    this.createPlayer();

    // ===== CÂMERA =====
    // Configura a câmera para seguir o jogador
    this.cameras.main.setBounds(0, 0, this.levelWidth, 600);
    this.cameras.main.startFollow(this.player);

    // ===== HUD (HEADS-UP DISPLAY) =====
    // Cria a interface do usuário com pontuação, vidas, etc.
    this.createHUD();

    // ===== CONTROLES =====
    // Configura os controles do teclado
    this.createControls();

    // ===== COLISÕES =====
    // Configura as colisões entre os elementos do jogo
    this.createCollisions();

    // ===== EFEITOS ESPECIAIS =====
    // Prepara efeitos visuais como partículas, brilhos, etc.
    this.createEffects();

    // ===== INICIALIZAÇÃO DE TIMERS =====
    // Temporizador para contagem de tempo de jogo
    this.time.addEvent({
      delay: 1000,
      callback: this.updateGameTime,
      callbackScope: this,
      loop: true,
    });

    // ===== NOME DO JOGADOR =====
    // Texto que segue o jogador com seu nome
    this.playerNameText = this.add
      .text(this.player.x, this.player.y - 70, this.playerName, {
        fontFamily: "Arial",
        fontSize: "14px",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Criar os monstros que perseguem o jogador
    this.createPursuingMonsters();

    // ===== ZONAS ESPECIAIS =====
    // Cria diferentes zonas temáticas e recursos adicionais
    this.createSpecialZones();

    // ===== CHECKPOINTS =====
    this.createCheckpoints();

    // ===== RESPAWN DE MOEDAS =====
    // Timer para respawnar moedas periodicamente
    this.time.addEvent({
      delay: 15000, // A cada 15 segundos
      callback: this.respawnCoins,
      callbackScope: this,
      loop: true,
    });

    // ===== TUTORIAL DE HABILIDADES =====
    // Mostra o tutorial das habilidades após alguns segundos
    this.time.delayedCall(3000, this.showDoubleJumpTutorial, [], this);
    this.time.delayedCall(8000, this.showShieldTutorial, [], this);
    this.time.delayedCall(15000, this.showAttackTutorial, [], this);
    this.time.delayedCall(22000, this.showDashTutorial, [], this);

    // Texto de créditos
    this.creditsText = this.add
      .text(400, 580, "Desenvolvido por Richard Alves - Projeto da Semana 4 - Inteli", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    this.creditsText.setScrollFactor(0);
    this.creditsText.setAlpha(0.7);
  }

  update() {
    // Atualiza movimentos e física a cada frame
    this.handlePlayerMovement();

    // Atualiza a posição do nome do jogador para seguir o personagem
    if (this.playerNameText) {
      this.playerNameText.x = this.player.x;
      this.playerNameText.y = this.player.y - 70;
    }

    // Verifica se o jogador caiu para fora da tela
    if (this.player.y > 600) {
      this.playerDie();
    }

    // Atualiza comportamentos de inimigos
    this.updateEnemies();

    // Atualiza efeitos visuais ativos
    this.updateEffects();

    // Atualiza plataformas móveis
    this.updateMovingPlatforms();

    // Atualiza plataformas que desaparecem
    this.updateVanishingPlatforms();

    // Atualiza os cooldowns das habilidades
    this.updateCooldowns();

    // Verifica se todas as habilidades foram usadas e esconde o painel
    this.checkAllAbilitiesUsed();
  }

  // Verifica se o jogador já usou todas as habilidades
  checkAllAbilitiesUsed() {
    if (!this.allTutorialsShown && this.hasUsedShield && this.hasUsedAttack && this.hasUsedDash && this.hasUsedDoubleJump) {
      // Esconde gradualmente o painel de habilidades
      if (this.skillsContainer && this.skillsContainer.visible) {
        this.tweens.add({
          targets: this.skillsContainer,
          y: 650, // Move para fora da tela
          alpha: 0,
          duration: 1000,
          ease: "Power2",
          onComplete: () => {
            // Mostra uma mensagem informativa
            const message = this.add
              .text(400, 550, "Todas as habilidades dominadas! Boa sorte na aventura!", {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: "12px",
                fill: "#00ff00",
                stroke: "#000000",
                strokeThickness: 4,
              })
              .setOrigin(0.5)
              .setScrollFactor(0);

            // Faz a mensagem desaparecer após alguns segundos
            this.tweens.add({
              targets: message,
              alpha: 0,
              delay: 3000,
              duration: 1000,
            });
          },
        });

        this.allTutorialsShown = true;
      }
    }
  }

  // ===== MÉTODOS DE CRIAÇÃO =====

  createGroups() {
    // Grupo de plataformas
    this.platforms = this.physics.add.staticGroup();

    // Grupo de plataformas móveis
    this.movingPlatforms = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // Grupo de plataformas que desaparecem
    this.vanishingPlatforms = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // Grupo de moedas coletáveis
    this.coins = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // Grupo de corações (vidas extras)
    this.hearts = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // Grupo de espinhos (obstáculos)
    this.spikes = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // Grupo de monstros
    this.monsters = this.physics.add.group({
      allowGravity: true,
    });

    // Grupo de monstros perseguidores
    this.pursuingMonsters = this.physics.add.group({
      allowGravity: true,
    });

    // Grupo de power-ups
    this.powerups = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // Grupo de checkpoints
    this.checkpoints = this.physics.add.staticGroup();
  }

  createLevel() {
    // ===== CRIAÇÃO DO CHÃO =====
    // Cria plataformas base (chão)
    for (let i = 0; i < Math.ceil(this.levelWidth / 158); i++) {
      const platform = this.platforms.create(i * 158, 550, "tijolo");
      platform.setScale(1).refreshBody();

      // Adiciona gaps no chão para desafio
      if (i % 10 === 0 && i > 5) {
        platform.visible = false;
        platform.body.enable = false;
      }
    }

    // ===== SEÇÃO 1: Início (0-1500px) =====
    // Plataformas de tutorial básico
    this.createBasicPlatformsSection(0, 1500);

    // ===== SEÇÃO 2: Área de Plataformas que Desaparecem (1500-2500px) =====
    this.createVanishingPlatformsSection(1500, 2500);

    // ===== SEÇÃO 3: Zona de Perigo (2500-3500px) =====
    this.createDangerZone(2500, 3500);

    // ===== SEÇÃO 4: Plataformas Móveis Complexas (3500-4500px) =====
    this.createComplexMovingPlatformsSection(3500, 4500);

    // ===== SEÇÃO 5: Desafio Final e Chefe (4500-5800px) =====
    this.createFinalSection(4500, 5800);

    // ===== SAÍDA =====
    // Cria portal de saída no final do nível com destaque maior
    this.exitPortal = this.physics.add.sprite(this.levelWidth - 200, 350, "brilho");
    this.exitPortal.setScale(1.5); // Aumentado o tamanho
    this.exitPortal.setImmovable(true);
    this.exitPortal.body.allowGravity = false;

    // Adiciona texto de "SAÍDA" acima do portal
    this.exitText = this.add
      .text(this.exitPortal.x, this.exitPortal.y - 80, "SAÍDA", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "18px",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Animação do portal
    this.tweens.add({
      targets: this.exitPortal,
      scale: { from: 1.5, to: 1.8 },
      alpha: { from: 0.7, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });

    // Animação do texto de saída
    this.tweens.add({
      targets: this.exitText,
      y: this.exitPortal.y - 90,
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });
  }

  createBasicPlatformsSection(startX, endX) {
    // Plataformas básicas para tutorial
    const platformPositions = [
      { x: 400, y: 400 },
      { x: 600, y: 350 },
      { x: 800, y: 300 },
      { x: 1000, y: 250 },
      { x: 1200, y: 300 },
      { x: 1400, y: 350 },
    ];

    platformPositions.forEach((pos, index) => {
      // Plataforma móvel a cada 3 plataformas
      if (index % 3 === 0) {
        this.createMovingPlatform(pos.x, pos.y);
      } else {
        const platform = this.platforms.create(pos.x, pos.y, "tijolo");
        platform.setScale(1).refreshBody();

        // Em algumas plataformas, adiciona moedas
        if (Math.random() > 0.3) {
          this.createCoin(pos.x, pos.y - 60);
        }

        // Em algumas plataformas, adiciona espinhos EXATAMENTE no topo
        if (Math.random() > 0.7) {
          // Espinhos bem posicionados agora - calculando o offset exato
          this.createSpike(pos.x, pos.y - platform.height / 2 - 5);
        }
      }
    });

    // Adiciona alguns corações para vidas extras
    this.createHeart(500, 200);
    this.createHeart(1300, 200);
  }

  createVanishingPlatformsSection(startX, endX) {
    // Plataformas que desaparecem quando o jogador pisa nelas
    for (let i = 0; i < 8; i++) {
      const x = startX + 100 + i * 100;
      const y = 400 - (i % 2) * 50;

      this.createVanishingPlatform(x, y);

      // Adiciona moedas em algumas plataformas
      if (i % 2 === 0) {
        this.createCoin(x, y - 60);
      }
    }

    // Aviso sobre plataformas que desaparecem
    const warningText = this.add
      .text(startX + 450, 200, "CUIDADO: PLATAFORMAS INSTÁVEIS!", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        fill: "#ff0000",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Animação do texto de aviso
    this.tweens.add({
      targets: warningText,
      alpha: { from: 1, to: 0.2 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Adiciona um checkpoint antes desta seção
    this.createCheckpoint(startX + 50, 450);
  }

  createDangerZone(startX, endX) {
    // Zona com muitos espinhos e monstros

    // Plataformas em zigue-zague
    for (let i = 0; i < 10; i++) {
      const x = startX + 150 + i * 100;
      const y = 250 + (i % 2) * 100;

      const platform = this.platforms.create(x, y, "tijolo");
      platform.setScale(1).refreshBody();

      // Adiciona espinhos em todas as plataformas desta seção
      this.createSpike(x, y - platform.height / 2 - 5);

      // Adiciona moedas em posições desafiadoras
      if (i % 3 === 0) {
        this.createCoin(x, y - 100);
      }
    }

    // Adiciona muitos monstros nesta área
    for (let i = 0; i < 5; i++) {
      const x = startX + 200 + i * 200;
      this.createMonster(x, 200);
    }

    // Aviso sobre zona perigosa
    const dangerText = this.add
      .text(startX + 500, 150, "ZONA DE PERIGO!", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "20px",
        fill: "#ff0000",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Animação pulsante para o texto
    this.tweens.add({
      targets: dangerText,
      scale: { from: 1, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Adiciona um checkpoint antes desta seção
    this.createCheckpoint(startX + 50, 450);

    // Power-up de invencibilidade temporária
    this.createPowerUp(startX + 500, 200, "shield");
  }

  createComplexMovingPlatformsSection(startX, endX) {
    // Seção com plataformas móveis em padrões complexos

    // Plataformas verticais
    for (let i = 0; i < 3; i++) {
      const x = startX + 200 + i * 300;
      const platform = this.movingPlatforms.create(x, 400, "tijolo");
      platform.setScale(1);
      platform.setImmovable(true);
      platform.body.allowGravity = false;

      // Configuração para movimento vertical
      platform.moveAxis = "y";
      platform.startPos = 400;
      platform.distance = 150;
      platform.speed = 1.5;
      platform.direction = 1;

      // Adiciona moedas em posições estratégicas
      this.createCoin(x, 250);
    }

    // Plataformas circulares
    for (let i = 0; i < 2; i++) {
      const centerX = startX + 500 + i * 400;
      const centerY = 300;
      const radius = 100;

      const platform = this.movingPlatforms.create(centerX + radius, centerY, "tijolo");
      platform.setScale(1);
      platform.setImmovable(true);
      platform.body.allowGravity = false;

      // Configuração para movimento circular
      platform.moveType = "circular";
      platform.centerX = centerX;
      platform.centerY = centerY;
      platform.radius = radius;
      platform.angle = 0;
      platform.speed = 0.02;

      // Adiciona moedas no centro do círculo
      this.createCoin(centerX, centerY);
    }

    // Texto explicativo
    const platformText = this.add
      .text(startX + 400, 150, "DESAFIO DE PLATAFORMAS", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        fill: "#00ffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Adiciona um checkpoint antes desta seção
    this.createCheckpoint(startX + 50, 450);

    // Power-up de super pulo
    this.createPowerUp(startX + 400, 200, "jump");
  }

  createFinalSection(startX, endX) {
    // Área final com desafio mais difícil e boss

    // Plataformas finais
    for (let i = 0; i < 8; i++) {
      const x = startX + 100 + i * 150;
      const y = 400 - Math.abs((i % 5) - 2) * 50;

      const platform = this.platforms.create(x, y, "tijolo");
      platform.setScale(1).refreshBody();

      // Adiciona moedas em todas as plataformas para garantir que o jogador tenha o suficiente
      this.createCoin(x, y - 60);

      // Algumas plataformas têm espinhos
      if (i % 3 === 0) {
        this.createSpike(x, y - platform.height / 2 - 5);
      }
    }

    // Cria o "boss" - um monstro grande e forte
    this.createBoss(startX + 700, 300);

    // Texto de aviso sobre o boss
    const bossText = this.add
      .text(startX + 400, 150, "BOSS FINAL!", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "24px",
        fill: "#ff0000",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Efeito de tremor no texto
    this.time.addEvent({
      delay: 100,
      callback: () => {
        bossText.x = startX + 400 + (Math.random() * 10 - 5);
        bossText.y = 150 + (Math.random() * 6 - 3);
      },
      loop: true,
    });

    // Adiciona um checkpoint antes desta seção
    this.createCheckpoint(startX + 50, 450);

    // Power-up de ataque poderoso
    this.createPowerUp(startX + 300, 200, "attack");
  }

  createPlayer() {
    // Cria o sprite do jogador na posição inicial
    this.player = this.physics.add.sprite(this.startPosition.x, this.startPosition.y, "personagem");
    this.player.setScale(0.5);
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(false);

    // Define a hitbox (colisão) do personagem
    this.player.body.setSize(50, 140);
    this.player.body.setOffset(25, 20);

    // Inicializa power-ups ativos
    this.player.powerups = {
      shield: false,
      jump: false,
      attack: false,
      speed: false,
    };

    // Cria animação de caminhada se não existir
    if (!this.anims.exists("walk")) {
      this.anims.create({
        key: "walk",
        frames: this.anims.generateFrameNumbers("personagem", { start: 0, end: 11 }),
        frameRate: 15,
        repeat: -1,
      });
    }

    // Cria animação de idle/parado se não existir
    if (!this.anims.exists("idle")) {
      this.anims.create({
        key: "idle",
        frames: this.anims.generateFrameNumbers("personagem", { start: 0, end: 0 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Inicia com a animação parado
    this.player.play("idle");
  }

  createHUD() {
    // Configura texto de placar (score) fixo na câmera
    this.scoreText = this.add.text(20, 20, "PONTOS: 0", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "16px",
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    });
    this.scoreText.setScrollFactor(0);

    // Configura contador de moedas
    this.coinCountText = this.add.text(20, 50, `MOEDAS: 0/${this.requiredCoins}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "16px",
      fill: "#ffff00",
      stroke: "#000000",
      strokeThickness: 4,
    });
    this.coinCountText.setScrollFactor(0);

    // Configura exibição de vidas (corações)
    this.livesGroup = this.add.group();
    this.updateLivesDisplay();

    // ===== HUD DE HABILIDADES =====
    // Container para ícones de habilidades
    this.skillsContainer = this.add.container(400, 565);
    this.skillsContainer.setScrollFactor(0);

    // Fundo do HUD de habilidades
    const skillsBg = this.add.rectangle(0, 0, 400, 50, 0x000000, 0.7);
    skillsBg.setStrokeStyle(2, 0x666666);
    this.skillsContainer.add(skillsBg);

    // Cria ícones e indicadores de cooldown para cada habilidade

    // Habilidade 0: Pulo Duplo (NOVO)
    const jumpIcon = this.add.rectangle(-150, 0, 40, 40, 0x00ff00, 0.8);
    jumpIcon.setStrokeStyle(2, 0xffffff);
    this.skillsContainer.add(jumpIcon);

    const jumpKey = this.add
      .text(-150, 0, "↑↑", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.skillsContainer.add(jumpKey);

    this.jumpText = this.add
      .text(-150, -25, "PULO DUPLO", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.skillsContainer.add(this.jumpText);

    // Habilidade 1: Escudo (Z)
    const shieldIcon = this.add.rectangle(-50, 0, 40, 40, 0x00ffff, 0.8);
    shieldIcon.setStrokeStyle(2, 0xffffff);
    this.skillsContainer.add(shieldIcon);

    const shieldKey = this.add
      .text(-50, 0, "Z", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.skillsContainer.add(shieldKey);

    this.shieldCooldownText = this.add
      .text(-50, -25, "ESCUDO", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.skillsContainer.add(this.shieldCooldownText);

    // Habilidade 2: Ataque (X)
    const attackIcon = this.add.rectangle(50, 0, 40, 40, 0xff0000, 0.8);
    attackIcon.setStrokeStyle(2, 0xffffff);
    this.skillsContainer.add(attackIcon);

    const attackKey = this.add
      .text(50, 0, "X", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.skillsContainer.add(attackKey);

    this.attackCooldownText = this.add
      .text(50, -25, "ATAQUE", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.skillsContainer.add(this.attackCooldownText);

    // Habilidade 3: Dash (C)
    const dashIcon = this.add.rectangle(150, 0, 40, 40, 0xffff00, 0.8);
    dashIcon.setStrokeStyle(2, 0xffffff);
    this.skillsContainer.add(dashIcon);

    const dashKey = this.add
      .text(150, 0, "C", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.skillsContainer.add(dashKey);

    this.dashCooldownText = this.add
      .text(150, -25, "DASH", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.skillsContainer.add(this.dashCooldownText);

    // Indicadores visuais de cooldown
    this.jumpCooldownBar = this.add.rectangle(-150, 15, 40, 5, 0xffffff, 1);
    this.skillsContainer.add(this.jumpCooldownBar);

    this.shieldCooldownBar = this.add.rectangle(-50, 15, 40, 5, 0xffffff, 1);
    this.skillsContainer.add(this.shieldCooldownBar);

    this.attackCooldownBar = this.add.rectangle(50, 15, 40, 5, 0xffffff, 1);
    this.skillsContainer.add(this.attackCooldownBar);

    this.dashCooldownBar = this.add.rectangle(150, 15, 40, 5, 0xffffff, 1);
    this.skillsContainer.add(this.dashCooldownBar);
  }

  createControls() {
    // Configura as teclas do jogo
    this.cursors = this.input.keyboard.createCursorKeys();

    // Teclas adicionais
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
  }

  createCollisions() {
    // Colisão entre jogador e plataformas
    this.physics.add.collider(this.player, this.platforms, () => {
      // Reseta o pulo duplo quando toca uma plataforma
      this.canDoubleJump = true;
    });

    // Colisão entre jogador e plataformas móveis
    this.physics.add.collider(this.player, this.movingPlatforms, () => {
      // Reseta o pulo duplo quando toca uma plataforma
      this.canDoubleJump = true;
    });

    // Colisão entre jogador e plataformas que desaparecem
    this.physics.add.collider(this.player, this.vanishingPlatforms, (player, platform) => {
      // Reseta o pulo duplo quando toca uma plataforma
      this.canDoubleJump = true;

      // Inicia a contagem regressiva para a plataforma desaparecer
      if (!platform.isVanishing) {
        platform.isVanishing = true;
        platform.setTint(0xff0000);

        this.time.delayedCall(500, () => {
          // Faz a plataforma piscar
          platform.setAlpha(0.7);

          this.time.delayedCall(200, () => {
            platform.setAlpha(1);

            this.time.delayedCall(200, () => {
              platform.setAlpha(0.5);

              this.time.delayedCall(200, () => {
                // Desativa a plataforma
                platform.setAlpha(0);
                platform.body.enable = false;

                // Reativa a plataforma após um tempo
                this.time.delayedCall(5000, () => {
                  platform.setAlpha(1);
                  platform.clearTint();
                  platform.body.enable = true;
                  platform.isVanishing = false;
                });
              });
            });
          });
        });
      }
    });

    // Colisão entre jogador e checkpoints
    this.physics.add.overlap(this.player, this.checkpoints, this.hitCheckpoint, null, this);

    // Colisão entre monstros e plataformas
    this.physics.add.collider(this.monsters, this.platforms);
    this.physics.add.collider(this.pursuingMonsters, this.platforms);

    // Colisão entre monstros e plataformas móveis
    this.physics.add.collider(this.monsters, this.movingPlatforms);
    this.physics.add.collider(this.pursuingMonsters, this.movingPlatforms);

    // Colisão entre monstros e plataformas que desaparecem
    this.physics.add.collider(this.monsters, this.vanishingPlatforms);
    this.physics.add.collider(this.pursuingMonsters, this.vanishingPlatforms);

    // Colisão entre monstros para evitar sobreposição
    this.physics.add.collider(this.monsters, this.monsters);
    this.physics.add.collider(this.pursuingMonsters, this.pursuingMonsters);
    this.physics.add.collider(this.monsters, this.pursuingMonsters);

    // Overlap (sobreposição) para coletar moedas
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // Overlap para coletar corações
    this.physics.add.overlap(this.player, this.hearts, this.collectHeart, null, this);

    // Overlap para pegar power-ups
    this.physics.add.overlap(this.player, this.powerups, this.collectPowerUp, null, this);

    // Overlap para dano de espinhos
    this.physics.add.overlap(this.player, this.spikes, this.hitSpike, null, this);

    // Overlap para colisão com monstros
    this.physics.add.overlap(this.player, this.monsters, this.hitMonster, null, this);
    this.physics.add.overlap(this.player, this.pursuingMonsters, this.hitMonster, null, this);

    // Overlap para o portal de saída
    this.physics.add.overlap(this.player, this.exitPortal, this.reachExit, null, this);
  }

  createEffects() {
    // Cria sistema de partículas para o escudo
    this.shieldParticles = this.add.particles("brilho");
    this.shieldEmitter = this.shieldParticles.createEmitter({
      scale: { start: 0.2, end: 0 },
      speed: 100,
      lifespan: 500,
      blendMode: "ADD",
      on: false,
    });

    // Cria sistema de partículas para coleta de moedas
    this.coinParticles = this.add.particles("brilho");
    this.coinEmitter = this.coinParticles.createEmitter({
      scale: { start: 0.1, end: 0 },
      speed: 100,
      lifespan: 300,
      blendMode: "ADD",
      on: false,
    });

    // Cria sistema de partículas para dash
    this.dashParticles = this.add.particles("brilho");
    this.dashEmitter = this.dashParticles.createEmitter({
      scale: { start: 0.1, end: 0 },
      speed: 50,
      lifespan: 200,
      blendMode: "ADD",
      on: false,
    });

    // Cria sistema de partículas para pulo duplo
    this.jumpParticles = this.add.particles("brilho");
    this.jumpEmitter = this.jumpParticles.createEmitter({
      scale: { start: 0.1, end: 0 },
      speed: 50,
      lifespan: 300,
      blendMode: "ADD",
      on: false,
    });
  }

  createSpecialZones() {
    // Criação de zonas especiais que afetam a jogabilidade

    // Zona de Baixa Gravidade (4000-4300)
    this.lowGravityZone = this.add.zone(4150, 300, 300, 600);
    this.physics.world.enable(this.lowGravityZone);
    this.lowGravityZone.body.setAllowGravity(false);
    this.lowGravityZone.body.setImmovable(true);

    this.physics.add.overlap(this.player, this.lowGravityZone, () => {
      this.player.body.gravity.y = 600; // Metade da gravidade normal
    });

    // Indicação visual da zona de baixa gravidade
    const lowGravityBg = this.add.rectangle(4150, 300, 300, 600, 0x0000ff, 0.1);

    // Texto explicativo
    const lowGravityText = this.add
      .text(4150, 100, "ZONA DE BAIXA GRAVIDADE", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        fill: "#00ffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Zona de Alta Velocidade (2000-2300)
    this.speedZone = this.add.zone(2150, 300, 300, 600);
    this.physics.world.enable(this.speedZone);
    this.speedZone.body.setAllowGravity(false);
    this.speedZone.body.setImmovable(true);

    // Indicação visual da zona de velocidade
    const speedBg = this.add.rectangle(2150, 300, 300, 600, 0xffff00, 0.1);

    // Texto explicativo
    const speedText = this.add
      .text(2150, 100, "ZONA DE VELOCIDADE", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        fill: "#ffff00",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);
  }

  createCheckpoints() {
    // Cria checkpoints ao longo do nível
    const checkpointPositions = [
      { x: 1000, y: 450 },
      { x: 2000, y: 450 },
      { x: 3000, y: 450 },
      { x: 4000, y: 450 },
      { x: 5000, y: 450 },
    ];

    checkpointPositions.forEach((pos) => {
      this.createCheckpoint(pos.x, pos.y);
    });
  }

  // ===== MÉTODOS DE CRIAÇÃO DE OBJETOS =====

  createCoin(x, y) {
    const coin = this.coins.create(x, y, "moeda");
    coin.setScale(0.15);

    // Animação de rotação
    this.tweens.add({
      targets: coin,
      angle: 360,
      duration: 1500,
      repeat: -1,
      ease: "Linear",
    });

    // Animação de flutuação
    this.tweens.add({
      targets: coin,
      y: y + 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return coin;
  }

  createHeart(x, y) {
    const heart = this.hearts.create(x, y, "coracao");
    heart.setScale(0.7);

    // Animação de pulsação
    this.tweens.add({
      targets: heart,
      scale: { from: 0.7, to: 0.8 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return heart;
  }

  createSpike(x, y) {
    const spike = this.spikes.create(x, y, "espinho");
    spike.setScale(0.1);
    return spike;
  }

  createMonster(x, y) {
    const monster = this.monsters.create(x, y, "monstro");
    monster.setScale(0.08); // Reduzido para passar entre plataformas
    monster.setBounce(0.2);
    monster.setCollideWorldBounds(false);

    // Define comportamento patrulha
    monster.direction = 1;
    monster.moveDistance = 100;
    monster.startX = x;

    return monster;
  }

  createPursuingMonsters() {
    // Adiciona monstros que perseguem o jogador em diferentes partes do nível
    const monsterPositions = [
      { x: 500, y: 300 },
      { x: 1200, y: 200 },
      { x: 1800, y: 250 },
      { x: 2400, y: 200 },
      { x: 3000, y: 300 },
      { x: 3600, y: 250 },
      { x: 4200, y: 200 },
      { x: 4800, y: 300 },
    ];

    monsterPositions.forEach((pos) => {
      const monster = this.pursuingMonsters.create(pos.x, pos.y, "monstro");
      monster.setScale(0.1); // Tamanho um pouco maior que os normais
      monster.setBounce(0.2);
      monster.setCollideWorldBounds(false);
      monster.setTint(0xff0000); // Cor vermelha para diferenciar

      // Diminui a hitbox para facilitar a passagem entre plataformas
      monster.body.setSize(monster.width * 0.7, monster.height * 0.7);

      // Aumenta as capacidades de pulo para perseguir melhor
      monster.jumpPower = -400;
      monster.jumpCooldown = 0;

      // Efeito pulsante para indicar que é perigoso
      this.tweens.add({
        targets: monster,
        scale: { from: 0.1, to: 0.12 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  createMovingPlatform(x, y) {
    // Cria uma plataforma que se move horizontalmente
    const platform = this.movingPlatforms.create(x, y, "tijolo");
    platform.setScale(1);
    platform.setImmovable(true);
    platform.body.allowGravity = false;

    // Define parâmetros de movimento
    platform.startX = x;
    platform.distance = 150 + Math.random() * 100;
    platform.speed = 1 + Math.random();
    platform.direction = 1;
    platform.moveAxis = "x"; // Movimento no eixo x por padrão

    // Em algumas plataformas móveis, adiciona moedas
    if (Math.random() > 0.3) {
      this.createCoin(x, y - 50);
    }

    return platform;
  }

  createVanishingPlatform(x, y) {
    // Cria uma plataforma que desaparece quando o jogador pisa nela
    const platform = this.vanishingPlatforms.create(x, y, "tijolo");
    platform.setScale(1);
    platform.setImmovable(true);
    platform.body.allowGravity = false;
    platform.isVanishing = false;

    // Efeito visual para indicar que é uma plataforma especial
    platform.setTint(0xaaaaff);

    return platform;
  }

  createCheckpoint(x, y) {
    // Cria um checkpoint que salva a posição do jogador
    const checkpoint = this.checkpoints.create(x, y, "brilho");
    checkpoint.setScale(0.5);
    checkpoint.activated = false;

    // Efeito visual para o checkpoint
    this.tweens.add({
      targets: checkpoint,
      alpha: { from: 0.5, to: 1 },
      scale: { from: 0.5, to: 0.6 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Texto indicando que é um checkpoint
    const checkpointText = this.add
      .text(x, y - 50, "CHECKPOINT", {
        fontFamily: "Arial",
        fontSize: "12px",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Associa o texto ao checkpoint para poder alterá-lo depois
    checkpoint.text = checkpointText;

    return checkpoint;
  }

  createPowerUp(x, y, type) {
    // Cria um power-up que dá habilidades especiais temporárias
    const powerup = this.powerups.create(x, y, "brilho");
    powerup.setScale(0.4);
    powerup.type = type;

    // Define a cor baseada no tipo
    switch (type) {
      case "shield":
        powerup.setTint(0x00ffff);
        break;
      case "jump":
        powerup.setTint(0x00ff00);
        break;
      case "attack":
        powerup.setTint(0xff0000);
        break;
      case "speed":
        powerup.setTint(0xffff00);
        break;
    }

    // Efeito de flutuação
    this.tweens.add({
      targets: powerup,
      y: y + 20,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Efeito de rotação
    this.tweens.add({
      targets: powerup,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: "Linear",
    });

    return powerup;
  }

  createBoss(x, y) {
    // Cria um "chefe" - um monstro maior e mais forte
    const boss = this.pursuingMonsters.create(x, y, "monstro");
    boss.setScale(0.2); // Tamanho maior que os monstros normais
    boss.setTint(0xff00ff); // Cor diferente para destacar
    boss.health = 3; // Precisa ser atingido várias vezes para ser derrotado
    boss.isBoss = true;

    // Efeito visual para destacar o boss
    this.tweens.add({
      targets: boss,
      scale: { from: 0.2, to: 0.22 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Texto de "BOSS" acima do monstro
    const bossText = this.add
      .text(x, y - 100, "BOSS", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "20px",
        fill: "#ff00ff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Associa o texto ao boss
    boss.text = bossText;

    // Adiciona indicador de vida
    const healthBar = this.add.rectangle(x, y - 80, 100, 10, 0x00ff00);
    healthBar.setStrokeStyle(2, 0x000000);
    boss.healthBar = healthBar;

    return boss;
  }

  // ===== MÉTODOS DE ATUALIZAÇÃO =====

  handlePlayerMovement() {
    // Aplicando gravidade normal quando não estiver em zona de baixa gravidade
    if (!this.physics.overlap(this.player, this.lowGravityZone)) {
      this.player.body.gravity.y = 1200;
    }

    // Movimento horizontal
    const moveSpeed = this.player.powerups.speed ? 300 : 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-moveSpeed);
      this.player.flipX = true;
      if (this.player.body.touching.down) {
        this.player.play("walk", true);
      }

      // Ajuste de velocidade em zona de velocidade
      if (this.physics.overlap(this.player, this.speedZone)) {
        this.player.setVelocityX(-moveSpeed * 1.5);
      }
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(moveSpeed);
      this.player.flipX = false;
      if (this.player.body.touching.down) {
        this.player.play("walk", true);
      }

      // Ajuste de velocidade em zona de velocidade
      if (this.physics.overlap(this.player, this.speedZone)) {
        this.player.setVelocityX(moveSpeed * 1.5);
      }
    } else {
      this.player.setVelocityX(0);
      if (this.player.body.touching.down) {
        this.player.play("idle", true);
      }
    }

    // Pulo principal
    const jumpPower = this.player.powerups.jump ? -700 : -550;

    if ((this.cursors.up.isDown || this.cursors.space.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(jumpPower);
    }

    // Pulo duplo
    if ((Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space)) && !this.player.body.touching.down && this.canDoubleJump) {
      const doubleJumpPower = this.player.powerups.jump ? -600 : -450;
      this.player.setVelocityY(doubleJumpPower);
      this.canDoubleJump = false;

      // Marca que o jogador usou o pulo duplo para remover o tutorial
      this.hasUsedDoubleJump = true;

      // Efeito visual de pulo duplo
      this.jumpEmitter.setPosition(this.player.x, this.player.y + 20);
      this.jumpEmitter.explode(15);

      // Efeito de "impulso" com partículas saindo para baixo
      this.coinEmitter.setPosition(this.player.x, this.player.y + 30);
      this.coinEmitter.setSpeed({ min: 50, max: 100 });
      this.coinEmitter.setAngle({ min: 80, max: 100 });
      this.coinEmitter.explode(10);
    }

    // Escudo (Z)
    if (Phaser.Input.Keyboard.JustDown(this.keyZ) && this.shieldCooldown <= 0) {
      this.hasUsedShield = true;
      this.activateShield();
      this.shieldCooldown = 5; // 5 segundos de cooldown
    }

    // Ataque (X)
    if (Phaser.Input.Keyboard.JustDown(this.keyX) && this.attackCooldown <= 0) {
      this.hasUsedAttack = true;
      this.attack();
      this.attackCooldown = 2; // 2 segundos de cooldown
    }

    // Dash (C)
    if (Phaser.Input.Keyboard.JustDown(this.keyC) && this.dashCooldown <= 0 && !this.isDashing) {
      this.hasUsedDash = true;
      this.dash();
      this.dashCooldown = 3; // 3 segundos de cooldown
    }
  }

  updateEnemies() {
    // Atualiza o comportamento dos monstros normais
    this.monsters.getChildren().forEach((monster) => {
      // Movimento de patrulha simples
      if (monster.x > monster.startX + monster.moveDistance) {
        monster.direction = -1;
        monster.flipX = true;
      } else if (monster.x < monster.startX - monster.moveDistance) {
        monster.direction = 1;
        monster.flipX = false;
      }

      monster.setVelocityX(50 * monster.direction);
    });

    // Atualiza os monstros perseguidores
    this.pursuingMonsters.getChildren().forEach((monster) => {
      // Se for um boss, atualiza a posição do texto e barra de vida
      if (monster.isBoss && monster.text && monster.healthBar) {
        monster.text.x = monster.x;
        monster.text.y = monster.y - 100;
        monster.healthBar.x = monster.x;
        monster.healthBar.y = monster.y - 80;
      }

      // Calcula a direção para o jogador
      const directionX = this.player.x - monster.x;
      const directionY = this.player.y - monster.y;

      // Normaliza o vetor de direção
      const length = Math.sqrt(directionX * directionX + directionY * directionY);

      // Define a distância de perseguição baseada em ser boss ou monstro normal
      const pursuitDistance = monster.isBoss ? 500 : 300;

      if (length < pursuitDistance) {
        // Só persegue se estiver a menos de X pixels
        // Velocidade maior para o boss
        const speed = monster.isBoss ? 120 : 80;

        // Atualiza velocidade na direção do jogador
        monster.setVelocityX((directionX / length) * speed);

        // Só pula se estiver no chão, o jogador estiver acima e o cooldown permitir
        if (monster.body.touching.down && directionY < -50 && monster.jumpCooldown <= 0) {
          monster.setVelocityY(monster.jumpPower);
          monster.jumpCooldown = 20; // Frames de cooldown
        }

        // Reduz o cooldown de pulo
        if (monster.jumpCooldown > 0) {
          monster.jumpCooldown--;
        }

        // Vira o sprite na direção correta
        if (directionX < 0) {
          monster.flipX = true;
        } else {
          monster.flipX = false;
        }
      } else {
        // Se estiver muito longe, comportamento padrão de patrulha
        if (!monster.startX) {
          monster.startX = monster.x;
          monster.moveDistance = 100;
          monster.direction = 1;
        }

        if (monster.x > monster.startX + monster.moveDistance) {
          monster.direction = -1;
          monster.flipX = true;
        } else if (monster.x < monster.startX - monster.moveDistance) {
          monster.direction = 1;
          monster.flipX = false;
        }

        monster.setVelocityX(50 * monster.direction);
      }
    });
  }

  updateEffects() {
    // Mantém o emitter de escudo seguindo o jogador
    if (this.isInvulnerable) {
      this.shieldEmitter.setPosition(this.player.x, this.player.y);
    }

    // Atualiza posição do emitter de dash se estiver ativo
    if (this.isDashing) {
      this.dashEmitter.setPosition(this.player.x - (this.player.flipX ? -30 : 30), this.player.y);
    }
  }

  updateMovingPlatforms() {
    // Atualiza o movimento das plataformas móveis
    this.movingPlatforms.getChildren().forEach((platform) => {
      if (platform.moveType === "circular") {
        // Movimento circular
        platform.angle += platform.speed;
        platform.x = platform.centerX + Math.cos(platform.angle) * platform.radius;
        platform.y = platform.centerY + Math.sin(platform.angle) * platform.radius;
      } else {
        // Movimento linear (horizontal ou vertical)
        if (platform.moveAxis === "y") {
          // Movimento vertical
          if (platform.y > platform.startPos + platform.distance) {
            platform.direction = -1;
          } else if (platform.y < platform.startPos - platform.distance) {
            platform.direction = 1;
          }

          platform.y += platform.direction * platform.speed;
        } else {
          // Movimento horizontal (padrão)
          if (platform.x > platform.startX + platform.distance) {
            platform.direction = -1;
          } else if (platform.x < platform.startX - platform.distance) {
            platform.direction = 1;
          }

          platform.x += platform.direction * platform.speed;
        }
      }

      // Atualiza a física da plataforma
      platform.body.updateFromGameObject();
    });
  }

  updateVanishingPlatforms() {
    // Apenas para atualizar efeitos visuais, a lógica principal está no manipulador de colisão
  }

  updateCooldowns() {
    // Atualiza os cooldowns das habilidades
    if (this.shieldCooldown > 0) {
      this.shieldCooldown -= 1 / 60; // Reduz em 1 segundo a cada 60 frames

      // Atualiza o texto e a barra de cooldown
      this.shieldCooldownText.setText(`ESCUDO: ${Math.ceil(this.shieldCooldown)}s`);
      this.shieldCooldownBar.width = 40 * (1 - this.shieldCooldown / 5);
    } else {
      this.shieldCooldownText.setText("ESCUDO");
      this.shieldCooldownBar.width = 40;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= 1 / 60;

      // Atualiza o texto e a barra de cooldown
      this.attackCooldownText.setText(`ATAQUE: ${Math.ceil(this.attackCooldown)}s`);
      this.attackCooldownBar.width = 40 * (1 - this.attackCooldown / 2);
    } else {
      this.attackCooldownText.setText("ATAQUE");
      this.attackCooldownBar.width = 40;
    }

    if (this.dashCooldown > 0) {
      this.dashCooldown -= 1 / 60;

      // Atualiza o texto e a barra de cooldown
      this.dashCooldownText.setText(`DASH: ${Math.ceil(this.dashCooldown)}s`);
      this.dashCooldownBar.width = 40 * (1 - this.dashCooldown / 3);
    } else {
      this.dashCooldownText.setText("DASH");
      this.dashCooldownBar.width = 40;
    }
  }

  updateGameTime() {
    // Incrementa o tempo de jogo
    this.gameTime++;

    // Salva o tempo no objeto global do jogo
    this.game.globals.gameTime = this.gameTime;
  }

  updateLivesDisplay() {
    // Limpa o grupo de vidas
    this.livesGroup.clear(true, true);

    // Adiciona corações baseado no número de vidas
    for (let i = 0; i < this.lives; i++) {
      const heart = this.add.image(700 - i * 30, 30, "coracao");
      heart.setScale(0.5);
      heart.setScrollFactor(0);
      this.livesGroup.add(heart);
    }
  }

  respawnCoins() {
    // Adiciona moedas em posições aleatórias se necessário
    if (this.coins.countActive(true) < 7) {
      // Quantidade de moedas para adicionar
      const coinsToAdd = Math.min(3, 7 - this.coins.countActive(true));

      for (let i = 0; i < coinsToAdd; i++) {
        const x = Phaser.Math.Between(this.player.x - 500, this.player.x + 500);
        const y = Phaser.Math.Between(100, 400);

        // Adiciona a moeda e um efeito visual
        const coin = this.createCoin(x, y);

        // Efeito de aparecimento
        coin.setAlpha(0);
        coin.setScale(0);

        this.tweens.add({
          targets: coin,
          alpha: 1,
          scale: 0.15,
          duration: 500,
          ease: "Back.easeOut",
        });
      }

      // Mostra mensagem de que novas moedas apareceram
      const respawnText = this.add
        .text(this.player.x, this.player.y - 100, "NOVAS MOEDAS APARECERAM!", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "12px",
          fill: "#ffff00",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5);

      // Remove a mensagem após alguns segundos
      this.tweens.add({
        targets: respawnText,
        alpha: { from: 1, to: 0 },
        y: respawnText.y - 50,
        duration: 2000,
        ease: "Cubic.easeOut",
        onComplete: () => {
          respawnText.destroy();
        },
      });
    }
  }

  showDoubleJumpTutorial() {
    if (this.doubleJumpTutorialShown) return;

    const tutorialText = this.add
      .text(this.player.x, this.player.y - 100, "Pressione ESPAÇO/CIMA no ar para PULO DUPLO!", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        fill: "#00ff00",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Animação para o texto
    this.tweens.add({
      targets: tutorialText,
      scale: { from: 0.5, to: 1 },
      duration: 500,
    });

    // Remove o texto após alguns segundos
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: tutorialText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          tutorialText.destroy();
        },
      });
    });

    this.doubleJumpTutorialShown = true;
  }

  showShieldTutorial() {
    if (this.shieldTutorialShown) return;

    const tutorialText = this.add
      .text(this.player.x, this.player.y - 100, "Pressione Z para ativar o ESCUDO!", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        fill: "#00ffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Animação para o texto
    this.tweens.add({
      targets: tutorialText,
      scale: { from: 0.5, to: 1 },
      duration: 500,
    });

    // Remove o texto após alguns segundos
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: tutorialText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          tutorialText.destroy();
        },
      });
    });

    this.shieldTutorialShown = true;
  }

  showAttackTutorial() {
    if (this.attackTutorialShown) return;

    const tutorialText = this.add
      .text(this.player.x, this.player.y - 100, "Pressione X para ATACAR inimigos!", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        fill: "#ff0000",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Animação para o texto
    this.tweens.add({
      targets: tutorialText,
      scale: { from: 0.5, to: 1 },
      duration: 500,
    });

    // Remove o texto após alguns segundos
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: tutorialText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          tutorialText.destroy();
        },
      });
    });

    this.attackTutorialShown = true;
  }

  showDashTutorial() {
    if (this.dashTutorialShown) return;

    const tutorialText = this.add
      .text(this.player.x, this.player.y - 100, "Pressione C para DASH rápido!", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        fill: "#ffff00",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Animação para o texto
    this.tweens.add({
      targets: tutorialText,
      scale: { from: 0.5, to: 1 },
      duration: 500,
    });

    // Remove o texto após alguns segundos
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: tutorialText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          tutorialText.destroy();
        },
      });
    });

    this.dashTutorialShown = true;
  }

  // ===== MÉTODOS DE INTERAÇÃO =====

  collectCoin(player, coin) {
    // Efeito de partículas
    this.coinEmitter.setPosition(coin.x, coin.y);
    this.coinEmitter.explode(10);

    // Remove a moeda
    coin.destroy();

    // Incrementa pontuação e contador de moedas
    this.score += 10;
    this.coinsCollected++;

    // Atualiza o texto do placar
    this.scoreText.setText(`PONTOS: ${this.score}`);
    this.coinCountText.setText(`MOEDAS: ${this.coinsCollected}/${this.requiredCoins}`);

    // Atualiza o objeto global do jogo
    this.game.globals.score = this.score;
    this.game.globals.coinsCollected = this.coinsCollected;

    // Exibe notificação de pontuação
    this.showFloatingText(coin.x, coin.y - 20, "+10", 0xffff00);

    // Verifica se temos moedas suficientes e atualiza o portal
    if (this.coinsCollected >= this.requiredCoins && this.exitText) {
      this.exitText.setText("SAÍDA LIBERADA!");
      this.exitText.setColor("#00ff00");

      // Adiciona efeito de brilho ao redor do texto
      this.tweens.add({
        targets: this.exitText,
        scale: { from: 1, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  collectHeart(player, heart) {
    // Efeito de partículas
    this.coinEmitter.setPosition(heart.x, heart.y);
    this.coinEmitter.explode(15);

    // Remove o coração
    heart.destroy();

    // Incrementa vidas (com máximo de 5)
    if (this.lives < 5) {
      this.lives++;
      this.updateLivesDisplay();
    }

    // Incrementa pontuação
    this.score += 50;
    this.scoreText.setText(`PONTOS: ${this.score}`);

    // Atualiza o objeto global do jogo
    this.game.globals.score = this.score;

    // Exibe notificação de pontuação
    this.showFloatingText(heart.x, heart.y - 20, "+50", 0xff00ff);
  }

  collectPowerUp(player, powerup) {
    // Efeito de partículas
    this.coinEmitter.setPosition(powerup.x, powerup.y);
    this.coinEmitter.explode(20);

    // Aplica o efeito do power-up
    const duration = 10000; // 10 segundos

    switch (powerup.type) {
      case "shield":
        this.player.powerups.shield = true;
        this.activateShield(15); // Escudo por 15 segundos
        this.showFloatingText(powerup.x, powerup.y - 30, "SUPER ESCUDO!", 0x00ffff);
        break;

      case "jump":
        this.player.powerups.jump = true;
        this.showFloatingText(powerup.x, powerup.y - 30, "SUPER PULO!", 0x00ff00);

        // Efeito visual
        this.player.setTint(0x00ff00);
        break;

      case "attack":
        this.player.powerups.attack = true;
        this.showFloatingText(powerup.x, powerup.y - 30, "SUPER ATAQUE!", 0xff0000);

        // Efeito visual
        this.player.setTint(0xff0000);
        break;

      case "speed":
        this.player.powerups.speed = true;
        this.showFloatingText(powerup.x, powerup.y - 30, "SUPER VELOCIDADE!", 0xffff00);

        // Efeito visual
        this.player.setTint(0xffff00);
        break;
    }

    // Remove o power-up
    powerup.destroy();

    // Timer para desativar o power-up
    if (powerup.type !== "shield") {
      // O escudo já tem seu próprio timer
      this.time.delayedCall(duration, () => {
        this.player.powerups[powerup.type] = false;

        // Remove o efeito visual
        if (!this.isInvulnerable) {
          this.player.clearTint();
        }

        this.showFloatingText(this.player.x, this.player.y - 50, `${powerup.type.toUpperCase()} TERMINOU`, 0xffffff);
      });
    }
  }

  hitCheckpoint(player, checkpoint) {
    if (!checkpoint.activated) {
      // Ativa o checkpoint
      checkpoint.activated = true;
      checkpoint.setTint(0x00ff00);

      // Atualiza o texto
      if (checkpoint.text) {
        checkpoint.text.setText("ATIVADO!");
        checkpoint.text.setColor("#00ff00");
      }

      // Salva a posição do jogador
      this.startPosition = { x: checkpoint.x, y: checkpoint.y };

      // Efeito visual
      this.coinEmitter.setPosition(checkpoint.x, checkpoint.y);
      this.coinEmitter.explode(30);

      // Mensagem
      this.showFloatingText(checkpoint.x, checkpoint.y - 50, "CHECKPOINT ATIVADO!", 0x00ff00);
    }
  }

  hitSpike(player, spike) {
    // Se o jogador está invulnerável, não faz nada
    if (this.isInvulnerable) return;

    // Causa dano ao jogador
    this.playerHit();
  }

  hitMonster(player, monster) {
    // Se o jogador está invulnerável, não faz nada
    if (this.isInvulnerable) return;

    // Verifica se o jogador está caindo em cima do monstro (para eliminá-lo)
    if (player.body.velocity.y > 0 && player.y < monster.y - monster.height / 2) {
      // Se for um boss, reduz sua vida em vez de matar imediatamente
      if (monster.isBoss) {
        monster.health--;

        // Atualiza a barra de vida
        if (monster.healthBar) {
          monster.healthBar.width = 100 * (monster.health / 3);

          // Muda a cor da barra baseada na vida restante
          if (monster.health === 2) monster.healthBar.fillColor = 0xffff00;
          if (monster.health === 1) monster.healthBar.fillColor = 0xff0000;
        }

        // Se o boss ainda tem vida, apenas causa dano
        if (monster.health > 0) {
          // Dá um pequeno impulso ao jogador
          player.setVelocityY(-300);

          // Mostra dano
          this.showFloatingText(monster.x, monster.y - 50, `BOSS: ${monster.health}/3`, 0xff00ff);

          return;
        }
      }

      // Elimina o monstro com efeito
      this.coinEmitter.setPosition(monster.x, monster.y);
      this.coinEmitter.explode(20);

      // Remove o texto e barra de vida se for um boss
      if (monster.isBoss) {
        if (monster.text) monster.text.destroy();
        if (monster.healthBar) monster.healthBar.destroy();
      }

      monster.destroy();

      // Dá um pequeno impulso ao jogador
      player.setVelocityY(-300);

      // Incrementa pontuação (mais pontos para o boss)
      const points = monster.isBoss ? 100 : monster.tintTopLeft === 0xff0000 ? 50 : 30;
      this.score += points;
      this.scoreText.setText(`PONTOS: ${this.score}`);

      // Atualiza o objeto global do jogo
      this.game.globals.score = this.score;

      // Exibe notificação de pontuação
      this.showFloatingText(monster.x, monster.y - 20, `+${points}`, 0x00ff00);

      // Chance de dropar uma moeda
      if (Math.random() > 0.5) {
        this.createCoin(monster.x, monster.y - 50);
      }
    } else {
      // Causa dano ao jogador
      this.playerHit();
    }
  }

  reachExit(player, exit) {
    // Verifica se coletou moedas suficientes para vencer
    if (this.coinsCollected >= this.requiredCoins) {
      this.completeLevel();
    } else {
      // Mostra mensagem de que precisa coletar mais moedas
      if (!this.collectMoreCoinsText) {
        this.collectMoreCoinsText = this.add
          .text(player.x, player.y - 100, `Colete mais ${this.requiredCoins - this.coinsCollected} moedas!`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "12px",
            fill: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4,
          })
          .setOrigin(0.5);

        // Remove a mensagem após alguns segundos
        this.time.delayedCall(2000, () => {
          if (this.collectMoreCoinsText) {
            this.collectMoreCoinsText.destroy();
            this.collectMoreCoinsText = null;
          }
        });
      }
    }
  }

  // ===== MÉTODOS DE HABILIDADES =====

  activateShield(duration = 3) {
    // Ativa escudo
    this.isInvulnerable = true;

    // Efeito visual
    this.player.setTint(0x00ffff);
    this.shieldEmitter.setPosition(this.player.x, this.player.y);
    this.shieldEmitter.start();

    // Mensagem de feedback
    this.showFloatingText(this.player.x, this.player.y - 50, "ESCUDO ATIVO!", 0x00ffff);

    // Timer para desativar o escudo
    this.time.delayedCall(
      duration * 1000,
      () => {
        this.isInvulnerable = false;
        this.player.powerups.shield = false;
        this.player.clearTint();
        this.shieldEmitter.stop();
      },
      [],
      this
    );
  }

  attack() {
    // Efeito visual
    this.player.setTint(0xff0000);

    // Cria zona de ataque na direção do jogador
    const offsetX = this.player.flipX ? -50 : 50;
    const attackZone = this.physics.add.sprite(this.player.x + offsetX, this.player.y, "brilho");

    // Tamanho do ataque baseado no power-up
    const attackScale = this.player.powerups.attack ? 0.8 : 0.5;
    attackZone.setScale(attackScale);
    attackZone.setAlpha(0.5);

    // Efeito visual do ataque
    this.coinEmitter.setPosition(this.player.x + offsetX, this.player.y);
    this.coinEmitter.explode(15);

    // Detecta monstros na zona de ataque
    const hitMonster = (zone, monster) => {
      // Para bosses, reduz vida em vez de matar imediatamente
      if (monster.isBoss) {
        // Reduz vida mais rápido com power-up de ataque
        const damage = this.player.powerups.attack ? 2 : 1;
        monster.health -= damage;

        // Atualiza a barra de vida
        if (monster.healthBar) {
          monster.healthBar.width = 100 * (monster.health / 3);

          // Muda a cor da barra baseada na vida restante
          if (monster.health <= 2) monster.healthBar.fillColor = 0xffff00;
          if (monster.health <= 1) monster.healthBar.fillColor = 0xff0000;
        }

        // Se o boss ainda tem vida, apenas causa dano
        if (monster.health > 0) {
          this.showFloatingText(monster.x, monster.y - 50, `BOSS: ${monster.health}/3`, 0xff00ff);
          return;
        }

        // Se o boss morreu, remove seus elementos extras
        if (monster.text) monster.text.destroy();
        if (monster.healthBar) monster.healthBar.destroy();
      }

      // Elimina o monstro com efeito
      this.coinEmitter.setPosition(monster.x, monster.y);
      this.coinEmitter.explode(20);
      monster.destroy();

      // Incrementa pontuação (diferente para cada tipo de monstro)
      const points = monster.isBoss ? 100 : monster.tintTopLeft === 0xff0000 ? 50 : 30;
      this.score += points;
      this.scoreText.setText(`PONTOS: ${this.score}`);

      // Atualiza o objeto global do jogo
      this.game.globals.score = this.score;

      // Exibe notificação de pontuação
      this.showFloatingText(monster.x, monster.y - 20, `+${points}`, 0x00ff00);

      // Chance de dropar uma moeda (maior com poder de ataque)
      const dropChance = this.player.powerups.attack ? 0.7 : 0.5;
      if (Math.random() > dropChance) {
        this.createCoin(monster.x, monster.y - 50);
      }
    };

    // Detecta colisão com os dois tipos de monstros
    this.physics.add.overlap(attackZone, this.monsters, hitMonster, null, this);
    this.physics.add.overlap(attackZone, this.pursuingMonsters, hitMonster, null, this);

    // Timer para remover a zona e terminar o ataque
    this.time.delayedCall(
      400,
      () => {
        attackZone.destroy();
        if (!this.isInvulnerable && !this.player.powerups.attack) {
          this.player.clearTint();
        }
      },
      [],
      this
    );
  }

  dash() {
    // Configuração do estado de dash
    this.isDashing = true;

    // Adiciona velocidade na direção que o jogador está olhando
    const dashSpeed = this.player.flipX ? -500 : 500;
    this.player.setVelocityX(dashSpeed);

    // Efeito visual
    this.player.setTint(0xffff00);

    // Ativa o emissor de partículas
    this.dashEmitter.setPosition(this.player.x, this.player.y);
    this.dashEmitter.start();

    // Invulnerável durante o dash
    this.isInvulnerable = true;

    // Timer para terminar o dash
    this.time.delayedCall(
      300,
      () => {
        this.isDashing = false;
        this.isInvulnerable = false;

        // Só limpa o tint se não tiver outros efeitos ativos
        if (!this.player.powerups.shield && !this.player.powerups.jump && !this.player.powerups.attack && !this.player.powerups.speed) {
          this.player.clearTint();
        }

        this.dashEmitter.stop();
      },
      [],
      this
    );
  }

  // ===== MÉTODOS DE DANO E MORTE =====

  playerHit() {
    // Reduz vida
    this.lives--;

    // Atualiza display de vidas
    this.updateLivesDisplay();

    // Efeito de piscar
    this.player.setTint(0xff0000);

    // Efeito de câmera (shake)
    this.cameras.main.shake(200, 0.01);

    // Invulnerabilidade temporária
    this.isInvulnerable = true;

    // Timer para remover efeito de dano e invulnerabilidade
    this.time.delayedCall(
      1000,
      () => {
        // Só remove o tint vermelho se não tiver outro efeito ativo
        if (!this.player.powerups.shield && !this.player.powerups.jump && !this.player.powerups.attack && !this.player.powerups.speed) {
          this.player.clearTint();
        }

        this.isInvulnerable = false;
      },
      [],
      this
    );

    // Se não tem mais vidas, o jogador morre
    if (this.lives <= 0) {
      this.playerDie();
    }
  }

  playerDie() {
    // Atualiza highscore global se necessário
    if (this.score > this.game.globals.highScore) {
      this.game.globals.highScore = this.score;
    }

    // Efeito de partículas na morte
    this.coinEmitter.setPosition(this.player.x, this.player.y);
    this.coinEmitter.explode(50);

    // Deixa o jogador vermelho
    this.player.setTint(0xff0000);

    // Para todos os movimentos
    this.player.setVelocity(0, 0);

    // Efeito dramático de câmera
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.fade(1000, 0, 0, 0);

    // Vai para a tela de Game Over
    this.time.delayedCall(
      1000,
      () => {
        this.scene.start("GameOverScene", { win: false, playerName: this.playerName });
      },
      [],
      this
    );
  }

  completeLevel() {
    // Atualiza highscore global se necessário
    if (this.score > this.game.globals.highScore) {
      this.game.globals.highScore = this.score;
    }

    // Efeito de partículas na vitória
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 200, () => {
        this.coinEmitter.setPosition(this.player.x, this.player.y - 50);
        this.coinEmitter.explode(20);
      });
    }

    // Efeito visual no jogador
    this.player.setTint(0xffff00);

    // Para todos os movimentos
    this.player.setVelocity(0, 0);

    // Efeito de câmera
    this.cameras.main.flash(500, 255, 255, 255);
    this.cameras.main.fade(1000, 255, 255, 255);

    // Vai para a tela de Game Over com indicação de vitória
    this.time.delayedCall(
      1000,
      () => {
        this.scene.start("GameOverScene", { win: true, playerName: this.playerName });
      },
      [],
      this
    );
  }

  // ===== MÉTODOS UTILITÁRIOS =====

  // Adiciona texto flutuante para feedback
  showFloatingText(x, y, message, color = 0xffffff) {
    const text = this.add
      .text(x, y, message, {
        fontFamily: "Arial",
        fontSize: "14px",
        color: `#${color.toString(16).padStart(6, "0")}`,
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1500,
      ease: "Cubic.out",
      onComplete: () => {
        text.destroy();
      },
    });
  }
}

export default GameScene;