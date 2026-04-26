import { useEffect } from 'react';

const DEFAULT_TITLE = 'Gribouille — Trouve la date qui convient à tout le monde';
const DEFAULT_DESC = 'Sans compte, sans pub, sans prise de tête. Tu proposes des dates, tes amis votent, la meilleure s\'impose.';

const setMeta = (selector: string, attr: string, content: string) => {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    const [key, val] = attr.split('=');
    el.setAttribute(key, val.replace(/"/g, ''));
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

export const usePageMeta = ({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) => {
  useEffect(() => {
    const t = title ? `${title} — Gribouille` : DEFAULT_TITLE;
    const d = description || DEFAULT_DESC;
    const url = window.location.href;

    document.title = t;
    setMeta('meta[property="og:title"]',       'property="og:title"',       t);
    setMeta('meta[property="og:description"]', 'property="og:description"', d);
    setMeta('meta[property="og:url"]',         'property="og:url"',         url);
    setMeta('meta[name="description"]',        'name="description"',        d);
    setMeta('meta[name="twitter:title"]',      'name="twitter:title"',      t);
    setMeta('meta[name="twitter:description"]','name="twitter:description"',d);

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('meta[property="og:title"]',       'property="og:title"',       DEFAULT_TITLE);
      setMeta('meta[property="og:description"]', 'property="og:description"', DEFAULT_DESC);
      setMeta('meta[property="og:url"]',         'property="og:url"',         'https://gribouille.tomobodo.xyz/');
      setMeta('meta[name="description"]',        'name="description"',        DEFAULT_DESC);
      setMeta('meta[name="twitter:title"]',      'name="twitter:title"',      DEFAULT_TITLE);
      setMeta('meta[name="twitter:description"]','name="twitter:description"',DEFAULT_DESC);
    };
  }, [title, description]);
};
