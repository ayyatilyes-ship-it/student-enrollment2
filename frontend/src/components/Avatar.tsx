import React from "react";

interface AvatarProps {
  name: string;
  size?: "sm" | "lg";
}

const GRADIENTS = [
  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
  "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
];

function getGradientForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = "sm" }) => {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const background = getGradientForName(name);

  if (size === "lg") {
    return (
      <div className="detail-avatar-large" style={{ background }}>
        {initial}
      </div>
    );
  }

  return (
    <div className="avatar-sm" style={{ background }}>
      {initial}
    </div>
  );
};
