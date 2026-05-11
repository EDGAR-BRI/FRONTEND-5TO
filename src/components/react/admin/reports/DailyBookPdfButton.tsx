import { useMemo, useState } from 'react';
import { Button } from '@/components/react/primary/Button';
import { Select, type SelectOption } from '@/components/react/primary/Select';
import { API_URL } from '@/lib/api';
import { FaFilePdf } from 'react-icons/fa6';

const monthOptions: SelectOption[] = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const yearOptions: SelectOption[] = Array.from({ length: 6 }, (_, index) => {
  const year = new Date().getFullYear() - index;
  return { value: year, label: String(year) };
});

interface DailyBookPdfButtonProps {
  initialMonth?: number;
  initialYear?: number;
}

export default function DailyBookPdfButton({
  initialMonth = new Date().getMonth() + 1,
  initialYear = new Date().getFullYear(),
}: DailyBookPdfButtonProps) {
  const [month, setMonth] = useState<number>(initialMonth);
  const [year, setYear] = useState<number>(initialYear);

  const pdfUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('year', String(year));
    params.set('month', String(month));
    return `${API_URL}/report/daily-book/pdf?${params.toString()}`;
  }, [month, year]);

  const handleExport = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-primary-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <Select
          label="Mes"
          options={monthOptions}
          value={month}
          onChange={(value) => setMonth(Number(value))}
        />
        <Select
          label="Año"
          options={yearOptions}
          value={year}
          onChange={(value) => setYear(Number(value))}
        />
        <Button
          label="Exportar PDF"
          variant="secondary"
          onClick={handleExport}
        >
          <FaFilePdf size={14} /> Exportar PDF
        </Button>
      </div>
    </div>
  );
}
