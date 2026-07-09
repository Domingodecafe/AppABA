"use client";

const pieces = Array.from({ length: 34 }, (_, index) => ({
  id: index,
  left: `${(index * 29) % 100}%`,
  delay: `${(index % 9) * 0.08}s`,
  color: ["#4f6f52", "#d89b4a", "#b86b4b", "#3f7cac", "#6f5aa7"][index % 5]
}));

export function ConfettiCelebration({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            backgroundColor: piece.color
          }}
        />
      ))}
    </div>
  );
}
