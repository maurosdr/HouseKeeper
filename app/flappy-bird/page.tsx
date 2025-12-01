'use client';

import { useEffect, useRef, useState } from 'react';

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

export default function FlappyBird() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const handCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [handsLoaded, setHandsLoaded] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [handDetected, setHandDetected] = useState(false);

  // Game state refs
  const handYRef = useRef<number>(0.5); // Posição Y normalizada da mão (0 = topo, 1 = fundo)
  const birdYRef = useRef<number>(250); // Posição Y do pássaro
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const gameStartedRef = useRef(false);

  // Constantes do jogo
  const BIRD_X = 100;
  const BIRD_SIZE = 40;
  const PIPE_WIDTH = 80;
  const PIPE_GAP = 180;
  const PIPE_SPEED = 3;
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;

  useEffect(() => {
    const loadMediaPipe = async () => {
      try {
        const script1 = document.createElement('script');
        script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
        script1.crossOrigin = 'anonymous';
        document.body.appendChild(script1);

        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';
        script2.crossOrigin = 'anonymous';
        document.body.appendChild(script2);

        const script3 = document.createElement('script');
        script3.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
        script3.crossOrigin = 'anonymous';
        document.body.appendChild(script3);

        await new Promise<void>((resolve) => {
          script3.onload = () => {
            setTimeout(resolve, 500);
          };
        });

        setHandsLoaded(true);
      } catch (err) {
        console.error('Erro ao carregar MediaPipe:', err);
        setError('Erro ao carregar bibliotecas de detecção');
        setIsLoading(false);
      }
    };

    loadMediaPipe();
  }, []);

  useEffect(() => {
    if (!handsLoaded) return;

    let hands: any;
    let camera: any;

    const initCamera = async () => {
      try {
        const video = videoRef.current;
        const handCanvas = handCanvasRef.current;

        if (!video || !handCanvas) return;

        // @ts-ignore
        const { Hands } = window;
        // @ts-ignore
        const { Camera } = window;
        // @ts-ignore
        const { drawConnectors, drawLandmarks } = window;
        // @ts-ignore
        const { HAND_CONNECTIONS } = window;

        if (!Hands || !Camera) {
          throw new Error('MediaPipe não está disponível');
        }

        hands = new Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7
        });

        hands.onResults((results: any) => {
          const handCanvasCtx = handCanvas.getContext('2d');
          if (!handCanvasCtx) return;

          handCanvasCtx.save();
          handCanvasCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
          handCanvasCtx.drawImage(results.image, 0, 0, handCanvas.width, handCanvas.height);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Desenhar mão
            drawConnectors(handCanvasCtx, landmarks, HAND_CONNECTIONS, {
              color: '#00FF00',
              lineWidth: 3
            });
            drawLandmarks(handCanvasCtx, landmarks, {
              color: '#FF0000',
              lineWidth: 1,
              radius: 3
            });

            // Calcular altura média da mão (usar o pulso como referência)
            const wrist = landmarks[0];
            handYRef.current = wrist.y; // 0 = topo, 1 = fundo
            setHandDetected(true);
          } else {
            setHandDetected(false);
          }

          handCanvasCtx.restore();
        });

        camera = new Camera(video, {
          onFrame: async () => {
            if (video && hands) {
              await hands.send({ image: video });
            }
          },
          width: 640,
          height: 480
        });

        await camera.start();
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao iniciar câmera:', err);
        setError('Erro ao acessar a câmera. Verifique as permissões.');
        setIsLoading(false);
      }
    };

    initCamera();

    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, [handsLoaded]);

  // Game loop
  useEffect(() => {
    const gameCanvas = gameCanvasRef.current;
    if (!gameCanvas) return;

    const ctx = gameCanvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const drawBird = () => {
      if (!ctx) return;

      ctx.save();

      // Corpo do pássaro
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(BIRD_X + BIRD_SIZE / 2, birdYRef.current, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // Olho
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(BIRD_X + BIRD_SIZE / 2 + 10, birdYRef.current - 5, 4, 0, Math.PI * 2);
      ctx.fill();

      // Bico
      ctx.fillStyle = '#FF6347';
      ctx.beginPath();
      ctx.moveTo(BIRD_X + BIRD_SIZE / 2 + 15, birdYRef.current);
      ctx.lineTo(BIRD_X + BIRD_SIZE / 2 + 25, birdYRef.current - 3);
      ctx.lineTo(BIRD_X + BIRD_SIZE / 2 + 25, birdYRef.current + 3);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const drawPipes = () => {
      if (!ctx) return;

      pipesRef.current.forEach(pipe => {
        // Cano superior
        ctx.fillStyle = '#2ECC40';
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);

        // Cano inferior
        ctx.fillStyle = '#2ECC40';
        ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, GAME_HEIGHT - pipe.gapY - PIPE_GAP);
        ctx.strokeStyle = '#228B22';
        ctx.strokeRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, GAME_HEIGHT - pipe.gapY - PIPE_GAP);
      });
    };

    const checkCollision = (): boolean => {
      const birdY = birdYRef.current;

      // Colisão com topo e fundo
      if (birdY - BIRD_SIZE / 2 <= 0 || birdY + BIRD_SIZE / 2 >= GAME_HEIGHT) {
        return true;
      }

      // Colisão com canos
      for (const pipe of pipesRef.current) {
        if (
          BIRD_X + BIRD_SIZE > pipe.x &&
          BIRD_X < pipe.x + PIPE_WIDTH
        ) {
          if (
            birdY - BIRD_SIZE / 2 < pipe.gapY ||
            birdY + BIRD_SIZE / 2 > pipe.gapY + PIPE_GAP
          ) {
            return true;
          }
        }
      }

      return false;
    };

    const gameLoop = () => {
      if (!ctx) return;

      // Limpar canvas
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      if (!gameStartedRef.current) {
        // Tela de início
        drawBird();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Mostre sua mão para começar!', GAME_WIDTH / 2, GAME_HEIGHT / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Mova sua mão para cima e para baixo', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);

        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      if (gameOverRef.current) {
        // Tela de game over
        drawBird();
        drawPipes();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30);
        ctx.font = '30px Arial';
        ctx.fillText(`Pontuação: ${scoreRef.current}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
        ctx.font = '20px Arial';
        ctx.fillText('Clique em Reiniciar para jogar novamente', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);

        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      // Atualizar posição do pássaro baseado na mão
      const targetY = handYRef.current * GAME_HEIGHT;
      birdYRef.current = targetY;

      // Atualizar canos
      pipesRef.current = pipesRef.current.filter(pipe => pipe.x + PIPE_WIDTH > 0);
      pipesRef.current.forEach(pipe => {
        pipe.x -= PIPE_SPEED;

        // Verificar se passou pelo cano
        if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
          pipe.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }
      });

      // Adicionar novo cano
      if (pipesRef.current.length === 0 || pipesRef.current[pipesRef.current.length - 1].x < GAME_WIDTH - 300) {
        const gapY = Math.random() * (GAME_HEIGHT - PIPE_GAP - 200) + 100;
        pipesRef.current.push({
          x: GAME_WIDTH,
          gapY,
          passed: false
        });
      }

      // Verificar colisão
      if (checkCollision()) {
        gameOverRef.current = true;
        setGameOver(true);
      }

      // Desenhar
      drawPipes();
      drawBird();

      // Desenhar pontuação
      ctx.fillStyle = '#000';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${scoreRef.current}`, 20, 50);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Detectar quando a mão é detectada para iniciar o jogo
  useEffect(() => {
    if (handDetected && !gameStartedRef.current && !gameOverRef.current) {
      gameStartedRef.current = true;
      setGameStarted(true);
    }
  }, [handDetected]);

  const restartGame = () => {
    birdYRef.current = 250;
    pipesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    gameOverRef.current = false;
    setGameOver(false);
    gameStartedRef.current = false;
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">🐦 Flappy Bird com Mão</h1>
            <p className="text-lg opacity-90">
              Controle o pássaro com a altura da sua mão!
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="font-bold">Erro:</p>
                <p>{error}</p>
              </div>
            )}

            {isLoading && !error && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <p className="text-gray-600 text-lg">Carregando câmera...</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Canvas do jogo */}
              <div className="order-1 lg:order-1">
                <div className="bg-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-800">Jogo</h2>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-blue-600">
                        🏆 {score}
                      </div>
                      {gameOver && (
                        <button
                          onClick={restartGame}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          🔄 Reiniciar
                        </button>
                      )}
                    </div>
                  </div>
                  <canvas
                    ref={gameCanvasRef}
                    width={GAME_WIDTH}
                    height={GAME_HEIGHT}
                    className="w-full rounded-lg border-4 border-blue-300 shadow-lg"
                  />

                  {/* Status da detecção */}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${handDetected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                    <span className="text-sm font-semibold text-gray-700">
                      {handDetected ? '✅ Mão detectada' : '❌ Mostre sua mão'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Canvas da câmera */}
              <div className="order-2 lg:order-2">
                <div className="bg-gray-100 rounded-xl p-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Câmera</h2>
                  <video
                    ref={videoRef}
                    className="hidden"
                    playsInline
                  />
                  <canvas
                    ref={handCanvasRef}
                    width="640"
                    height="480"
                    className="w-full rounded-lg border-4 border-green-300 shadow-lg"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-3">
                🎮 Como jogar:
              </h2>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">1️⃣</span>
                  <span>Mostre sua mão para a câmera para começar o jogo</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2️⃣</span>
                  <span>Mova sua mão para CIMA para o pássaro subir</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3️⃣</span>
                  <span>Mova sua mão para BAIXO para o pássaro descer</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4️⃣</span>
                  <span>Desvie dos canos verdes para marcar pontos</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⚠️</span>
                  <span>Não bata nos canos nem nas bordas!</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 bg-yellow-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-yellow-900 mb-3">
                💡 Dicas:
              </h2>
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Mantenha sua mão sempre visível para a câmera</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Use movimentos suaves para melhor controle</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Boa iluminação ajuda na detecção</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
