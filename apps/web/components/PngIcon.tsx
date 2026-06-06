import Image, { StaticImageData } from 'next/image';
import React from 'react';

type PngIconProps = {
    src: StaticImageData | string;
    alt?: string;
    size?: number;
    className?: string;
};

export const PngIcon = ({ src, alt = 'icon', size = 24, className = '' }: PngIconProps) => {
    return (
        <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            className={`display-inline-block vertical-align-middle ${className}`}
            style={{ objectFit: 'contain' }}
        />
    );
};

export default PngIcon;
