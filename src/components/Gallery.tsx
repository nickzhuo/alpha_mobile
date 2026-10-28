'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ArrowLeftIcon, ArrowRightIcon, CloseIcon, PawIcon } from './Icons';

interface Props {
  images: string[];
  alt: string;
}

export default function Gallery({ images, alt }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [preview, setPreview] = useState(false);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(Math.max(0, Math.min(next, images.length - 1)));
  }, [images.length]);

  const goTo = useCallback((next: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(next, images.length - 1));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
  }, [images.length]);

  useEffect(() => {
    if (!preview) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreview(false);
      if (event.key === 'ArrowLeft') goTo(index - 1);
      if (event.key === 'ArrowRight') goTo(index + 1);
    };

    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [preview, index, goTo]);

  if (images.length === 0) {
    return (
      <div className="mp-gallery">
        <div className="mp-gallery__empty">
          <PawIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="mp-gallery">
      <div className="mp-gallery__track" ref={trackRef} onScroll={onScroll}>
        {images.map((src, i) => (
          <div className="mp-gallery__item" key={src}>
            <img
              src={src}
              alt={`${alt} 第${i + 1}张照片`}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              onClick={() => {
                setIndex(i);
                setPreview(true);
              }}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <div className="mp-gallery__dots">
            {images.map((src, i) => (
              <span
                key={src}
                className={`mp-gallery__dot${i === index ? ' mp-gallery__dot--on' : ''}`}
              />
            ))}
          </div>
          <span className="mp-gallery__count">
            {index + 1} / {images.length}
          </span>
        </>
      )}

      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="查看大图"
          onClick={() => setPreview(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(10,12,15,.94)',
          }}
        >
          <img
            src={images[index]}
            alt={alt}
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: '100vw', maxHeight: '86vh', objectFit: 'contain' }}
          />
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setPreview(false)}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 38,
              height: 38,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              background: 'rgba(255,255,255,.14)',
              color: '#fff',
            }}
          >
            <CloseIcon style={{ width: 18, height: 18 }} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="上一张"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(index - 1);
                }}
                disabled={index === 0}
                style={{
                  position: 'absolute',
                  left: 10,
                  width: 42,
                  height: 42,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,.14)',
                  color: '#fff',
                  opacity: index === 0 ? 0.35 : 1,
                }}
              >
                <ArrowLeftIcon style={{ width: 20, height: 20 }} />
              </button>
              <button
                type="button"
                aria-label="下一张"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(index + 1);
                }}
                disabled={index === images.length - 1}
                style={{
                  position: 'absolute',
                  right: 10,
                  width: 42,
                  height: 42,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,.14)',
                  color: '#fff',
                  opacity: index === images.length - 1 ? 0.35 : 1,
                }}
              >
                <ArrowRightIcon style={{ width: 20, height: 20 }} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
