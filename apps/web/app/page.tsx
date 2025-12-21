import { ProfileSchema } from '@meetra/shared';

export default function Home() {
  const parsed = ProfileSchema.safeParse({
    fullName: 'Ada Lovelace',
    skills: ['Python', 'FastAPI'],
  });

  return (
    <main style={{ padding: 24 }}>
      <h1>Meetra</h1>
      <pre>{JSON.stringify(parsed, null, 2)}</pre>
    </main>
  );
}
