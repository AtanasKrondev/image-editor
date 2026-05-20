'use server';

export default async function Home() {
  let health: unknown = null;
  let error: string | null = null;

  try {
    const res = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:5000'}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    health = await res.json();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <main>
      <h1>Image Editor</h1>
      <h2>Backend Health</h2>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <pre>{JSON.stringify(health, null, 2)}</pre>
      )}
    </main>
  );
}
