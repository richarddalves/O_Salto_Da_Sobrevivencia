/**
 * WelcomeScene.js
 * Cena inicial do jogo "O Salto da Sobrevivência: Desafio das Dimensões"
 * Design com estética retrô e animações mais elaboradas
 */
class WelcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: "WelcomeScene" });
    this.playerName = "Aventureiro"; // Nome padrão
  }

  preload() {
  // Define a URL base para todos os assets
  this.load.setBaseURL('https://richarddalves.github.io/O_Salto_Da_Sobrevivencia/');
  
  // Carrega os assets com caminhos relativos à URL base
  this.load.image("fundo", "assets/fundo.png");
  this.load.image("tijolo", "assets/tijolos.png");
  this.load.image("moeda", "assets/moeda.png");
  this.load.image("coracao", "assets/coracao.png");
  this.load.image("espinho", "assets/espinho.png");
  this.load.image("monstro", "assets/monstro.png");
  this.load.image("brilho", "assets/brilho.png");
  
  // Caminho do spritesheet também é relativo à URL base
  this.load.spritesheet("personagem", "assets/sprites/personagemAndando3.png", {
    frameWidth: 99,
    frameHeight: 161.6,
  });
}

  create() {
    // ===== CONFIGURAÇÃO DE FUNDO COM PARALAXE =====
    // Camada de fundo com efeito paralaxe
    this.background = this.add.tileSprite(400, 300, 1200, 400, "fundo");
    this.background.setScale(0.7);

    // Aplica efeito de scanline para aparência retrô
    this.createRetroEffect();

    // ===== TÍTULO ANIMADO =====
    // Container para o título
    this.titleContainer = this.add.container(400, 120);

    // Fundo do título com efeito de brilho
    const titleBg = this.add.rectangle(0, 0, 600, 80, 0x000000, 0.6);
    titleBg.setStrokeStyle(4, 0xffff00);
    this.titleContainer.add(titleBg);

    // Texto do título com estilo retrô
    const titleText = this.add
      .text(0, 0, "O SALTO DA SOBREVIVÊNCIA", {
        fontFamily: '"Press Start 2P", Arial',
        fontSize: "26px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
        shadow: { offsetX: 3, offsetY: 3, color: "#000000", blur: 5, stroke: true, fill: true },
      })
      .setOrigin(0.5);

    // Adiciona texto de subtítulo
    const subtitleText = this.add
      .text(0, 40, "DESAFIO DAS DIMENSÕES", {
        fontFamily: '"Press Start 2P", Arial',
        fontSize: "16px",
        color: "#ffff00",
        align: "center",
      })
      .setOrigin(0.5);

    this.titleContainer.add(titleText);
    this.titleContainer.add(subtitleText);

    // Animação do título
    this.tweens.add({
      targets: this.titleContainer,
      scale: { from: 0.95, to: 1.05 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Brilho ao redor do título
    this.tweens.add({
      targets: titleBg,
      strokeAlpha: { from: 0.3, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });

    // ===== INSTRUÇÕES DE JOGO =====
    // Container para as instruções
    const instructionsContainer = this.add.container(400, 260);

    // Fundo para as instruções
    const instructionsBg = this.add.rectangle(0, 0, 600, 160, 0x000000, 0.7);
    instructionsBg.setStrokeStyle(2, 0x00ffff);
    instructionsContainer.add(instructionsBg);

    // Título das instruções
    const instructionsTitle = this.add
      .text(0, -60, "COMO JOGAR:", {
        fontFamily: '"Press Start 2P", Arial',
        fontSize: "18px",
        color: "#00ffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5);
    instructionsContainer.add(instructionsTitle);

    // Instruções de controle de forma mais clara
    this.addInstructions(instructionsContainer);

    // ===== BOTÃO JOGAR =====
    // Container para o botão
    this.playButton = this.add.container(400, 420);

    // Fundo do botão com estilo mais destacado
    const buttonBg = this.add.rectangle(0, 0, 300, 80, 0x00aa00, 1);
    buttonBg.setStrokeStyle(6, 0xffff00);
    this.playButton.add(buttonBg);

    // Texto do botão
    const buttonText = this.add
      .text(0, 0, "JOGAR", {
        fontFamily: '"Press Start 2P", Arial',
        fontSize: "32px",
        color: "#ffffff",
        align: "center",
        shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 2, fill: true },
      })
      .setOrigin(0.5);
    this.playButton.add(buttonText);

    // Torna o botão interativo
    buttonBg.setInteractive({ useHandCursor: true });

    // Efeitos no hover
    buttonBg.on("pointerover", () => {
      buttonBg.fillColor = 0x00cc00;
      this.playButton.setScale(1.1);
      buttonText.setTint(0xffff00);
    });

    buttonBg.on("pointerout", () => {
      buttonBg.fillColor = 0x00aa00;
      this.playButton.setScale(1);
      buttonText.clearTint();
    });

    // Pulso constante no botão para destacá-lo
    this.tweens.add({
      targets: this.playButton,
      scale: { from: 1, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Inicia o jogo ao clicar
    buttonBg.on("pointerdown", () => {
      buttonBg.fillColor = 0x009900;
      this.playButton.setScale(0.95);

      // Exibe o diálogo para inserir o nome
      this.showNameDialog();
    });

    // ===== INFORMAÇÕES ADICIONAIS =====
    // Versão do jogo
    this.add
      .text(750, 580, "v1.2", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#aaaaaa",
      })
      .setOrigin(1, 1);

    // Créditos
    this.add
      .text(400, 580, "Desenvolvido por Richard Alves - Projeto da Semana 4 - Inteli", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#ffffff",
      })
      .setOrigin(0.5, 1);

    // ===== ELEMENTOS DECORATIVOS ANIMADOS =====
    // Adiciona moedas decorativas com animações
    this.createCoins();

    // ===== TECLAS DE ATALHO =====
    // Teclas para iniciar o jogo
    this.input.keyboard.on("keydown-ENTER", () => {
      this.showNameDialog();
    });

    this.input.keyboard.on("keydown-SPACE", () => {
      this.showNameDialog();
    });

    // Cria animação do personagem se ainda não existir
    if (!this.anims.exists("andar")) {
      this.anims.create({
        key: "andar",
        frames: this.anims.generateFrameNumbers("personagem", { start: 0, end: 11 }),
        frameRate: 15,
        repeat: -1,
      });
    }

    // Adiciona o personagem com animação
    this.player = this.add.sprite(650, 500, "personagem");
    this.player.setScale(0.4);
    this.player.play("andar");
  }

  update() {
    // Movimento do fundo para efeito de paralaxe
    this.background.tilePositionX += 0.5;

    // Atualização do efeito scanline
    this.updateRetroEffect();
  }

  // Método para exibir diálogo para o jogador inserir seu nome
  showNameDialog() {
    // Cria um overlay escuro para o fundo
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    // Container do diálogo
    const dialogContainer = this.add.container(400, 300);

    // Fundo do diálogo
    const dialogBg = this.add.rectangle(0, 0, 500, 250, 0x222222, 1);
    dialogBg.setStrokeStyle(4, 0x00ffff);
    dialogContainer.add(dialogBg);

    // Título do diálogo
    const dialogTitle = this.add
      .text(0, -80, "QUAL É O SEU NOME?", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);
    dialogContainer.add(dialogTitle);

    // Caixa para o nome
    const nameBox = this.add.rectangle(0, 0, 400, 60, 0x333333, 1);
    nameBox.setStrokeStyle(2, 0xffffff);
    dialogContainer.add(nameBox);

    // Texto do nome (inicialmente vazio)
    const nameText = this.add
      .text(0, 0, "", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    dialogContainer.add(nameText);

    // Cursor piscante
    const cursor = this.add
      .text(nameText.x + nameText.width / 2 + 5, nameText.y, "|", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    dialogContainer.add(cursor);

    // Animação do cursor
    this.tweens.add({
      targets: cursor,
      alpha: { from: 1, to: 0 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Botão de confirmação
    const confirmButton = this.add.container(0, 80);
    const confirmBg = this.add.rectangle(0, 0, 200, 50, 0x00aa00, 1);
    confirmBg.setStrokeStyle(2, 0xffff00);
    const confirmText = this.add
      .text(0, 0, "CONFIRMAR", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    confirmButton.add([confirmBg, confirmText]);
    dialogContainer.add(confirmButton);

    // Torna o botão interativo
    confirmBg.setInteractive({ useHandCursor: true });

    // Efeitos de hover no botão
    confirmBg.on("pointerover", () => {
      confirmBg.fillColor = 0x00cc00;
    });

    confirmBg.on("pointerout", () => {
      confirmBg.fillColor = 0x00aa00;
    });

    // Adiciona o evento de clique no botão
    confirmBg.on("pointerdown", () => {
      this.confirmName(nameText.text);
      overlay.destroy();
      dialogContainer.destroy();
    });

    // Configuração para capturar entrada de teclado
    this.input.keyboard.on("keydown", (event) => {
      // Quando Enter é pressionado, confirma o nome
      if (event.keyCode === 13) {
        this.confirmName(nameText.text);
        overlay.destroy();
        dialogContainer.destroy();
        return;
      }

      // Quando BackSpace é pressionado, apaga o último caractere
      if (event.keyCode === 8 && nameText.text.length > 0) {
        nameText.text = nameText.text.slice(0, -1);
        // Atualiza a posição do cursor
        cursor.x = nameText.x + nameText.width / 2 + 5;
        return;
      }

      // Limita o nome a 12 caracteres
      if (nameText.text.length >= 12) return;

      // Só aceita letras, números e alguns símbolos
      const validChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
      if (validChars.test(event.key) && event.key.length === 1) {
        nameText.text += event.key;
        // Atualiza a posição do cursor
        cursor.x = nameText.x + nameText.width / 2 + 5;
      }
    });
  }

  // Confirma o nome e inicia o jogo
  confirmName(name) {
    // Se o nome estiver vazio, usa o nome padrão
    if (!name || name.trim() === "") {
      name = "Aventureiro";
    }

    // Salva o nome e inicia o jogo
    this.playerName = name.trim();
    this.startGame();
  }

  // Método para criar efeito retrô de scanline
  createRetroEffect() {
    // Cria o efeito de scanlines
    this.scanlines = [];
    for (let i = 0; i < 300; i++) {
      if (i % 2 === 0) {
        const line = this.add.rectangle(400, i * 2, 800, 1, 0x000000, 0.2);
        this.scanlines.push(line);
      }
    }

    // Container para efeito CRT
    this.crtEffect = this.add.rectangle(400, 300, 820, 620, 0x000000, 0);
    this.crtEffect.setStrokeStyle(10, 0x222222, 0.5);

    // Brilho nos cantos do efeito CRT
    for (let i = 0; i < 4; i++) {
      const x = i % 2 === 0 ? 50 : 750;
      const y = i < 2 ? 50 : 550;
      const shine = this.add.circle(x, y, 80, 0xffffff, 0.03);
      this.add.circle(x, y, 40, 0xffffff, 0.05);
    }
  }

  // Atualiza o efeito retrô
  updateRetroEffect() {
    // Efeito de cintilação sutil
    if (Math.random() > 0.99) {
      this.cameras.main.setAlpha(0.95);
      this.time.delayedCall(50, () => {
        this.cameras.main.setAlpha(1);
      });
    }
  }

  // Método para criar moedas decorativas
  createCoins() {
    this.coins = [];

    // Cria várias moedas animadas em diferentes posições
    for (let i = 0; i < 5; i++) {
      const x = 150 + i * 130;
      const y = 500;

      const coin = this.add.image(x, y, "moeda").setScale(0.15);
      this.coins.push(coin);

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
        y: y - 20,
        duration: 1000 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      // Animação de brilho
      if (i % 2 === 0) {
        this.tweens.add({
          targets: coin,
          scale: { from: 0.15, to: 0.18 },
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }
  }

  // Método para adicionar instruções de controle
  addInstructions(container) {
    // Instruções para setas/movimento
    const moveText = this.add
      .text(-220, -20, "SETAS", {
        fontFamily: '"Press Start 2P", Arial',
        fontSize: "14px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    const moveDesc = this.add
      .text(-220, 10, "Movimento", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#aaaaaa",
        align: "center",
      })
      .setOrigin(0.5);

    // Tecla espaço
    const jumpText = this.add
      .text(-70, -20, "ESPAÇO", {
        fontFamily: '"Press Start 2P", Arial',
        fontSize: "14px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    const jumpDesc = this.add
      .text(-70, 10, "Pular", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#aaaaaa",
        align: "center",
      })
      .setOrigin(0.5);

    // Tecla Z
    const shieldText = this.add
      .text(70, -20, "Z", {
        fontFamily: '"Press Start 2P", Arial',
        fontSize: "14px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    const shieldDesc = this.add
      .text(70, 10, "Escudo", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#aaaaaa",
        align: "center",
      })
      .setOrigin(0.5);

    // Tecla X
    const attackText = this.add
      .text(170, -20, "X", {
        fontFamily: '"Press Start 2P", Arial',
        fontSize: "14px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    const attackDesc = this.add
      .text(170, 10, "Ataque", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#aaaaaa",
        align: "center",
      })
      .setOrigin(0.5);

    // Tecla C
    const dashText = this.add
      .text(270, -20, "C", {
        fontFamily: '"Press Start 2P", Arial',
        fontSize: "14px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    const dashDesc = this.add
      .text(270, 10, "Dash", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#aaaaaa",
        align: "center",
      })
      .setOrigin(0.5);

    // Texto adicional de objetivo
    const goalText = this.add
      .text(0, 50, "Colete moedas, derrote monstros e sobreviva!", {
        fontFamily: '"Press Start 2P", Arial',
        fontSize: "10px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    // Adiciona todos os textos ao container
    container.add([moveText, moveDesc, jumpText, jumpDesc, shieldText, shieldDesc, attackText, attackDesc, dashText, dashDesc, goalText]);
  }

  // Método para iniciar o jogo com efeito de transição
  startGame() {
    // Efeito de flash branco
    const flash = this.add.rectangle(400, 300, 800, 600, 0xffffff, 0);

    this.tweens.add({
      targets: flash,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        // Inicia a cena de jogo com o nome do jogador
        this.scene.start("GameScene", { playerName: this.playerName });
      },
    });
  }
}

export default WelcomeScene;
