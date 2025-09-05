'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState } from "react";

export default function ProfileImageModal({ src, alt, fallback, children, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Clickable trigger */}
      <div 
        onClick={() => setIsOpen(true)} 
        className={`cursor-pointer transition-transform hover:scale-105 ${className}`}
      >
        {children}
      </div>

      {/* Instagram-style modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 bg-black/95 border-none">
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Large profile image */}
            <div className="flex items-center justify-center min-h-[400px] max-h-[80vh] p-8">
              <Avatar className="h-80 w-80 ring-4 ring-white/20">
                <AvatarImage 
                  alt={alt} 
                  src={src} 
                  className="object-cover"
                />
                <AvatarFallback className="text-6xl bg-gradient-to-br from-primary/80 to-primary/30 text-white">
                  {fallback}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
