"use client";
import Link from "next/link";

const TopBar = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/30">
      <div className="flex h-16 items-center px-4">
        <div className="mr-4">
          <Link
            href="/"
            className="text-2xl font-extrabold text-white font-dancing"
          >
            Thumbnail Creator
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
