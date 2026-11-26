import { motion as Motion } from 'framer-motion';

function scoreColor(score) {
  if (score >= 75) return '#16A34A';
  if (score >= 50) return '#D97706';
  return '#DC2626';
}

export default function ScoreRing({ score = 0, size = 92, stroke = 8, label = 'ATS' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color = scoreColor(clamped);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EEF0F3"
          strokeWidth={stroke}
        />
        <Motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold tracking-tight text-[#0E1318]">{Math.round(clamped)}</span>
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">{label}</span>
      </div>
    </div>
  );
}
