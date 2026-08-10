export default function RoadshowLoading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-white">
      <div className="flex items-center gap-3 text-black">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-black/25 border-t-black" />
        Loading...
      </div>
    </main>
  );
}
