import { useMemo } from 'react';
import katex from 'katex';

interface Props {
  tex: string;
  block?: boolean;
  className?: string;
}

export function Katex({ tex, block = false, className }: Props) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return tex;
    }
  }, [tex, block]);
  return (
    <span
      className={className}
      style={block ? { display: 'block', overflowX: 'auto' } : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
