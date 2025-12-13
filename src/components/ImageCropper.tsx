import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import getCroppedImg from '../lib/cropUtils';

interface ImageCropperProps {
    imageSrc: string;
    aspectRatio: number;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, aspectRatio, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error('Failed to crop image', e);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl h-[80vh] flex flex-col bg-tech-surface rounded-3xl overflow-hidden border border-tech-border">

                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b border-tech-border bg-black/20">
                    <h3 className="font-bold text-lg">Adjust Image</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                        classes={{
                            containerClassName: 'bg-black',
                            mediaClassName: '',
                            cropAreaClassName: 'border-2 border-tech-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]'
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="p-6 bg-tech-surface border-t border-tech-border space-y-6">
                    <div className="flex items-center gap-4">
                        <ZoomOut className="w-5 h-5 text-gray-400" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-tech-primary"
                        />
                        <ZoomIn className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 rounded-xl font-bold hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-tech-primary text-black rounded-xl font-bold hover:bg-tech-primary/80 transition-colors flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
