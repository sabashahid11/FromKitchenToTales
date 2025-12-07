import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { api } from "../lib/api";
import { SectionCard } from "./SectionCard";
export function ImageUploadSection({ onUploaded }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [previewImage, setPreviewImage] = useState("");
    const [cameraReady, setCameraReady] = useState(false);
    const [streamError, setStreamError] = useState(null);
    const uploadMutation = useAsync(api.uploadImage);
    useEffect(() => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setStreamError("Camera access is not supported in this browser.");
            return;
        }
        let stream = null;
        let cancelled = false;
        const initCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
                if (cancelled)
                    return;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play().catch(() => undefined);
                    if (!cancelled) {
                        setCameraReady(true);
                        setStreamError(null);
                    }
                }
            }
            catch (error) {
                if (!cancelled) {
                    setStreamError(error instanceof Error ? error.message : "Unable to access camera.");
                }
            }
        };
        initCamera();
        return () => {
            cancelled = true;
            setCameraReady(false);
            stream?.getTracks().forEach((track) => track.stop());
        };
    }, []);
    const handleCaptureAndUpload = async () => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        if (!videoElement || !canvasElement)
            return;
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
        }
        catch (error) {
        }
    };
    return (_jsx(SectionCard, { title: "Capture & Upload", description: "Use your device camera to capture a photo and upload it as base64 to Supabase storage.", footer: uploadMutation.data ? (_jsxs("div", { className: "muted-text", children: ["Latest upload:", " ", _jsx("a", { href: uploadMutation.data.path, target: "_blank", rel: "noreferrer", children: uploadMutation.data.path })] })) : null, children: _jsxs("div", { className: "camera-box", children: [_jsx("video", { ref: videoRef, className: "camera-stream", playsInline: true, muted: true, autoPlay: true }), _jsx("canvas", { ref: canvasRef, className: "capture-canvas", "aria-hidden": "true" }), previewImage ? _jsx("img", { src: previewImage, alt: "Most recent capture", className: "capture-preview" }) : null, _jsxs("div", { className: "capture-actions", children: [_jsx("button", { className: "primary", type: "button", onClick: handleCaptureAndUpload, disabled: !cameraReady || uploadMutation.loading, children: uploadMutation.loading ? "Uploading..." : "Capture & Upload" }), _jsx("span", { className: "muted-text", children: cameraReady ? "Ready when you are." : "Allow camera access to begin." })] }), streamError ? _jsx("p", { className: "error-text", children: streamError }) : null, uploadMutation.error ? _jsx("p", { className: "error-text", children: uploadMutation.error }) : null] }) }));
}
