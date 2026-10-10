import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const CARD_WIDTH = 270;
const CARD_HEIGHT_GUESS = 130;

// Shows a small card with a plain-language description and a link to the docs
// while the pointer (or keyboard focus) is on the wrapped element.
export default function HoverInfo({ title, description, docId, block = false, children }) {
  const anchor = useRef(null);
  const timer = useRef(null);
  const [position, setPosition] = useState(null);

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!anchor.current) return;
      const rect = anchor.current.getBoundingClientRect();
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - CARD_WIDTH - 8);
      const above = rect.bottom + CARD_HEIGHT_GUESS > window.innerHeight;
      setPosition({ left, top: above ? rect.top - 6 : rect.bottom + 6, above });
    }, 300);
  };

  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPosition(null), 150);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!position) return undefined;
    const close = () => setPosition(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [position]);

  return (
    <span
      ref={anchor}
      className={`tu-hover ${block ? 'tu-hover-block' : ''}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {position && (
        <span
          role="tooltip"
          className={`tu-hovercard ${position.above ? 'is-above' : ''}`}
          style={{ left: position.left, top: position.top, width: CARD_WIDTH }}
          onMouseEnter={() => clearTimeout(timer.current)}
          onMouseLeave={hide}
        >
          <strong className="tu-hovercard-title">{title}</strong>
          <span className="tu-hovercard-text">{description}</span>
          <Link className="tu-hovercard-link" to={`/docs#${docId}`}>
            Learn more in the docs →
          </Link>
        </span>
      )}
    </span>
  );
}
