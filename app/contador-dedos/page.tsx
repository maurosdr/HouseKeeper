'use client';

import { useEffect, useRef, useState } from 'react';

export default function ContadorDedos() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fingerCount, setFingerCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [handsLoaded, setHandsLoaded] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let hands: any;
    let camera: any;

    const loadMediaPipe = async () => {
      try {
        // Carregar scripts do MediaPipe
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

        // Aguardar carregamento
        await new Promise<void>((resolve) => {
          script3.onload = () => {
            setTimeout(resolve, 500); // Aguardar um pouco mais para garantir
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

    let animationFrameId: number;
    let hands: any;
    let camera: any;

    const initCamera = async () => {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        // @ts-ignore - MediaPipe é carregado via CDN
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
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
          const canvasCtx = canvas.getContext('2d');
          if (!canvasCtx) return;

          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
          canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

          if (results.multiHandLandmarks) {
            let totalFingers = 0;

            for (const landmarks of results.multiHandLandmarks) {
              // Desenhar conexões e landmarks
              drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 5
              });
              drawLandmarks(canvasCtx, landmarks, {
                color: '#FF0000',
                lineWidth: 2
              });

              // Contar dedos levantados
              const fingers = countFingers(landmarks);
              totalFingers += fingers;
            }

            setFingerCount(totalFingers);
          } else {
            setFingerCount(0);
          }

          canvasCtx.restore();
        });

        camera = new Camera(video, {
          onFrame: async () => {
            if (video && hands) {
              await hands.send({ image: video });
            }
          },
          width: 1280,
          height: 720
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
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [handsLoaded]);

  // Função para contar dedos levantados
  const countFingers = (landmarks: any[]): number => {
    let count = 0;

    // Pontos dos landmarks da mão
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const thumbMcp = landmarks[2];

    const indexTip = landmarks[8];
    const indexPip = landmarks[6];

    const middleTip = landmarks[12];
    const middlePip = landmarks[10];

    const ringTip = landmarks[16];
    const ringPip = landmarks[14];

    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];

    const wrist = landmarks[0];

    // Verificar se é mão esquerda ou direita
    const isRightHand = thumbTip.x < landmarks[17].x;

    // Polegar (lógica diferente)
    if (isRightHand) {
      if (thumbTip.x < thumbIp.x) count++;
    } else {
      if (thumbTip.x > thumbIp.x) count++;
    }

    // Indicador
    if (indexTip.y < indexPip.y) count++;

    // Médio
    if (middleTip.y < middlePip.y) count++;

    // Anelar
    if (ringTip.y < ringPip.y) count++;

    // Mindinho
    if (pinkyTip.y < pinkyPip.y) count++;

    return count;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">🖐️ Contador de Dedos</h1>
            <p className="text-lg opacity-90">
              Mostre sua mão para a câmera e veja a mágica acontecer!
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
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
                <p className="text-gray-600 text-lg">Carregando câmera...</p>
              </div>
            )}

            <div className="relative">
              <video
                ref={videoRef}
                className="hidden"
                playsInline
              />
              <canvas
                ref={canvasRef}
                width="1280"
                height="720"
                className="w-full rounded-xl shadow-lg border-4 border-purple-200"
              />
            </div>

            <div className="mt-8 text-center">
              <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 shadow-xl">
                <p className="text-white text-xl mb-2 font-semibold">
                  Dedos detectados:
                </p>
                <div className="text-8xl font-bold text-white animate-pulse">
                  {fingerCount}
                </div>
                <div className="mt-4 text-white text-lg">
                  {fingerCount === 0 && '✋ Mostre sua mão!'}
                  {fingerCount === 1 && '☝️ Um dedo'}
                  {fingerCount === 2 && '✌️ Dois dedos'}
                  {fingerCount === 3 && '🤟 Três dedos'}
                  {fingerCount === 4 && '🖖 Quatro dedos'}
                  {fingerCount === 5 && '🖐️ Cinco dedos'}
                  {fingerCount > 5 && '👏 Duas mãos!'}
                </div>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-3">
                💡 Dicas de uso:
              </h2>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Mantenha sua mão bem iluminada</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Posicione a mão a uma distância confortável da câmera</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Você pode usar uma ou duas mãos</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Mantenha os dedos bem separados para melhor detecção</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
