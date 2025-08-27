import { Search } from 'lucide-react';
import { FileType } from '@/lib/fileUtils';

interface SearchAndFilterProps {
  searchQuery: string;
  selectedType: string;
  onSearchChange: (query: string) => void;
  onTypeChange: (type: string) => void;
}

export const SearchAndFilter = ({ 
  searchQuery, 
  selectedType, 
  onSearchChange, 
  onTypeChange 
}: SearchAndFilterProps) => {
  const fileTypeOptions = [
    { value: '', label: 'Semua' },
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'Word' },
    { value: 'sheet', label: 'Excel/Sheet' },
    { value: 'img', label: 'Gambar' },
    { value: 'zip', label: 'ZIP' }
  ];

  return (
    <div className="bg-journal-card border border-journal-border rounded-2xl p-6 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari judul atau nama file..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-journal-border bg-journal-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-journal-border bg-journal-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            {fileTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};