import React, { useState } from 'react';
import { X, Camera, Upload, Sparkles, Loader2, Image as ImageIcon, RefreshCw, CheckCircle2 } from 'lucide-react';
import { generatePhotoshootImage } from '../services/geminiService';

const ANGLES = [
  { id: 'front', label: 'Front View', description: 'Full front facing shot' },
  { id: 'back', label: 'Back View', description: 'Detailed back view' },
  { id: 'side', label: 'Side Profile', description: 'Elegant side profile' },
  { id: 'zoomed', label: 'Zoomed Detail', description: 'Close-up on fabric & pattern' },
];

function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

interface AIPhotoshootModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImagesGenerated: (urls: string[]) => void;
  maxSlots?: number;
}

const AIPhotoshootModal: React.FC<AIPhotoshootModalProps> = ({
  isOpen,
  onClose,
  onImagesGenerated,
  maxSlots = 5,
}) => {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
        setCurrentStep(2);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToProduct = async () => {
    const base64Images = Object.values(generatedImages).filter(Boolean);
    if (base64Images.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const urls: string[] = [];
      for (let i = 0; i < base64Images.length; i++) {
        const formData = new FormData();
        const file = dataURLtoFile(base64Images[i], `ai-photoshoot-${i + 1}.png`);
        formData.append('images', file);

        const uploadRes = await fetch('/api/cloudinary-upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.message || `Image ${i + 1} upload failed`);
        }

        const data = await uploadRes.json();
        const uploaded = (data?.files || []).map((f: { url: string }) => f.url).filter(Boolean);
        urls.push(...uploaded);
      }

      if (urls.length > 0) {
        const capped = urls.slice(0, maxSlots);
        onImagesGenerated(capped);
        onClose();
      } else {
        throw new Error('No images uploaded');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to upload images to product.');
    } finally {
      setIsUploading(false);
    }
  };

  const generatePhotoshoot = async () => {
    if (!productImage) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImages({});

    try {
      for (const angle of ANGLES) {
        const imageUrl = await generatePhotoshootImage(productImage, angle.description);
        setGeneratedImages((prev) => ({ ...prev, [angle.id]: imageUrl }));
      }
      setCurrentStep(3);
    } catch (err) {
      setError('Failed to generate photoshoot. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setProductImage(null);
    setGeneratedImages({});
    setCurrentStep(1);
    setError(null);
  };

  const handleClose = () => {
    if (!isGenerating && !isUploading) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  const allGenerated = Object.keys(generatedImages).length === ANGLES.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-serif font-bold text-brand-950 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            AI Photoshoot
          </h2>
          <button
            onClick={handleClose}
            disabled={isGenerating || isUploading}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Steps */}
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition-all ${
                    currentStep >= step ? 'bg-brand-700 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {currentStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-0.5 ${currentStep > step ? 'bg-brand-700' : 'bg-gray-100'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Upload */}
            <div className="space-y-4">
              <h3 className="font-bold text-brand-900 flex items-center gap-2">
                <Upload className="h-4 w-4 text-brand-600" />
                1. Upload Product Photo
              </h3>
              <div className="relative">
                {productImage ? (
                  <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-brand-100">
                    <img src={productImage} alt="Product" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setProductImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-white"
                    >
                      <RefreshCw className="h-4 w-4 text-brand-700" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all">
                    <Camera className="h-10 w-10 text-brand-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Click to upload</span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                  </label>
                )}
              </div>
              {productImage && !isGenerating && (
                <button
                  onClick={generatePhotoshoot}
                  className="w-full bg-brand-700 text-white py-2.5 px-4 rounded-lg font-bold text-sm hover:bg-brand-800 flex items-center justify-center gap-2"
                >
                  {allGenerated ? 'Regenerate All' : 'Start Photoshoot'}
                  <Sparkles className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Right: Results */}
            <div>
              <h3 className="font-bold text-brand-900 mb-3">2. Results</h3>
              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 border-4 border-brand-100 border-t-brand-700 rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-brand-600 animate-pulse" />
                  </div>
                  <p className="text-sm font-medium text-brand-900">Developing photos...</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Angle {Object.keys(generatedImages).length + 1} of 4
                  </p>
                </div>
              )}
              {!isGenerating && Object.keys(generatedImages).length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {ANGLES.map((angle) => (
                    <div key={angle.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      {generatedImages[angle.id] ? (
                        <img
                          src={generatedImages[angle.id]}
                          alt={angle.label}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Loader2 className="h-6 w-6 text-brand-200 animate-spin" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {!productImage && !isGenerating && (
                <p className="text-sm text-gray-400 py-8 text-center">
                  Upload a product photo to generate AI model shots.
                </p>
              )}
            </div>
          </div>

          {allGenerated && !isGenerating && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg font-medium text-brand-700 border-2 border-brand-100 hover:bg-brand-50"
              >
                Start New
              </button>
              <button
                onClick={handleAddToProduct}
                disabled={isUploading}
                className="px-4 py-2 bg-brand-700 text-white rounded-lg font-bold hover:bg-brand-800 disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Add to Product'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPhotoshootModal;
