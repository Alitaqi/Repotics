import React, { useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateDraft } from "@/lib/redux/slices/reportSlice";
import { Upload, X, ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// helper: crop to a blob URL
const getCroppedImg = async (imageSrc, _crop, _zoom, _aspect, croppedAreaPixels) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(croppedAreaPixels.width);
  canvas.height = Math.round(croppedAreaPixels.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve(null);
      resolve(URL.createObjectURL(blob));
    }, "image/jpeg");
  });
};

export default function ImageStep() {
  const dispatch = useDispatch();
  const draft = useSelector((s) => s.report.draft);
  const images = draft.images || [];
  const originals = draft.originalImages || [];

  const [current, setCurrent] = useState(0);

  // cropper state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const active = useMemo(() => images[current]?.url, [images, current]);

  const handleFiles = (files) => {
    const arr = Array.from(files || []);
    const originalsArr = arr.map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      file: f,
    }));
    // show originals by default
    dispatch(
      updateDraft({
        originalImages: [...originals, ...originalsArr],
        images: [...images, ...originalsArr],
      })
    );
    // jump to first newly added if none before
    if (images.length === 0) setCurrent(0);
  };

  const onCropComplete = useCallback((_, areaPixels) => setCroppedAreaPixels(areaPixels), []);

  const saveCrop = async () => {
    const original = originals[current];
    if (!original || !croppedAreaPixels) return;
    const croppedUrl = await getCroppedImg(original.url, crop, zoom, 4 / 3, croppedAreaPixels);
    if (!croppedUrl) return;

    const next = [...images];
    next[current] = { ...next[current], url: croppedUrl };
    dispatch(updateDraft({ images: next })); // originals kept for re-cropping

    setCropDialogOpen(false);
  };

  const resetToOriginal = () => {
    const original = originals[current];
    if (!original) return;
    const next = [...images];
    next[current] = { ...original };
    dispatch(updateDraft({ images: next }));
    setCropDialogOpen(false);
  };

  const removeCurrent = () => {
    const nextImages = images.filter((_, i) => i !== current);
    const nextOriginals = originals.filter((_, i) => i !== current);
    dispatch(updateDraft({ images: nextImages, originalImages: nextOriginals }));
    if (nextImages.length === 0) {
      setCurrent(0);
      return;
    }
    setCurrent((idx) => Math.min(idx, nextImages.length - 1));
  };

  return (
    <div className="relative space-y-4">
      {/* Initial Uploader */}
      {images.length === 0 && (
        <label className="flex flex-col items-center justify-center w-full h-64 transition border-2 border-dashed cursor-pointer rounded-xl bg-gray-50 hover:bg-gray-100">
          <Upload className="w-8 h-8 mb-2 text-gray-500" />
          <span className="font-medium text-gray-600">Click to upload images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}

      {/* Carousel */}
      {images.length > 0 && (
        <div className="relative h-[300px] w-full bg-gray-100 rounded-xl overflow-hidden">
          {/* current image */}
          <img src={active} alt="preview" className="object-cover w-full h-full" />

          {/* remove */}
          <button
            onClick={removeCurrent}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>

          {/* crop (pencil) */}
          <button
            onClick={() => setCropDialogOpen(true)}
            className="absolute top-3 left-3 p-1.5 rounded-full bg-black/50 text-white"
            aria-label="Crop image"
            title="Crop / adjust"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* nav arrows */}
          {current > 0 && (
            <button
              onClick={() => setCurrent((i) => i - 1)}
              className="absolute p-2 text-white -translate-y-1/2 rounded-full left-3 top-1/2 bg-black/40"
              aria-label="Previous image"
            >
              <ChevronLeft />
            </button>
          )}
          {current < images.length - 1 && (
            <button
              onClick={() => setCurrent((i) => i + 1)}
              className="absolute p-2 text-white -translate-y-1/2 rounded-full right-3 top-1/2 bg-black/40"
              aria-label="Next image"
            >
              <ChevronRight />
            </button>
          )}

          {/* pagination dots */}
          <div className="absolute left-0 right-0 flex items-center justify-center gap-2 bottom-3">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  idx === current ? "bg-white" : "bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>

          {/* add more (+) — inside the carousel, bottom-right, gray */}
          <label className="absolute p-2 text-white transition rounded-full shadow-md cursor-pointer bottom-3 right-3 bg-black/50 hover:bg-gray-600">
            <Plus className="w-5 h-5" />
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>
      )}

      {/* Description (no blue focus ring) */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Incident Description</label>
        <textarea
          rows={3}
          placeholder="Describe what happened…"
          value={draft.description}
          onChange={(e) => dispatch(updateDraft({ description: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400"
        />
      </div>

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Adjust Crop</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[420px] bg-black">
            <Cropper
              image={originals[current]?.url}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="secondary" onClick={() => setCropDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={resetToOriginal}>
              Reset to Original
            </Button>
            <Button onClick={saveCrop}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}