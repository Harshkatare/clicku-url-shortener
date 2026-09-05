interface PasswordStrengthMeterProps {
  password: string;
}

const STRENGTH_LEVELS = [
  { label: "Too weak", barColor: "bg-red-500", textColor: "text-red-600 dark:text-red-400" },
  { label: "Weak", barColor: "bg-red-500", textColor: "text-red-600 dark:text-red-400" },
  { label: "Fair", barColor: "bg-orange-500", textColor: "text-orange-600 dark:text-orange-400" },
  { label: "Good", barColor: "bg-yellow-500", textColor: "text-yellow-600 dark:text-yellow-400" },
  { label: "Strong", barColor: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
] as const;

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const current = STRENGTH_LEVELS[score];

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              score > 0 && i < score ? current.barColor : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">Password strength</span>
        <span className={`font-medium ${current.textColor}`}>
          {current.label}
        </span>
      </div>
    </div>
  );
}
