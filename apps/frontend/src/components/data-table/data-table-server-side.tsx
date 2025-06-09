'use client';

import * as React from 'react';
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, Filter, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect';
  options: { value: string; label: string }[];
}

interface DataTableServerSideProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  storageKey?: string;
  onFiltersChange?: (filters: Record<string, string[]>) => void;
  onSearchChange?: (search: string) => void;
  isLoading?: boolean;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  onPaginationChange?: (offset: number, limit: number) => void;
}

export function DataTableServerSide<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  filters = [],
  storageKey,
  onFiltersChange,
  onSearchChange,
  isLoading = false,
  pagination,
  onPaginationChange,
}: DataTableServerSideProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({});
  const [searchValue, setSearchValue] = React.useState('');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const isInitialLoadRef = React.useRef(true);

  // Debounce search
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Load filters and column visibility from localStorage on mount
  React.useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        // Load filters
        const savedFilters = localStorage.getItem(`table-filters-${storageKey}`);
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          setActiveFilters(parsedFilters);
          // Don't call onFiltersChange during initial load to prevent infinite loop
        }

        // Load column visibility
        const savedColumnVisibility = localStorage.getItem(`table-columns-${storageKey}`);
        if (savedColumnVisibility) {
          const parsedColumnVisibility = JSON.parse(savedColumnVisibility);
          setColumnVisibility(parsedColumnVisibility);
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        setIsLoaded(true);
      }
    } else {
      setIsLoaded(true);
    }
  }, [storageKey]); // Removed onFiltersChange dependency

  // Save filters to localStorage when they change
  React.useEffect(() => {
    if (isLoaded && storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`table-filters-${storageKey}`, JSON.stringify(activeFilters));
      } catch (error) {
        console.error('Error saving filters to localStorage:', error);
      }
    }
  }, [activeFilters, storageKey, isLoaded]);

  // Call onFiltersChange when filters change (but not during initial load)
  React.useEffect(() => {
    if (isLoaded && !isInitialLoadRef.current) {
      onFiltersChange?.(activeFilters);
    }
    if (isLoaded) {
      isInitialLoadRef.current = false;
    }
  }, [activeFilters, isLoaded]); // Removed onFiltersChange dependency

  // Save column visibility to localStorage when it changes
  React.useEffect(() => {
    if (isLoaded && storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`table-columns-${storageKey}`, JSON.stringify(columnVisibility));
      } catch (error) {
        console.error('Error saving column visibility to localStorage:', error);
      }
    }
  }, [columnVisibility, storageKey, isLoaded]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    manualFiltering: true, // Server-side filtering
    manualPagination: true, // Server-side pagination
  });

  const handleFilterChange = (filterKey: string, value: string, isShiftClick: boolean = false) => {
    const newFilters = { ...activeFilters };
    
    if (!newFilters[filterKey]) {
      newFilters[filterKey] = [];
    }

    if (isShiftClick) {
      // Shift+click: select/deselect all other items
      const filter = filters.find(f => f.key === filterKey);
      if (filter) {
        const allValues = filter.options.map(option => option.value);
        const otherValues = allValues.filter(v => v !== value);
        
        if (newFilters[filterKey].includes(value)) {
          // If current item is selected, deselect all others
          newFilters[filterKey] = [value];
        } else {
          // If current item is not selected, select all others
          newFilters[filterKey] = otherValues;
        }
      }
    } else {
      // Normal click: toggle single item
      if (newFilters[filterKey].includes(value)) {
        // Remove filter
        newFilters[filterKey] = newFilters[filterKey].filter(v => v !== value);
      } else {
        // Add filter
        newFilters[filterKey] = [...newFilters[filterKey], value];
      }
    }

    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilter = (filterKey: string) => {
    const newFilters = { ...activeFilters };
    newFilters[filterKey] = [];
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFiltersChange?.({});
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      onSearchChange?.(value);
    }, 300);
  };

  const hasActiveFilters = Object.values(activeFilters).some(values => values.length > 0);

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="max-w-sm"
          />
        )}

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <DropdownMenu key={filter.key}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="mr-2 h-4 w-4" />
                  {filter.label}
                  {activeFilters[filter.key]?.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilters[filter.key].length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {filter.options.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={activeFilters[filter.key]?.includes(option.value) || false}
                    onCheckedChange={() => {}} // Prevent default behavior
                    onClick={(event) => {
                      event.preventDefault();
                      const isShiftClick = event.shiftKey;
                      handleFilterChange(filter.key, option.value, isShiftClick);
                    }}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
                {activeFilters[filter.key]?.length > 0 && (
                  <>
                    <div className="border-t my-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8"
                      onClick={() => clearFilter(filter.key)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2 lg:px-3"
            >
              Clear all
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8"
              onClick={() => {
                // Reset to default visibility (all columns visible)
                setColumnVisibility({});
              }}
            >
              Reset Columns
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(activeFilters).map(([filterKey, values]) =>
            values.map((value) => {
              const filter = filters.find(f => f.key === filterKey);
              const option = filter?.options.find(o => o.value === value);
              return (
                <Badge key={`${filterKey}-${value}`} variant="secondary" className="gap-1">
                  {filter?.label}: {option?.label || value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleFilterChange(filterKey, value)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })
          )}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginationChange?.(Math.max(0, pagination.offset - pagination.limit), pagination.limit)}
              disabled={pagination.offset === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginationChange?.(pagination.offset + pagination.limit, pagination.limit)}
              disabled={!pagination.hasMore}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 