import React from 'react';

interface NexoraLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textColor?: 'dark' | 'light';
  subtextVariant?: 'gold' | 'muted' | 'white';
}

export const NexoraEmblem: React.FC<{ className?: string; sizePx?: number }> = ({ 
  className = '', 
  sizePx 
}) => {
  const style = sizePx ? { width: `${sizePx}px`, height: `${sizePx}px` } : undefined;

  return (
    <img 
      src="/images/nexora_brand_logo.svg" 
      alt="NEXORA Education & Career Academy Logo" 
      className={`shrink-0 rounded-full select-none object-contain ${className}`}
      style={style}
      loading="eager"
      referrerPolicy="no-referrer"
    />
  );
};

export const NexoraLogo: React.FC<NexoraLogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
  textColor = 'dark',
  subtextVariant = 'gold'
}) => {
  const sizeMap = {
    xs: { px: 28, textClass: 'text-base', subtextClass: 'text-[8px]' },
    sm: { px: 36, textClass: 'text-lg', subtextClass: 'text-[9px]' },
    md: { px: 48, textClass: 'text-xl sm:text-2xl', subtextClass: 'text-[9.5px]' },
    lg: { px: 60, textClass: 'text-2xl sm:text-3xl', subtextClass: 'text-[11px]' },
    xl: { px: 76, textClass: 'text-3xl sm:text-4xl', subtextClass: 'text-[13px]' }
  };

  const config = sizeMap[size];

  const titleColor = textColor === 'light' ? 'text-white' : 'text-slate-900';
  const subColor = 
    subtextVariant === 'gold' 
      ? 'text-amber-500 font-bold' 
      : subtextVariant === 'white' 
      ? 'text-slate-200' 
      : 'text-slate-400';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative shrink-0 transition-transform duration-200 group-hover:scale-105">
        <NexoraEmblem 
          sizePx={config.px} 
          className="shadow-sm shadow-slate-900/10" 
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`font-black tracking-tight leading-none ${titleColor} ${config.textClass}`}>
            NEXORA<span className="text-[#0057D9]">.</span>
          </span>
          <span className={`font-mono tracking-wider uppercase mt-1 leading-tight ${subColor} ${config.subtextClass}`}>
            EDUCATION &amp; CAREER ACADEMY
          </span>
        </div>
      )}
    </div>
  );
};

export default NexoraLogo;
