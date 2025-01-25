import React from 'react';

function Footer() {
  return (
    <footer className="p-4 border-t flex flex-col items-center justify-center">
      <span className="mb-1">
        Made with <span className="text-red-500">♥</span> by Diego
      </span>
      <a
        href="https://github.com/diegitoo13/Imprint"
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
      >
        GitHub Project
      </a>
    </footer>
  );
}

export default Footer;
