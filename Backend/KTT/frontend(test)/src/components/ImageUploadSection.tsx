import { useEffect, useRef, useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { api } from "../lib/api";
import { SectionCard } from "./SectionCard";

interface ImageUploadSectionProps {
  onUploaded: (url: string) => void;
}

export function ImageUploadSection({ onUploaded }: ImageUploadSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const uploadMutation = useAsync(api.uploadImage);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStreamError("Camera access is not supported in this browser.");
      return;
    }

    let stream: MediaStream | null = null;
    let cancelled = false;

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        });

        if (cancelled) return;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
          if (!cancelled) {
            setCameraReady(true);
            setStreamError(null);
          }
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Unable to access camera.";
          setStreamError(message);
        }
      }
    };

    initCamera();

    return () => {
      cancelled = true;
      setCameraReady(false);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCaptureAndUpload = async () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    if (!videoElement || !canvasElement) return;

    const context = canvasElement.getContext("2d");
    if (!context) {
      setStreamError("Unable to capture image from camera.");
      return;
    }

    const width = videoElement.videoWidth || 640;
    const height = videoElement.videoHeight || 480;
    canvasElement.width = width;
    canvasElement.height = height;
    context.drawImage(videoElement, 0, 0, width, height);

    const dataUrl = canvasElement.toDataURL("image/jpeg", 0.92);
    const base64 = dataUrl.split(",")[1];

    if (!base64) {
      setStreamError("Failed to encode captured image.");
      return;
    }

    try {
      const response = await uploadMutation.execute(base64);
      setPreviewImage(dataUrl);
      onUploaded(response.path);
    } catch (error) {
      // Error state handled by useAsync
    }
  };

  return (
    <SectionCard
      title="Capture & Upload"
      description="Use your device camera to capture a photo and upload it as base64 to Supabase storage."
      footer={
        uploadMutation.data ? (
          <div className="muted-text">
            Latest upload:{" "}
            <a href={uploadMutation.data.path} target="_blank" rel="noreferrer">
              {uploadMutation.data.path}
            </a>
          </div>
        ) : null
      }
    >
      <div className="camera-box">
        <video ref={videoRef} className="camera-stream" playsInline muted autoPlay />
        <canvas ref={canvasRef} className="capture-canvas" aria-hidden="true" />
        {previewImage ? (
          <img src={previewImage} alt="Most recent capture" className="capture-preview" />
        ) : null}
        <div className="capture-actions">
          <button className="primary" type="button" onClick={handleCaptureAndUpload} disabled={!cameraReady || uploadMutation.loading}>
            {uploadMutation.loading ? "Uploading..." : "Capture & Upload"}
          </button>
          <span className="muted-text">{cameraReady ? "Ready when you are." : "Allow camera access to begin."}</span>
        </div>
        {streamError ? <p className="error-text">{streamError}</p> : null}
        {uploadMutation.error ? <p className="error-text">{uploadMutation.error}</p> : null}
      </div>
    </SectionCard>
  );
}
