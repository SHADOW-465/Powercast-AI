interface GeneratorInputProps {
  units: { id: string; name: string; capacityMW: number }[];
  onChange: (units: { id: string; name: string; capacityMW: number }[]) => void;
}

export default function GeneratorInput({ units, onChange }: GeneratorInputProps) {
  const handleCapacityChange = (id: string, newCapacity: number) => {
    const updated = units.map(u =>
      u.id === id ? { ...u, capacityMW: newCapacity } : u
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
        {units.map((unit) => (
            <div key={unit.id} className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">{unit.name}</span>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={unit.capacityMW}
                        onChange={(e) => handleCapacityChange(unit.id, Number(e.target.value))}
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-right text-white focus:border-cyan-500 outline-none"
                    />
                    <span className="text-xs text-slate-500">MW</span>
                </div>
            </div>
        ))}
    </div>
  );
}
