import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PostFiltersProps {
  sortBy: 'time' | 'distance';
  filter: string;
  onSortChange: (value: 'time' | 'distance') => void;
  onFilterChange: (value: string) => void;
}

export function PostFilters({ 
  sortBy, 
  filter, 
  onSortChange, 
  onFilterChange 
}: PostFiltersProps) {
  return (
    <div className="flex gap-2 mb-6">
      <SortSelect value={sortBy} onChange={onSortChange} />
      <FilterSelect value={filter} onChange={onFilterChange} />
    </div>
  );
}

function SortSelect({ 
  value, 
  onChange 
}: { 
  value: 'time' | 'distance'; 
  onChange: (value: 'time' | 'distance') => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="time">時系列順</SelectItem>
        <SelectItem value="distance">距離順</SelectItem>
      </SelectContent>
    </Select>
  );
}

function FilterSelect({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="フィルター" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">すべて</SelectItem>
        <SelectItem value="event">イベント</SelectItem>
        <SelectItem value="food">グルメ</SelectItem>
        <SelectItem value="shopping">ショッピング</SelectItem>
      </SelectContent>
    </Select>
  );
} 