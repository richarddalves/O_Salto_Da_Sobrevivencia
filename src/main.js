/**
 * O Salto da Sobrevivência: Desafio das Dimensões
 * Um jogo de plataforma desafiador com estética retrô
 *
 * Este arquivo configura o jogo e carrega todas as cenas
 */

// Importação das cenas
import WelcomeScene from "./scenes/WelcomeScene.js";
import GameScene from "./scenes/GameScene.js";
import GameOverScene from "./scenes/GameOverScene.js";

// Configuração do jogo
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container", // Especifica o elemento HTML que conterá o jogo
  pixelArt: true, // Melhora a renderização de pixel art
  physics: {
    default: "arcade", // Sistema de física simples
    arcade: {
      gravity: { y: 1200 }, // Gravidade mais alta para queda mais rápida
      debug: false, // Define como true para visualizar hitboxes durante o desenvolvimento
    },
  },
  // Configurações para antialias para melhorar a aparência retrô
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
  // Array com todas as cenas do jogo
  scene: [WelcomeScene, GameScene, GameOverScene],
};

// Inicialização do jogo
const game = new Phaser.Game(config);

// Variáveis globais para compartilhar entre cenas
game.globals = {
  // Placar para guardar a pontuação entre cenas
  score: 0,
  // Maior pontuação da sessão
  highScore: 0,
  // Dificuldade (aumenta com o progresso)
  difficulty: 1,
  // Controlador de efeitos visuais
  effects: true,
  // Tempo total de jogo
  gameTime: 0,
  // Moedas coletadas
  coinsCollected: 0,
  // Estado do jogo
  gameState: {
    playerPosition: { x: 100, y: 450 },
    checkpoints: [],
    powerups: [],
  },
};

// Registra as dimensões do jogo para uso nas cenas
game.config.centerX = Math.floor(config.width / 2);
game.config.centerY = Math.floor(config.height / 2);

// Previne comportamentos padrão de algumas teclas
window.addEventListener(
  "keydown",
  function (e) {
    // Evita que as setas do teclado façam scroll na página
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
  },
  false
);

// Adiciona detecção de redimensionamento de tela
window.addEventListener("resize", () => {
  if (game.scale) {
    game.scale.refresh();
  }
});

// Exporta o objeto do jogo para ser acessível globalmente
export default game;
