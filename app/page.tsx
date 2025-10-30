"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TextBehindImage = () => {
  const router = useRouter();
  const imageVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  };

  const galleryImages1 = [
    { src: "edited-image (4)", alt: "Edited Image 4" },
    { src: "edited-image (5)", alt: "Edited Image 5" },
    { src: "edited-image (6)", alt: "Edited Image 6" },
    { src: "edited-image (7)", alt: "Edited Image 7" },
    { src: "edited-image (8)", alt: "Edited Image 8" },
    { src: "edited-image (9)", alt: "Edited Image 9" },
    { src: "be back", alt: "Creative Composition" },
    { src: "bold", alt: "Bold Design" },
    { src: "bali", alt: "Scenic Landscape" },
    { src: "mountain", alt: "Mountain Panorama" },
  ];

  const galleryImages2 = [
    { src: "December", alt: "Winter Mood" },
    { src: "peace", alt: "Serene Moment" },
    { src: "dream", alt: "Dreamscape" },
    { src: "love", alt: "Emotional Landscape" },
    { src: "phase", alt: "Transitional Scene" },
    { src: "vision", alt: "Visionary Concept" },
  ];

  const allImages = [...galleryImages1, ...galleryImages2];
  const [orientations, setOrientations] = useState<
    Record<number, "portrait" | "landscape">
  >({});

  const [isOpening, setIsOpening] = useState(false);

  const handleOpenApp = () => {
    if (isOpening) return;
    setIsOpening(true);
    // Navigate to editor; ServerAuthGuard will redirect to sign-in if needed
    router.push("/editor");
    // Safety timeout to re-enable in case navigation is blocked
    setTimeout(() => setIsOpening(false), 8000);
  };

  return (
    <div className="py-16 flex flex-col items-center text-center px-6">
      {/* Hero Section with Full-Width Image */}
      <div className="flex flex-col items-center justify-center">
        <h1 className="dark-glow-text text-4xl md:text-6xl font-dancing font-black text-center px-6 drop-shadow-2xl leading-tight tracking-wide">
          Text with Image
        </h1>
        <p className="text-lg md:text-xl text-gray-300 text-center px-6 mt-4 max-w-4xl">
          Create stunning images with AI-powered tools and customizable text
          overlays
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <Button
            onClick={handleOpenApp}
            disabled={isOpening}
            aria-busy={isOpening}
            className="glow-on-hover relative flex items-center gap-2 w-60 h-14 bg-blue-500 text-white !text-white px-10 py-4 rounded-lg transition transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isOpening ? "Opening…" : "Open the App"}
            <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>

      {/* Remaining sections unchanged */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-16 max-w-7xl w-full"
      >
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-6 [column-fill:_balance]">
          {/* masonry columns */}
          {allImages.map((image, index) => (
            <motion.div
              key={image.src + index}
              variants={{
                hidden: { opacity: 0, scale: 0.98 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.4, delay: index * 0.08 },
                },
              }}
              className="mb-6 break-inside-avoid"
            >
              <motion.div
                whileHover="hover"
                variants={imageVariants}
                className="group relative overflow-hidden rounded-xl shadow-lg"
              >
                <Image
                  src={`/assets/${image.src}.png`}
                  alt={image.alt}
                  width={800}
                  height={800}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  onLoadingComplete={(img) => {
                    const orientation =
                      img.naturalWidth >= img.naturalHeight
                        ? "landscape"
                        : "portrait";
                    setOrientations((prev) => ({
                      ...prev,
                      [index]: orientation,
                    }));
                  }}
                  className={
                    "rounded-xl w-full " +
                    (orientations[index] === "portrait"
                      ? "object-cover h-[420px] md:h-[460px]"
                      : orientations[index] === "landscape"
                      ? "object-contain bg-black/30 h-[320px] md:h-[340px]"
                      : "object-cover h-[320px]")
                  }
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default TextBehindImage;
