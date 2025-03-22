export default function AssessmentContainerComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      {/* Top gradient border only */}
      <div
        className="h-0 border-t-4"
        style={{
          borderImage: "linear-gradient(90deg, #65D1F8, #6CCFD0) 1",
          borderImageSlice: 1,
        }}
      ></div>

      {children}
    </div>
  );
}
