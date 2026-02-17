import { CheckCircle2, Shield } from "lucide-react";
import watchImg1 from "@/public/watch-1.webp";
import Image from "next/image";

const HeroCertificateMockup = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center py-8">
      {/* Subtle orbit rings - thin and elegant */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-100 h-100 rounded-full border border-border/60" />
        <div className="absolute w-[320px] h-80 rounded-full border border-border/40" />
        <div className="absolute w-125 h-125 rounded-full border border-border/30" />
      </div>
      
      {/* Stacked cards container */}
      <div className="relative z-10">
        {/* Background card 3 (furthest back) */}
        <div className="absolute top-6 left-6 w-65 md:w-75 bg-muted/80 rounded-xl h-85 md:h-95 border border-border/50" />
        
        {/* Background card 2 */}
        <div className="absolute top-3 left-3 w-65 md:w- bg-muted rounded-xl h-85 md:h-95 border border-border/60" />
        
        {/* Main certificate card (front) */}
        <div className="relative w-65 md:w-75 bg-card rounded-xl shadow-card overflow-hidden animate-float border border-border">
          {/* Watch image section - rectangular */}
          <div className="relative h-45 md:h-50 overflow-hidden">
            <Image 
              src={watchImg1} 
              alt="Luxury Watch" 
              className="w-full h-full object-cover"
              width={400}
              height={400}
              placeholder="blur"
            />
            <div className="absolute inset-0 bg-linear-to-t from-card/80 via-transparent to-transparent" />
            
            {/* Verified badge overlay - using accent teal for pop */}
            <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 shadow-md">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </div>
          </div>
          
          {/* Certificate info section */}
          <div className="p-4 space-y-3">
            {/* Watch details */}
            <div>
              <h4 className="text-sm font-bold text-foreground">Rolex Submariner</h4>
              <p className="text-xs text-muted-foreground">Ref. 126610LN</p>
            </div>
            
            {/* Token ID bar - darker background for contrast */}
            <div className="flex items-center justify-between bg-mintd-forest/10 rounded-lg px-3 py-2 border border-mintd-forest/15">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs text-foreground/70 font-mono">0x71C...942</span>
              </div>
              <span className="text-xs text-accent font-bold">#892518</span>
            </div>
            
            {/* Mint button mockup */}
            <div className="flex justify-end pt-1">
              <div className="bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-lg shadow-md">
                View Certificate
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating verification badge - top right - glass effect */}
        <div className="absolute -top-2 -right-6 md:-right-10 animate-bounce-slow">
          <div className="bg-background/60 backdrop-blur-xl rounded-lg p-2.5 shadow-lg border border-border/50">
            <CheckCircle2 className="w-5 h-5 text-accent" />
          </div>
        </div>
        
        {/* Floating shield badge - bottom left - teal accent */}
        <div className="absolute -bottom-2 -left-6 md:-left-10 animate-bounce-slow animation-delay-500">
          <div className="bg-accent text-accent-foreground rounded-full p-2.5 shadow-lg">
            <Shield className="w-4 h-4" />
          </div>
        </div>
        
        {/* Floating address chip - middle left - glass effect */}
        <div className="absolute top-1/2 -left-12 md:-left-20 transform -translate-y-1/2 animate-fade-in-delayed hidden md:block">
          <div className="bg-background/60 backdrop-blur-xl rounded-lg px-3 py-2 shadow-lg flex items-center gap-2 border border-border/50">
            <span className="text-xs text-foreground/80 font-mono">0x71C...942</span>
            <div className="bg-accent rounded-full p-1">
              <CheckCircle2 className="w-3 h-3 text-accent-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCertificateMockup;
