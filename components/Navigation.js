import Link from 'next/link';
import React from 'react';

export default function Navigation ({home, postPage}) {
  return (
    <nav>
      <Link href="/" aria-current={home ? "page" : undefined} className="text-gray-900 dark:text-white pr-6 py-4 font-bold">
        Home
      </Link>
      {(home || postPage) && (
        <Link href="/about" className="text-gray-900 dark:text-white px-6 py-4 font-bold">
          About
        </Link>
      )}
     
    </nav>
  );
};

