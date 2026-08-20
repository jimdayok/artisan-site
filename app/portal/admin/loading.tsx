export default function PortalAdminLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-[#f4efe6] px-5 py-10 sm:px-8 lg:px-10" aria-label="Loading employee dashboard">
      <div className="mx-auto max-w-[1500px]">
        <div className="h-44 rounded-lg bg-[#172a28]" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-36 rounded-lg border border-[#d8c49b] bg-white" />
          ))}
        </div>
        <div className="mt-7 h-96 rounded-lg border border-[#d8c49b] bg-white" />
        <div className="mt-7 h-80 rounded-lg border border-[#d8c49b] bg-white" />
      </div>
    </main>
  );
}
