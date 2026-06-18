'use client';

import { useMemo } from 'react';
import katex from 'katex';
import styles from './MathRender.module.css';

export default function MathRender({ formula, displayMode = true, className = '', style = undefined }) {
  const renderedHtml = useMemo(() => {
    if (!formula) return '';

    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
        strict: 'ignore',
        trust: false,
      });
    } catch {
      return formula;
    }
  }, [displayMode, formula]);

  return (
    <div
      className={`${styles.math_render} ${className}`.trim()}
      style={style}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
