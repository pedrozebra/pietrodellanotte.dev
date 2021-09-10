import Link from 'next/link';
import React from 'react';

export default function Navigation ({home, postPage}) {
  return (
    <nav>
      <Link href="/">
        <a className="text-gray-900 dark:text-white pr-6 py-4">Home</a>
      </Link>
      {(home || postPage) && (
        <Link href="/about">
        <a className="text-gray-900 dark:text-white px-6 py-4">About</a>
        </Link>
      )}
     
    </nav>
  );
};

