import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Scan } from 'lucide-react';
import { imageApi, recipeApi, historyApi, dietApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Recipe } from '../api/types';

interface CaptureScreenProps {
  onRecipesDetected: (recipes: Recipe[], imageUrl: string) => void;
}

export function CaptureScreen({ onRecipesDetected }: CaptureScreenProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [dietPreferences, setDietPreferences] = useState<string[]>([]);

  // Get user's first name for greeting
  const userName = user?.email?.split('@')[0] || 'Chef';

  // Fetch diet preferences on mount
  useEffect(() => {
    if (user?.user_id) {
      dietApi.fetchDietPreferences({ user_id: user.user_id })
        .then((response) => {
          setDietPreferences(response.diet_preferences || []);
        })
        .catch((err) => {
          console.error('Failed to fetch diet preferences:', err);
        });
    }
  }, [user?.user_id]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const preview = URL.createObjectURL(file);
      setPreviewImage(preview);

      const base64_jpg = await convertToBase64(file);

      const uploadResponse = await imageApi.uploadImage({ base64_jpg });
      const imageUrl = uploadResponse.path;

      if (!imageUrl) {
        throw new Error('Image upload response missing path');
      }

      const recipesResponse = await recipeApi.getRecipesList({
        url: imageUrl,
        diet_preferences: dietPreferences.length > 0 ? dietPreferences : undefined,
      });

      // Save to history
      if (user?.user_id && recipesResponse.ingredients && recipesResponse.ingredients.length > 0) {
        try {
          await historyApi.saveHistory({
            user_id: user.user_id,
            ingredients: recipesResponse.ingredients,
            recipes_count: recipesResponse.recipes?.length || 0,
          });
        } catch (historyError) {
          console.error('Failed to save history:', historyError);
          // Don't block the flow if history save fails
        }
      }

      onRecipesDetected(recipesResponse.recipes, imageUrl);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to process image. Please try again.');
      }
      setPreviewImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported in this browser. Please use the SCAN button to upload an image instead.');
      return;
    }

    try {
      setIsCameraReady(false);
      setIsCameraActive(true);
      setError(null);

      // First check if any video devices are available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      if (videoDevices.length === 0) {
        setError('No camera found on this device. Please use the SCAN button to upload an image instead.');
        setIsCameraActive(false);
        return;
      }

      console.log('Found video devices:', videoDevices.length);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Set a timeout in case onloadedmetadata never fires
        const timeout = setTimeout(() => {
          if (!isCameraReady) {
            console.error('Camera timeout - video never became ready');
            setError('Camera timed out. Please try again or use SCAN to upload an image.');
            stopCamera();
          }
        }, 10000); // 10 second timeout

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          clearTimeout(timeout);
          videoRef.current?.play()
            .then(() => {
              setIsCameraReady(true);
              console.log('Camera ready! Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
            })
            .catch((err) => {
              console.error('Error playing video:', err);
              setError('Unable to start camera preview. Please use SCAN to upload an image.');
              stopCamera();
            });
        };

        videoRef.current.onerror = () => {
          clearTimeout(timeout);
          console.error('Video element error');
          setError('Camera error. Please use SCAN to upload an image.');
          stopCamera();
        };
      }
    } catch (cameraError) {
      console.error('Camera error:', cameraError);
      setIsCameraActive(false);
      if (cameraError instanceof Error) {
        if (cameraError.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access in your browser settings, or use SCAN to upload an image.');
        } else if (cameraError.name === 'NotFoundError') {
          setError('No camera found. Please use the SCAN button to upload an image instead.');
        } else {
          setError(`Camera error: ${cameraError.message}. Please use SCAN to upload an image.`);
        }
      } else {
        setError('Unable to access camera. Please use SCAN to upload an image instead.');
      }
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }

    setIsCameraActive(false);
    setIsCameraReady(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      setError('Camera not ready. Please try again.');
      return;
    }

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    // Check if video has dimensions (is actually streaming)
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.error('Video dimensions are zero - camera not ready');
      setError('Camera not ready. Please wait a moment and try again.');
      return;
    }

    console.log('Capturing photo with dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);

    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    const context = canvasElement.getContext('2d');
    if (!context) {
      setError('Unable to capture photo. Please try again.');
      return;
    }

    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvasElement.toBlob((result) => resolve(result), 'image/jpeg', 0.9)
    );

    if (!blob) {
      setError('Unable to capture photo. Please try again.');
      return;
    }

    console.log('Photo captured, blob size:', blob.size);
    stopCamera();

    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
    await handleImageUpload(file);
  };

  const handleTakePhotoClick = () => {
    startCamera();
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-cream-200 dotted-bg relative overflow-hidden"
    >
      {/* Header with greeting */}
      <div className="px-6 pt-8 pb-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1
            className="text-3xl md:text-4xl font-bold text-olive-700"
            style={{ fontFamily: "'Fredoka', 'Poppins', sans-serif" }}
          >
            HELLO <span className="text-golden-500">{userName.toUpperCase()}</span>!
          </h1>
          <p className="text-olive-600 text-lg mt-1">let's Cook</p>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Loading State */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                className="w-24 h-24 border-4 border-olive-200 border-t-olive-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-olive-600 font-medium text-lg"
              >
                Analyzing your ingredients...
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-olive-500 text-sm mt-2"
              >
                This may take a moment
              </motion.p>
            </motion.div>
          ) : isCameraActive ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-[3/4] object-cover bg-black"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera overlay with scan lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-cream-100/50 rounded-2xl"></div>
                  <motion.div
                    className="absolute left-8 right-8 h-0.5 bg-golden-400/70"
                    initial={{ top: '10%' }}
                    animate={{ top: '90%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>

              {/* Camera status indicator */}
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl">
                  <div className="text-cream-100 text-center">
                    <motion.div
                      className="w-8 h-8 border-2 border-cream-100 border-t-transparent rounded-full mx-auto mb-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p>Starting camera...</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <motion.button
                  onClick={capturePhoto}
                  disabled={!isCameraReady}
                  className={`flex-1 py-4 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg ${
                    isCameraReady
                      ? 'bg-olive-600 text-cream-100'
                      : 'bg-olive-400 text-cream-200 cursor-not-allowed'
                  }`}
                  whileHover={isCameraReady ? { scale: 1.02 } : {}}
                  whileTap={isCameraReady ? { scale: 0.98 } : {}}
                >
                  <Camera size={20} />
                  {isCameraReady ? 'Capture' : 'Wait...'}
                </motion.button>
                <motion.button
                  onClick={stopCamera}
                  className="px-6 bg-cream-100 text-olive-600 py-4 rounded-full font-semibold shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md flex flex-col items-center"
            >
              {/* Preview Image or Scan Illustration */}
              {previewImage ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl mb-8 relative"
                >
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute top-4 right-4 bg-cream-100/90 p-2 rounded-full shadow-lg"
                  >
                    <X size={20} className="text-olive-600" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative mb-8"
                >
                  {/* Food/Ingredient Scan Illustration */}
                  <motion.div
                    className="w-56 h-56 md:w-64 md:h-64 relative"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Outer scanning circle */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-dashed border-olive-400/40"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Inner glow circle */}
                    <div className="absolute inset-3 rounded-full bg-gradient-to-br from-olive-100/50 to-golden-100/50" />

                    {/* Food icons container */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 120 120" className="w-40 h-40 md:w-44 md:h-44">
                        {/* Cooking pot */}
                        <ellipse cx="60" cy="85" rx="35" ry="8" fill="#BC6C25" opacity="0.3" />
                        <path d="M30 50 L30 75 Q30 90 60 90 Q90 90 90 75 L90 50 Z" fill="#606C38" />
                        <ellipse cx="60" cy="50" rx="30" ry="10" fill="#6B7A3D" />
                        <path d="M25 50 L20 45 M95 50 L100 45" stroke="#606C38" strokeWidth="4" strokeLinecap="round" />

                        {/* Steam lines */}
                        <motion.path
                          d="M45 40 Q42 30 48 22"
                          stroke="#DDA15E"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                        />
                        <motion.path
                          d="M60 38 Q57 26 63 18"
                          stroke="#DDA15E"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                        />
                        <motion.path
                          d="M75 40 Q72 30 78 22"
                          stroke="#DDA15E"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                        />

                        {/* Carrot */}
                        <g transform="translate(-15, -10)">
                          <path d="M35 55 L28 70 L32 55 Z" fill="#DDA15E" />
                          <path d="M30 52 Q32 48 35 52 Q38 48 40 52" stroke="#606C38" strokeWidth="2" fill="none" />
                        </g>

                        {/* Tomato */}
                        <g transform="translate(75, -5)">
                          <circle cx="20" cy="58" r="10" fill="#BC6C25" />
                          <ellipse cx="20" cy="50" rx="4" ry="2" fill="#606C38" />
                        </g>
                      </svg>
                    </div>

                    {/* Floating ingredient icons */}
                    <motion.div
                      className="absolute -right-1 top-1/4 text-2xl"
                      animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
                    >
                      🥕
                    </motion.div>
                    <motion.div
                      className="absolute -left-1 top-1/3 text-2xl"
                      animate={{ y: [0, -8, 0], rotate: [0, -10, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
                    >
                      🍅
                    </motion.div>
                    <motion.div
                      className="absolute right-4 -bottom-2 text-xl"
                      animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
                    >
                      🧅
                    </motion.div>
                    <motion.div
                      className="absolute left-4 -bottom-2 text-xl"
                      animate={{ y: [0, -6, 0], rotate: [0, -8, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
                    >
                      🥬
                    </motion.div>
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 -top-3 text-xl"
                      animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                    >
                      ✨
                    </motion.div>
                  </motion.div>

                  {/* Tagline */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-olive-500 text-sm mt-4 font-medium"
                  >
                    Scan ingredients, discover recipes!
                  </motion.p>
                </motion.div>
              )}

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SCAN Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full space-y-4"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <motion.button
                  onClick={triggerFileInput}
                  className="w-full bg-olive-600 text-cream-100 py-5 rounded-full font-bold text-xl shadow-xl flex items-center justify-center gap-3 relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Scan size={24} />
                  SCAN

                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cream-100/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                </motion.button>

                <motion.button
                  onClick={handleTakePhotoClick}
                  className="w-full bg-cream-100 text-olive-600 py-4 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg border-2 border-olive-200"
                  whileHover={{ scale: 1.02, borderColor: '#606C38' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Camera size={20} />
                  Take Photo
                </motion.button>
              </motion.div>

              {/* Tip text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-olive-500 text-sm text-center mt-6"
              >
                Scan your ingredients to discover amazing recipes! 🥗
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
