// Wrapper card for form sections — consistent with website_new layout
interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <div className="section-card">
      <div className="mb-4">
        <h2
          className="text-base font-semibold text-[#2d373c]"
          style={{ fontFamily: "var(--font-secondary)" }}
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[#6b7280] mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
