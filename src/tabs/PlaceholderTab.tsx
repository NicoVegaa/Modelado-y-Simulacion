interface PlaceholderTabProps {
  title: string;
}

export const PlaceholderTab = ({ title }: PlaceholderTabProps) => {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">
        Este modulo esta preparado para la siguiente fase de implementacion.
      </p>
    </section>
  );
};
