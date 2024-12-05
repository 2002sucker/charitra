import ContentForm from '@/components/Form';

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200">
        Blog Entry Page
      </h1>
      <ContentForm />
    </main>
  );
}
