// src/components/SafeHtml.jsx
import React from 'react';
import DOMPurify from 'dompurify';

function SafeHtml({ html }) {
  // Configure DOMPurify to allow only specific tags and styles
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'u', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'div',

    ],
    ALLOWED_ATTR: ['href', 'title', 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):|mailto:)/i, 
    ALLOWED_STYLE: {
      'color': true,
      'background-color': true,
      'font-weight': true,
      'font-style': true,
      'text-decoration': true,
    },
  });

  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}

export default SafeHtml;
