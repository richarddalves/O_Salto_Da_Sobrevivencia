/**
 * GameOverScene.js
 * Cena de fim de jogo para "O Salto da Sobrevivência: Desafio das Dimensões"
 * Mostra resultados, estatísticas e opções para o jogador continuar
 */
class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  // Recebe dados da cena anterior
  init(data) {
    this.win = data.win || false;
    this.playerName = data.playerName || "Jogador";
  }

  create() {
    // ===== CONFIGURAÇÃO DE FUNDO =====
    // Adiciona o fundo com efeito de cor baseado no resultado (azul para vitória, vermelho para derrota)
    this.background = this.add.tileSprite(400, 300, 1200, 400, "fundo");
    this.background.setScale(0.7);
    this.background.setTint(this.win ? 0x5588ff : 0x884444);

    // Camada escura para destacar elementos de UI
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    // Efeito de scanlines retrô
    this.createRetroEffect();

    // ===== TÍTULO DA TELA =====
    // Texto principal com estilo retrô
    const title = this.win ? "MISSÃO COMPLETA!" : "GAME OVER";

    // Container para o título
    this.titleContainer = this.add.container(400, 100);

    // Fundo do título com estilo arcade
    const titleBg = this.add.rectangle(0, 0, 600, 80, 0x000000, 0.8);
    titleBg.setStrokeStyle(6, this.win ? 0xffff00 : 0xff0000);
    this.titleContainer.add(titleBg);

    // Texto do título com estilo pixelado
    const titleText = this.add
      .text(0, 0, title, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "36px",
        color: this.win ? "#ffff00" : "#ff0000",
        align: "center",
        shadow: { offsetX: 3, offsetY: 3, color: "#000000", blur: 5, fill: true },
      })
      .setOrigin(0.5);
    this.titleContainer.add(titleText);

    // Efeito de pulso no título
    this.tweens.add({
      targets: titleText,
      scale: { from: 1, to: 1.05 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // ===== NOME DO JOGADOR =====
    // Exibe o nome do jogador
    const nameContainer = this.add.container(400, 155);

    // Fundo para o nome
    const nameBg = this.add.rectangle(0, 0, 400, 30, 0x333333, 0.8);
    nameBg.setStrokeStyle(2, 0xaaaaaa);
    nameContainer.add(nameBg);

    // Texto com o nome
    const nameText = this.add
      .text(0, 0, this.playerName, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);
    nameContainer.add(nameText);

    // Efeito de piscar nas bordas do nome
    this.tweens.add({
      targets: nameBg,
      strokeAlpha: { from: 0.3, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // ===== ESTATÍSTICAS DO JOGO =====
    // Recupera dados da sessão atual
    const score = this.game.globals.score;
    const highScore = this.game.globals.highScore;
    const coinsCollected = this.game.globals.coinsCollected;
    const gameTime = this.game.globals.gameTime;

    // Container para estatísticas
    const statsContainer = this.add.container(400, 250);

    // Fundo para estatísticas com estilo mais retrô
    const statsBg = this.add.rectangle(0, 0, 500, 200, 0x222222, 0.8);
    statsBg.setStrokeStyle(2, 0x00ffff);
    statsContainer.add(statsBg);

    // Adiciona "scanlines" ao fundo das estatísticas para mais estilo retrô
    for (let i = 0; i < 20; i++) {
      if (i % 2 === 0) {
        const line = this.add.rectangle(0, -100 + i * 10, 500, 1, 0x00ffff, 0.1);
        statsContainer.add(line);
      }
    }

    // Cabeçalho da seção com efeito de "glow"
    const statsTitle = this.add
      .text(0, -80, "ESTATÍSTICAS", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "24px",
        color: "#00ffff",
        align: "center",
        shadow: { offsetX: 0, offsetY: 0, color: "#00ffff", blur: 10, fill: true },
      })
      .setOrigin(0.5);
    statsContainer.add(statsTitle);

    // Pontuação atual
    const scoreText = this.add.text(-180, -40, "PONTUAÇÃO:", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "16px",
      color: "#ffffff",
      align: "left",
    });
    statsContainer.add(scoreText);

    const scoreValue = this.add
      .text(180, -40, score.toString(), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        color: "#ffff00",
        align: "right",
        shadow: { offsetX: 1, offsetY: 1, color: "#000000", blur: 0, fill: true },
      })
      .setOrigin(1, 0);
    statsContainer.add(scoreValue);

    // Melhor pontuação
    const highScoreText = this.add.text(-180, -10, "RECORDE:", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "16px",
      color: "#ffffff",
      align: "left",
    });
    statsContainer.add(highScoreText);

    const highScoreValue = this.add
      .text(180, -10, highScore.toString(), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        color: score === highScore ? "#00ff00" : "#ffff00",
        align: "right",
        shadow: { offsetX: 1, offsetY: 1, color: "#000000", blur: 0, fill: true },
      })
      .setOrigin(1, 0);
    statsContainer.add(highScoreValue);

    // Moedas coletadas com ícone
    const coinsText = this.add.text(-180, 20, "MOEDAS:", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "16px",
      color: "#ffffff",
      align: "left",
    });
    statsContainer.add(coinsText);

    // Adiciona uma pequena moeda ao lado do texto de moedas
    const coinIcon = this.add.image(120, 28, "moeda").setScale(0.08);
    coinIcon.setAlpha(0.8);
    statsContainer.add(coinIcon);

    // Animação de rotação para a moeda
    this.tweens.add({
      targets: coinIcon,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: "Linear",
    });

    const coinsValue = this.add
      .text(180, 20, coinsCollected.toString(), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        color: "#ffff00",
        align: "right",
        shadow: { offsetX: 1, offsetY: 1, color: "#000000", blur: 0, fill: true },
      })
      .setOrigin(1, 0);
    statsContainer.add(coinsValue);

    // Tempo de jogo com estilo de relógio digital
    const timeText = this.add.text(-180, 50, "TEMPO:", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "16px",
      color: "#ffffff",
      align: "left",
    });
    statsContainer.add(timeText);

    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;

    // Container para o relógio digital
    const clockContainer = this.add.container(145, 59);
    statsContainer.add(clockContainer);

    // Fundo do relógio
    const clockBg = this.add.rectangle(0, 0, 90, 25, 0x000000, 1);
    clockBg.setStrokeStyle(1, 0x00ffff);
    clockContainer.add(clockBg);

    // Texto do relógio
    const timeValue = this.add
      .text(0, 0, `${minutes}:${seconds.toString().padStart(2, "0")}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "14px",
        color: "#00ff00",
        align: "center",
      })
      .setOrigin(0.5);
    clockContainer.add(timeValue);

    // Efeito de piscar para o relógio digital
    this.tweens.add({
      targets: clockBg,
      strokeAlpha: { from: 0.3, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Status (se bateu o recorde)
    let statusText;
    if (this.win) {
      statusText = "NÍVEL CONCLUÍDO!";
    } else if (score === highScore && score > 0) {
      statusText = "NOVO RECORDE!";
    } else {
      statusText = "TENTE NOVAMENTE...";
    }

    const gameStatus = this.add
      .text(0, 90, statusText, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "18px",
        color: this.win ? "#00ff00" : "#aaaaaa",
        align: "center",
        shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 2, fill: true },
      })
      .setOrigin(0.5);
    statsContainer.add(gameStatus);

    // Efeito de destaque no novo recorde
    if (score === highScore && score > 0) {
      this.tweens.add({
        targets: gameStatus,
        scale: { from: 1, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }

    // Medalha para jogadores com pontuação alta
    if (score > 300) {
      const medalContainer = this.add.container(-220, 90);
      statsContainer.add(medalContainer);

      // Fundo da medalha
      const medalBg = this.add.circle(0, 0, 25, 0xffaa00);
      medalBg.setStrokeStyle(2, 0xffffff);
      medalContainer.add(medalBg);

      // Estrela dentro da medalha
      const star = this.add.star(0, 0, 5, 10, 20, 0xffffff);
      medalContainer.add(star);

      // Texto "TOP SCORE"
      const medalText = this.add
        .text(40, 0, "TOP SCORE", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "12px",
          color: "#ffaa00",
          align: "left",
        })
        .setOrigin(0, 0.5);
      medalContainer.add(medalText);

      // Rotação da estrela
      this.tweens.add({
        targets: star,
        angle: 360,
        duration: 3000,
        repeat: -1,
        ease: "Linear",
      });

      // Brilho na medalha
      this.tweens.add({
        targets: medalBg,
        scale: { from: 1, to: 1.1 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
      });
    }

    // ===== EFEITOS VISUAIS =====
    // Adiciona efeitos diferentes baseados no resultado
    if (this.win) {
      this.createVictoryEffects();
    } else {
      this.createDefeatEffects();
    }

    // ===== BOTÕES DE MENU =====
    // Container de botões com estilo arcade
    this.buttonsContainer = this.add.container(400, 410);

    // Botão de jogar novamente
    const replayButton = this.createButton(0, 0, "JOGAR NOVAMENTE", () => {
      this.scene.start("GameScene", { playerName: this.playerName });
    });
    this.buttonsContainer.add(replayButton);

    // Botão de menu principal
    const menuButton = this.createButton(0, 80, "MENU PRINCIPAL", () => {
      this.scene.start("WelcomeScene");
    });
    this.buttonsContainer.add(menuButton);

    // Animação de entrada para os botões
    this.buttonsContainer.setAlpha(0);
    this.buttonsContainer.setScale(0.8);

    this.tweens.add({
      targets: this.buttonsContainer,
      alpha: 1,
      scale: 1,
      duration: 800,
      delay: 500,
      ease: "Back.easeOut",
    });

    // ===== PERSONAGEM ANIMADO =====
    // Posição do personagem e animação dependem do resultado
    if (this.win) {
      this.createVictoryCharacter();
    } else {
      this.createDefeatCharacter();
    }

    // ===== DICAS ALEATÓRIAS COM ESTILO RETRÔ =====
    const tips = ["Use o escudo (Z) para atravessar áreas perigosas.", "Pule em cima dos monstros para derrotá-los.", "Colete todas as moedas possíveis para maximizar sua pontuação.", "O dash (C) permite atravessar rapidamente áreas perigosas.", "Alguns monstros perseguem você. Use o ataque (X) para derrotá-los!", "Os checkpoints salvam seu progresso para não precisar reiniciar.", "Nas plataformas que desaparecem, pule rapidamente para não cair.", "Tente o pulo duplo pressionando pular enquanto estiver no ar.", "Nas zonas de baixa gravidade, você pode pular muito mais alto.", "O boss precisa ser atingido várias vezes para ser derrotado."];

    const randomTip = "DICA: " + tips[Math.floor(Math.random() * tips.length)];

    // Container para a dica
    const tipContainer = this.add.container(400, 540);

    // Fundo da dica com efeito de terminal
    const tipBg = this.add.rectangle(0, 0, 700, 40, 0x222222, 0.8);
    tipBg.setStrokeStyle(1, 0x00ff00);
    tipContainer.add(tipBg);

    // Texto da dica com fonte monospace para parecer terminal
    const tipText = this.add
      .text(0, 0, randomTip, {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#00ff00",
        align: "center",
      })
      .setOrigin(0.5);
    tipContainer.add(tipText);

    // Efeito de digitação para a dica
    tipText.setText("");
    let tipIndex = 0;

    this.time.addEvent({
      delay: 50,
      callback: () => {
        if (tipIndex < randomTip.length) {
          tipText.setText(tipText.text + randomTip[tipIndex]);
          tipIndex++;
        }
      },
      repeat: randomTip.length - 1,
      startAt: 1000,
    });

    // ===== CRÉDITOS =====
    const creditsText = this.add
      .text(400, 580, "Desenvolvido por Richard Alves - Projeto da Semana 4 - Inteli", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#aaaaaa",
        align: "center",
      })
      .setOrigin(0.5);

    // Efeito de fade in nos créditos
    creditsText.setAlpha(0);
    this.tweens.add({
      targets: creditsText,
      alpha: 0.7,
      duration: 1000,
      delay: 2000,
    });

    // ===== ATALHOS DE TECLADO =====
    // Teclas de atalho para as ações principais
    this.input.keyboard.on("keydown-ENTER", () => {
      this.scene.start("GameScene", { playerName: this.playerName });
    });

    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.start("WelcomeScene");
    });

    // ===== OVERLAY DE TV RETRÔ =====
    this.createCRTOverlay();
  }

  update() {
    // Efeito de movimento do fundo
    this.background.tilePositionX += this.win ? 0.5 : 0.2;

    // Atualiza efeitos retrô
    this.updateRetroEffect();
  }

  // Cria efeito retrô de scanlines
  createRetroEffect() {
    // Scanlines
    this.scanlines = [];
    for (let i = 0; i < 150; i++) {
      if (i % 2 === 0) {
        const line = this.add.rectangle(400, i * 4, 800, 1, 0x000000, 0.2).setDepth(100);
        this.scanlines.push(line);
      }
    }

    // Efeito de abaulamento CRT nas bordas
    this.crtEffect = this.add.rectangle(400, 300, 820, 620, 0x000000, 0);
    this.crtEffect.setStrokeStyle(10, 0x222222, 0.5);

    // Vinheta (escurecimento nas bordas)
    this.vignette = this.add.graphics().fillStyle(0x000000, 0.4).fillCircle(400, 300, 800).setBlendMode("MULTIPLY").setDepth(99);
  }

  // Cria efeito de TV CRT
  createCRTOverlay() {
    // Cria uma grade com "pixels" como uma TV antiga
    const pixelSize = 3;
    for (let x = 0; x < 800; x += pixelSize) {
      for (let y = 0; y < 600; y += pixelSize) {
        if (Math.random() > 0.997) {
          // Pixels "queimados" aleatórios
          this.add.rectangle(x, y, pixelSize, pixelSize, 0xffffff, 0.5).setDepth(101);
        }
      }
    }

    // Efeito de "curvatura" nos cantos
    const cornerSize = 100;
    // Cantos escuros
    this.add.rectangle(0, 0, cornerSize, cornerSize, 0x000000, 0.5).setOrigin(0).setDepth(101);
    this.add.rectangle(800, 0, cornerSize, cornerSize, 0x000000, 0.5).setOrigin(1, 0).setDepth(101);
    this.add.rectangle(0, 600, cornerSize, cornerSize, 0x000000, 0.5).setOrigin(0, 1).setDepth(101);
    this.add.rectangle(800, 600, cornerSize, cornerSize, 0x000000, 0.5).setOrigin(1).setDepth(101);

    // Linhas de reflexão ocasionais (efeito de fita VHS)
    this.time.addEvent({
      delay: 3000,
      callback: this.createVHSEffect,
      callbackScope: this,
      loop: true,
    });
  }

  // Cria efeito de linha de VHS
  createVHSEffect() {
    if (Math.random() > 0.7) {
      const y = Math.random() * 600;
      const line = this.add.rectangle(400, y, 800, 2, 0xffffff, 0.3).setDepth(102);

      this.tweens.add({
        targets: line,
        alpha: 0,
        y: y + 50,
        duration: 500,
        onComplete: () => line.destroy(),
      });
    }
  }

  // Atualiza efeitos retrô
  updateRetroEffect() {
    // Efeito de falha aleatória (glitch)
    if (Math.random() > 0.995) {
      this.cameras.main.setAlpha(0.9);
      this.time.delayedCall(100, () => {
        this.cameras.main.setAlpha(1);
      });

      // Cria um efeito de "deslocamento horizontal" aleatório como um glitch de TV
      if (Math.random() > 0.6) {
        const offsetY = Math.floor(Math.random() * 600);
        const height = 5 + Math.floor(Math.random() * 20);
        const offsetX = -10 + Math.floor(Math.random() * 20);

        // Salva o conteúdo atual da câmera nessa linha
        const glitchLine = this.add.rectangle(400 + offsetX, offsetY, 800, height, 0xffffff, 0.3);
        glitchLine.setDepth(103);

        // Remove o glitch após um tempo curto
        this.time.delayedCall(150, () => {
          glitchLine.destroy();
        });
      }
    }
  }

  // Cria botão com estilo retrô de arcade
  createButton(x, y, text, callback) {
    const button = this.add.container(x, y);

    const buttonWidth = 320;
    const buttonHeight = 60;

    // Sombra do botão (para efeito 3D)
    const buttonShadow = this.add.rectangle(5, 5, buttonWidth, buttonHeight, 0x000000, 0.5);
    button.add(buttonShadow);

    // Fundo do botão com gradiente
    const buttonBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x222222, 1);
    buttonBg.setStrokeStyle(3, 0x00ffff);
    button.add(buttonBg);

    // Brilho interno do botão
    const buttonGlow = this.add.rectangle(0, 0, buttonWidth - 10, buttonHeight - 10, 0x00ffff, 0.1);
    button.add(buttonGlow);

    // Texto do botão com sombra
    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        color: "#ffffff",
        align: "center",
        shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 0, fill: true },
      })
      .setOrigin(0.5);
    button.add(buttonText);

    // Borda pixelada ao redor do botão para efeito arcade
    // Adiciona pequenos quadrados nos cantos
    const cornerSize = 4;
    // Superior esquerdo
    const topLeft = this.add.rectangle(-buttonWidth / 2 - cornerSize / 2, -buttonHeight / 2 - cornerSize / 2, cornerSize, cornerSize, 0x00ffff);
    // Superior direito
    const topRight = this.add.rectangle(buttonWidth / 2 + cornerSize / 2, -buttonHeight / 2 - cornerSize / 2, cornerSize, cornerSize, 0x00ffff);
    // Inferior esquerdo
    const bottomLeft = this.add.rectangle(-buttonWidth / 2 - cornerSize / 2, buttonHeight / 2 + cornerSize / 2, cornerSize, cornerSize, 0x00ffff);
    // Inferior direito
    const bottomRight = this.add.rectangle(buttonWidth / 2 + cornerSize / 2, buttonHeight / 2 + cornerSize / 2, cornerSize, cornerSize, 0x00ffff);

    button.add([topLeft, topRight, bottomLeft, bottomRight]);

    // Interatividade
    buttonBg
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        buttonBg.fillColor = 0x333333;
        buttonText.setTint(0x00ffff);
        button.setScale(1.05);
        buttonBg.setStrokeStyle(3, 0x00ffff);

        // Efeito de brilho ao passar o mouse
        this.tweens.add({
          targets: buttonGlow,
          alpha: { from: 0.1, to: 0.3 },
          duration: 200,
        });
      })
      .on("pointerout", () => {
        buttonBg.fillColor = 0x222222;
        buttonText.clearTint();
        button.setScale(1);
        buttonBg.setStrokeStyle(3, 0x00ffff);

        // Remove o brilho ao sair
        this.tweens.add({
          targets: buttonGlow,
          alpha: 0.1,
          duration: 200,
        });
      })
      .on("pointerdown", () => {
        buttonBg.fillColor = 0x444444;
        button.setScale(0.95);

        // Efeito de pressionar o botão
        buttonBg.y += 3;
        buttonText.y += 3;
        buttonGlow.y += 3;
      })
      .on("pointerup", () => {
        buttonBg.fillColor = 0x333333;
        button.setScale(1.05);

        // Restaura posição dos elementos do botão
        buttonBg.y -= 3;
        buttonText.y -= 3;
        buttonGlow.y -= 3;

        callback();
      });

    return button;
  }

  // Efeitos visuais para vitória
  createVictoryEffects() {
    // Confetes caindo do topo
    const confettiColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

    for (let i = 0; i < 3; i++) {
      this.add.particles(200 + i * 200, -10, "brilho", {
        frame: 0,
        lifespan: 5000,
        speed: { min: 100, max: 200 },
        angle: { min: 80, max: 100 },
        scale: { start: 0.1, end: 0.05 },
        gravityY: 100,
        tint: confettiColors,
        quantity: 1,
        frequency: 200,
      });
    }

    // Estrelas brilhantes ao redor da tela
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 600;
      const star = this.add.image(x, y, "brilho").setScale(0.1).setAlpha(0.7);

      // Efeito de pulsação
      this.tweens.add({
        targets: star,
        scale: { from: 0.1, to: 0.2 },
        alpha: { from: 0.7, to: 0.3 },
        duration: 1000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // Banner "VITÓRIA" piscando no topo
    const victoryBanner = this.add
      .text(400, 50, "VITÓRIA!", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "24px",
        color: "#ffff00",
        align: "center",
        shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 2, fill: true },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: victoryBanner,
      alpha: { from: 1, to: 0.3 },
      scale: { from: 1, to: 1.1 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Efeito de "chuva" digital (Matrix style)
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 150;

      this.time.addEvent({
        delay: 200 + i * 100,
        callback: () => {
          this.createDigitalRain(x);
        },
        callbackScope: this,
        loop: true,
      });
    }
  }

  // Cria o efeito de "chuva digital" como Matrix
  createDigitalRain(x) {
    const digitChars = "10";
    const digit = digitChars.charAt(Math.floor(Math.random() * digitChars.length));

    const y = -20;
    const digitText = this.add
      .text(x + Math.random() * 50, y, digit, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#00ff00",
        align: "center",
      })
      .setAlpha(0.7);

    this.tweens.add({
      targets: digitText,
      y: 620,
      alpha: { from: 0.7, to: 0 },
      duration: 2000,
      onComplete: () => digitText.destroy(),
    });
  }

  // Efeitos visuais para derrota
  createDefeatEffects() {
    // Faíscas e fogo ocasionais para ambiente de "destruição"
    for (let i = 0; i < 5; i++) {
      const x = 100 + Math.random() * 600;
      const y = 500 + Math.random() * 80;

      // Efeito de fogo/faísca
      this.add.particles(x, y, "brilho", {
        lifespan: 2000,
        speed: { min: 50, max: 100 },
        angle: { min: 240, max: 300 },
        scale: { start: 0.1, end: 0 },
        tint: [0xff6600, 0xff0000, 0xffff00],
        quantity: 1,
        frequency: 200 + Math.random() * 500,
      });
    }

    // Efeito de tela danificada
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 600;
      const width = 20 + Math.random() * 100;
      const height = 2 + Math.random() * 5;

      const glitch = this.add.rectangle(x, y, width, height, 0x888888, 0.3);

      // Pisca e se move aleatoriamente
      this.time.addEvent({
        delay: 2000 + Math.random() * 3000,
        loop: true,
        callback: () => {
          glitch.visible = !glitch.visible;
          glitch.x = Math.random() * 800;
          glitch.y = Math.random() * 600;
        },
      });
    }

    // Overlay vermelho pulsante
    const redOverlay = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.1);

    this.tweens.add({
      targets: redOverlay,
      alpha: { from: 0.1, to: 0.2 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Mensagem "SYSTEM FAILURE" piscando com efeito de computador quebrado
    const failureText = this.add
      .text(400, 30, "SYSTEM FAILURE", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ff0000",
        align: "center",
      })
      .setOrigin(0.5);

    // Animação piscante rápida
    this.tweens.add({
      targets: failureText,
      alpha: { from: 1, to: 0 },
      duration: 100,
      yoyo: true,
      repeat: -1,
    });

    // Código de erro estilo BSOD
    const errorCode = this.add
      .text(
        400,
        60,
        "ERR-0x" +
          Math.floor(Math.random() * 9999)
            .toString(16)
            .toUpperCase()
            .padStart(4, "0"),
        {
          fontFamily: "monospace",
          fontSize: "16px",
          color: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5);
  }

  // Cria animação do personagem para vitória
  createVictoryCharacter() {
    // Adiciona o personagem
    const player = this.add.sprite(650, 380, "personagem");
    player.setScale(0.4);

    // Anima caminhada
    player.play("walk");

    // Animação de vitória (pulo de alegria)
    this.tweens.add({
      targets: player,
      y: { from: 380, to: 320 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeOut",
    });

    // Alternando direção do sprite
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        player.flipX = !player.flipX;
      },
      loop: true,
    });

    // Partículas de celebração
    this.add.particles(player.x, player.y - 50, "brilho", {
      scale: { start: 0.1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      speed: 60,
      lifespan: 1000,
      frequency: 300,
      tint: 0xffff00,
    });

    // Adiciona um troféu ao lado do personagem
    const trophyContainer = this.add.container(680, 320);

    // Base do troféu
    const trophyBase = this.add.rectangle(0, 30, 40, 10, 0xffaa00);
    trophyContainer.add(trophyBase);

    // Corpo do troféu
    const trophyBody = this.add.rectangle(0, 15, 8, 30, 0xffaa00);
    trophyContainer.add(trophyBody);

    // Taça do troféu
    const trophyCup = this.add.rectangle(0, -5, 30, 20, 0xffaa00);
    trophyCup.setStrokeStyle(2, 0xffffff);
    trophyContainer.add(trophyCup);

    // Brilho do troféu
    const trophyShine = this.add.star(10, -10, 5, 3, 6, 0xffffff);
    trophyContainer.add(trophyShine);

    // Efeito de flutuação no troféu
    this.tweens.add({
      targets: trophyContainer,
      y: 310,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Efeito de brilho piscando
    this.tweens.add({
      targets: trophyShine,
      alpha: { from: 1, to: 0.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Texto "CAMPEÃO" acima do troféu
    const championText = this.add
      .text(680, 270, "CAMPEÃO", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        color: "#ffaa00",
        align: "center",
      })
      .setOrigin(0.5);

    // Efeito de escala
    this.tweens.add({
      targets: championText,
      scale: { from: 1, to: 1.2 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  // Cria animação do personagem para derrota
  createDefeatCharacter() {
    // Adiciona o personagem "derrotado"
    const player = this.add.sprite(650, 450, "personagem");
    player.setScale(0.4);
    player.setTint(0x888888);
    player.setRotation(Math.PI / 2); // Deitado

    // Efeito de "piscar" para mostrar que está derrotado
    this.tweens.add({
      targets: player,
      alpha: { from: 0.7, to: 0.5 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Espiral de "tontura" acima da cabeça
    const dizzyContainer = this.add.container(650, 400);

    // Desenha uma espiral usando pontos
    for (let i = 0; i < 360; i += 30) {
      const radius = 5 + i / 50;
      const x = Math.cos((i * Math.PI) / 180) * radius;
      const y = Math.sin((i * Math.PI) / 180) * radius;

      const point = this.add.circle(x, y, 2, 0xffff00);
      dizzyContainer.add(point);
    }

    // Faz a espiral girar
    this.tweens.add({
      targets: dizzyContainer,
      angle: 360,
      duration: 2000,
      repeat: -1,
    });

    // Pontos de interrogação ao redor (estilo confusão)
    for (let i = 0; i < 3; i++) {
      const questionMark = this.add.text(650 + (-30 + i * 30), 380, "?", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "20px",
        color: "#ff0000",
        align: "center",
      });

      // Anima cada ponto de interrogação
      this.tweens.add({
        targets: questionMark,
        y: 360,
        alpha: { from: 1, to: 0 },
        duration: 1000 + i * 200,
        yoyo: true,
        repeat: -1,
        delay: i * 300,
      });
    }
  }
}

export default GameOverScene;
