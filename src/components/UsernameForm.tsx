import { useState } from "react";

export function UsernameForm({ onSubmit, busy }: { onSubmit: (name: string) => void; busy: boolean }) {
  const [value, setValue] = useState("");
  const disabled = busy || value.trim().length < 2;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    onSubmit(value.trim());
  }

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-12 sm:py-20">
      <div className="text-center">
        <div className="label">War Era / Coach</div>
        <h1 className="mt-2 bracket-heading text-2xl sm:text-3xl text-text">Plan your levels</h1>
        <p className="mt-3 text-sm sm:text-base text-text-muted">
          Enter your War Era username. The tool fetches your level, skills, and factories, then
          tells you exactly what to do next based on the community's top-tipped guides.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 sm:mt-10 flex flex-col gap-3">
        <label htmlFor="username" className="label">Username</label>
        <input
          id="username"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="lundgren"
          className="w-full rounded border border-border bg-surface px-4 py-3 text-base text-text outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded border border-accent bg-accent/10 px-4 py-3 font-mono text-sm uppercase tracking-wider text-accent transition-colors hover:bg-accent/20 disabled:opacity-40"
        >
          {busy ? "Looking up…" : "Get my plan"}
        </button>
      </form>
    </section>
  );
}
