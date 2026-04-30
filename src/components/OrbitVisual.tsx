export const OrbitVisual = () => {
  return (
    <div className="relative mx-auto flex h-80 w-80 items-center justify-center">
      {/* Orbit ring */}
      <div className="absolute h-[280px] w-[280px] rounded-full border border-dashed border-[hsl(var(--primary)/0.3)]" />
      {/* Sun */}
      <div className="relative h-20 w-20 rounded-full sun-glow animate-pulse-glow" />
      {/* Earth orbiting */}
      <div className="absolute h-full w-full animate-orbit" style={{ animationDuration: "12s" }}>
        <div
          className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, hsl(var(--earth)), hsl(220 70% 25%))",
            boxShadow: "0 0 20px hsl(var(--earth) / 0.6)",
          }}
        />
      </div>
    </div>
  );
};
