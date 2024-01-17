export function PurgeSetting() {
  return (
    <div className="flex items-center p-2 space-x-2">
      <h3>Purge Settings</h3>
      <div className="flex-grow" />
      <div className="flex flex-col items-stretch gap-1 w-full max-w-32 text-sm">
        <button
          className="border border-transparent rounded-lg px-2 py-1 bg-red-500 text-white w-full font-semibold hover:bg-red-600 transition"
          onClick={purge}
        >
          Purge
        </button>
      </div>
    </div>
  );
}

function purge() {
  if (window.confirm("Are you sure you want to purge all settings?")) {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.location.reload();
  }
}
