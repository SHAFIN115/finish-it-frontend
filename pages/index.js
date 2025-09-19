// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '2rem' }}>
      <h1>Welcome to Finish-It</h1>
      <nav>
        <ul>
          <li><Link href="/signup">Signup</Link></li>
          <li><Link href="/login">Login</Link></li>
        </ul>
      </nav>
    </div>
  );
}
