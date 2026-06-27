import { DashboardLayout } from "../layouts/DashboardLayout";

export function DashboardPage() {
  return (
    <DashboardLayout>
      <h2 className="mb-6 text-3xl font-bold">
        Welcome back!
      </h2>

      <section className="rounded border p-6">
        <h3 className="mb-4 text-xl font-semibold">
          Create Short URL
        </h3>

        <div className="flex gap-4">
          <input
            type="url"
            placeholder="https://example.com"
            className="flex-1 rounded border px-4 py-2"
          />

          <button className="rounded bg-blue-600 px-4 py-2 text-white">
            Create
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="mb-4 text-xl font-semibold">
          My URLs
        </h3>

        <p>No shortened URLs yet.</p>
      </section>
    </DashboardLayout>
  );
}