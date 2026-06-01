export function LoadingBox({ label }: { label: string }) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div className="bg-card w-full max-w-xs rounded-xl border p-6 text-center shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <div className="bg-muted mt-4 h-1.5 w-full overflow-hidden rounded-full">
          <div className="bg-primary loader-bar h-full w-1/3 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="bg-card text-muted-foreground rounded-xl border p-6 text-center text-sm">{message}</div>;
}
