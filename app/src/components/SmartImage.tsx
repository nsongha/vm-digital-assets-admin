import { useState } from 'react';
import styles from './SmartImage.module.css';

interface SmartImageProps {
  src?: string;
  alt: string;
  /** Text shown on the gray placeholder when the image is missing/fails to load. */
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** <img> with a gray placeholder fallback — ported from the mockup's <image-slot>
 * custom element and the `background:#8d8d8d url(placeholder-landscape.png)` covers. */
export default function SmartImage({ src, alt, placeholder = 'Ảnh', className, style }: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || failed;

  if (showPlaceholder) {
    return (
      <div className={[styles.placeholder, className || ''].join(' ').trim()} style={style}>
        <span>{placeholder}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={[styles.img, className || ''].join(' ').trim()}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
