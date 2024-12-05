import Link from 'next/link';

export default function Header() {
  return (
    <header className="py-4">
      <nav className="container flex items-center justify-between">
        <ul className="flex gap-6">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/entry">Entry</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
