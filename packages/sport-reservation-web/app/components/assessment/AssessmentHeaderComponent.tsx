export default function AssessmentHeaderComponent({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {/* Heading and Description */}
      <h2 className="pb-4 text-xl font-bold" style={{ color: "#65D1F8" }}>
        {title}
      </h2>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
