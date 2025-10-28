"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const TextBehindImage = () => {
  const router = useRouter();
  const imageVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  };

  const galleryImages1 = [
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

  const handleOpenApp = () => {
    router.push("/editor");
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
            className="glow-on-hover relative flex items-center gap-2 w-60 h-14 bg-blue-500 text-white !text-white px-10 py-4 rounded-lg transition transform hover:scale-105"
          >
            Open the App
            <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>

      {/* Remaining sections unchanged */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-16 max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {galleryImages1.map((image, index) => (
          <motion.div
            key={image.src}
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.5,
                  delay: index * 0.2,
                },
              },
            }}
            className="group relative overflow-hidden rounded-xl shadow-lg"
          >
            <motion.div whileHover="hover" variants={imageVariants}>
              <Image
                src={`/assets/${image.src}.png`}
                alt={image.alt}
                width={500}
                height={500}
                className="rounded-xl w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-8 max-w-7xl grid grid-cols-2 md:grid-cols-3 gap-6"
      >
        {galleryImages2.map((image, index) => (
          <motion.div
            key={image.src}
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.5,
                  delay: index * 0.2,
                },
              },
            }}
            className="group relative overflow-hidden rounded-xl shadow-lg"
          >
            <motion.div whileHover="hover" variants={imageVariants}>
              <Image
                src={`/assets/${image.src}.png`}
                alt={image.alt}
                width={500}
                height={500}
                className="rounded-xl w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
};

export default TextBehindImage;
