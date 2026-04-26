import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X } from 'lucide-react';
import { Button } from './Button';

interface Props {
  onAdd: (dates: { date: string; start_time: string }[]) => void;
  onClose: () => void;
}

const DAYS = [
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mer', value: 3 },
  { label: 'Jeu', value: 4 },
  { label: 'Ven', value: 5 },
  { label: 'Sam', value: 6 },
  { label: 'Dim', value: 0 },
];

const today = format(new Date(), 'yyyy-MM-dd');
const in8weeks = format(addDays(new Date(), 56), 'yyyy-MM-dd');

export const RecurringDateModal: React.FC<Props> = ({ onAdd, onClose }) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(in8weeks);
  const [time, setTime] = useState('19:00');

  const toggleDay = (v: number) =>
    setSelectedDays(prev => prev.includes(v) ? prev.filter(d => d !== v) : [...prev, v]);

  const generateDates = () => {
    const result: { date: string; start_time: string }[] = [];
    let current = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    while (current <= end) {
      if (selectedDays.includes(current.getDay())) {
        result.push({ date: format(current, 'yyyy-MM-dd'), start_time: time });
      }
      current = addDays(current, 1);
    }
    return result;
  };

  const preview = generateDates();

  const handleAdd = () => {
    if (preview.length === 0) return;
    onAdd(preview);
  };

  const formatPreviewDate = (dateStr: string) => {
    const d = format(new Date(dateStr + 'T00:00:00'), 'EEE d MMM', { locale: fr });
    return d.charAt(0).toUpperCase() + d.slice(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-encre/30" onClick={onClose} />
      <div className="relative bg-white border-2 border-encre w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-trait flex-shrink-0">
          <h2 className="handwriting text-2xl text-encre">Dates récurrentes</h2>
          <button onClick={onClose} className="text-crayon hover:text-rouge transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Day selector */}
          <div>
            <p className="handwriting text-lg text-encre mb-2">Quel(s) jour(s) ?</p>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`handwriting text-lg px-3 py-1 border-2 transition-colors ${
                    selectedDays.includes(day.value)
                      ? 'border-rouge bg-rouge text-white'
                      : 'border-trait text-crayon hover:border-encre hover:text-encre'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="handwriting text-lg text-encre mb-1">À partir du</p>
              <input
                type="date"
                className="w-full bg-papier border-2 border-trait px-3 py-2 text-encre text-sm focus:outline-none focus:border-encre transition-colors"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <p className="handwriting text-lg text-encre mb-1">Jusqu'au</p>
              <input
                type="date"
                className="w-full bg-papier border-2 border-trait px-3 py-2 text-encre text-sm focus:outline-none focus:border-encre transition-colors"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Time */}
          <div>
            <p className="handwriting text-lg text-encre mb-1">Heure</p>
            <input
              type="time"
              className="bg-papier border-2 border-trait px-3 py-2 text-encre text-sm focus:outline-none focus:border-encre transition-colors"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>

          {/* Preview */}
          {selectedDays.length > 0 && (
            <div>
              <p className="handwriting text-lg text-encre mb-2">
                {preview.length === 0 ? 'Aucune date trouvée' : `${preview.length} créneau${preview.length > 1 ? 'x' : ''} générés`}
              </p>
              {preview.length > 0 && (
                <div className="bg-papier border border-trait p-3 max-h-40 overflow-y-auto">
                  <div className="flex flex-wrap gap-1.5">
                    {preview.map(d => (
                      <span key={d.date} className="handwriting text-base text-encre bg-white border border-trait px-2 py-0.5">
                        {formatPreviewDate(d.date)} {d.start_time}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-trait flex gap-3 flex-shrink-0">
          <Button onClick={handleAdd} disabled={preview.length === 0} className="flex-1">
            Ajouter {preview.length > 0 ? `${preview.length} créneau${preview.length > 1 ? 'x' : ''}` : ''} →
          </Button>
          <button onClick={onClose} className="handwriting text-lg text-crayon hover:text-encre transition-colors px-4">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};
