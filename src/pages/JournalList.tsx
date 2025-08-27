import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileItem, BASE_URL, debounce, getFileType } from '@/lib/fileUtils';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { FileList } from '@/components/FileList';
import { Layout } from '@/components/Layout';
import { FileText, Sparkles } from 'lucide-react';

const JournalList = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const itemsPerPage = 20;

  const toast = useToast();

  // Get search params
  const searchQuery = searchParams.get('q') || '';
  const selectedType = searchParams.get('type') || '';

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      setSearchParams(params);
    }, 300),
    [searchParams, setSearchParams]
  );

  // Handle search change
  const handleSearchChange = (query: string) => {
    debouncedSearch(query);
  };

  // Handle type filter change
  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams);
    if (type) {
      params.set('type', type);
    } else {
      params.delete('type');
    }
    setSearchParams(params);
  };

  // Fetch files from API
  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedType) params.append('type', selectedType);
      
      const response = await fetch(`${BASE_URL}/api/files?${params}`);
      if (!response.ok) {
        throw new Error('Gagal memuat file');
      }
      
      const data: FileItem[] = await response.json();
      
      // Sort by upload date (newest first)
      const sortedFiles = data.sort((a, b) => 
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
      );
      
      setFiles(sortedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter files based on search and type
  useEffect(() => {
    let filtered = [...files];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(file => 
        (file.title?.toLowerCase().includes(query)) || 
        file.original_name.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(file => {
        const fileType = getFileType(file.mimetype, file.original_name);
        return fileType === selectedType;
      });
    }

    setFilteredFiles(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [files, searchQuery, selectedType]);

  // Initial load
  useEffect(() => {
    fetchFiles().finally(() => {
      // Show skeleton for minimum 800ms for better UX
      setTimeout(() => setShowSkeleton(false), 800);
    });
  }, [searchQuery, selectedType]);

  // Handle file deletion (optimistic update)
  const handleFileDelete = (id: number) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    toast.success('File berhasil dihapus');
  };

  // Get paginated files
  const paginatedFiles = filteredFiles.slice(0, currentPage * itemsPerPage);
  const hasMore = filteredFiles.length > currentPage * itemsPerPage;

  // Load more files
  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Daftar Jurnal</h1>
          </div>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <span>Daftar</span>
            <span>Cari</span>
            <span>Filter</span>
            <span>Jurnal Terbaru</span>
          </p>
        </header>

        <div className="space-y-6">
          {/* Search and Filter */}
          <SearchAndFilter
            searchQuery={searchQuery}
            selectedType={selectedType}
            onSearchChange={handleSearchChange}
            onTypeChange={handleTypeChange}
          />

          {/* File List */}
          <FileList
            files={paginatedFiles}
            isLoading={isLoading}
            error={error}
            onRefresh={fetchFiles}
            onDelete={handleFileDelete}
            showSkeleton={showSkeleton}
          />

          {/* Load More Button */}
          {hasMore && !isLoading && !error && (
            <div className="text-center">
              <button
                onClick={loadMore}
                className="bg-secondary text-secondary-foreground font-bold rounded-xl px-6 py-3 hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
              >
                Muat Lebih Banyak ({filteredFiles.length - paginatedFiles.length} tersisa)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </Layout>
  );
};

export default JournalList;