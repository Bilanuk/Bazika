'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect';
  options: { value: string; label: string }[];
}

interface DataTableWithFiltersProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  storageKey?: string; // For localStorage persistence
}

export function DataTableWithFilters<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  filters = [],
  storageKey,
}: DataTableWithFiltersProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({});
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load filters and column visibility from localStorage on mount
  React.useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        // Load filters
        const savedFilters = localStorage.getItem(`table-filters-${storageKey}`);
        console.log('Loading filters from localStorage:', savedFilters); // Debug log
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          console.log('Parsed filters:', parsedFilters); // Debug log
          setActiveFilters(parsedFilters);
          
          // Convert to column filters format
          const columnFiltersFromStorage: ColumnFiltersState = Object.entries(parsedFilters)
            .filter(([_, values]) => Array.isArray(values) && values.length > 0)
            .map(([key, values]) => ({
              id: key,
              value: values as string[],
            }));
          console.log('Setting column filters:', columnFiltersFromStorage); // Debug log
          setColumnFilters(columnFiltersFromStorage);
        }

        // Load column visibility
        const savedColumnVisibility = localStorage.getItem(`table-columns-${storageKey}`);
        console.log('Loading column visibility from localStorage:', savedColumnVisibility); // Debug log
        if (savedColumnVisibility) {
          const parsedColumnVisibility = JSON.parse(savedColumnVisibility);
          console.log('Parsed column visibility:', parsedColumnVisibility); // Debug log
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
  }, [storageKey]);

  // Save filters to localStorage when they change (but only after initial load)
  React.useEffect(() => {
    if (isLoaded && storageKey && typeof window !== 'undefined') {
      try {
        console.log('Saving filters to localStorage:', activeFilters); // Debug log
        localStorage.setItem(`table-filters-${storageKey}`, JSON.stringify(activeFilters));
      } catch (error) {
        console.error('Error saving filters to localStorage:', error);
      }
    }
  }, [activeFilters, storageKey, isLoaded]);

  // Save column visibility to localStorage when it changes (but only after initial load)
  React.useEffect(() => {
    if (isLoaded && storageKey && typeof window !== 'undefined') {
      try {
        console.log('Saving column visibility to localStorage:', columnVisibility); // Debug log
        localStorage.setItem(`table-columns-${storageKey}`, JSON.stringify(columnVisibility));
      } catch (error) {
        console.error('Error saving column visibility to localStorage:', error);
      }
    }
  }, [columnVisibility, storageKey, isLoaded]);

  // Sync column filters back to activeFilters when table state changes
  React.useEffect(() => {
    if (isLoaded) {
      const newActiveFilters: Record<string, string[]> = {};
      columnFilters.forEach(filter => {
        if (Array.isArray(filter.value)) {
          newActiveFilters[filter.id] = filter.value;
        }
      });
      
      // Only update if there's actually a change to avoid infinite loops
      const currentKeys = Object.keys(activeFilters).sort();
      const newKeys = Object.keys(newActiveFilters).sort();
      const hasChanged = currentKeys.length !== newKeys.length || 
        currentKeys.some(key => !newActiveFilters[key] || 
          JSON.stringify(activeFilters[key]?.sort()) !== JSON.stringify(newActiveFilters[key]?.sort()));
      
      if (hasChanged) {
        console.log('Syncing column filters to activeFilters:', newActiveFilters); // Debug log
        setActiveFilters(newActiveFilters);
      }
    }
  }, [columnFilters, isLoaded]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    filterFns: {
      multiSelect: (row, columnId, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        const cellValue = row.getValue(columnId) as string;
        return filterValue.includes(cellValue);
      },
    },
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

    // Update column filters
    const columnFilter = table.getColumn(filterKey);
    if (columnFilter) {
      columnFilter.setFilterValue(newFilters[filterKey]);
    }
  };

  const clearFilter = (filterKey: string) => {
    const newFilters = { ...activeFilters };
    newFilters[filterKey] = [];
    setActiveFilters(newFilters);

    const columnFilter = table.getColumn(filterKey);
    if (columnFilter) {
      columnFilter.setFilterValue([]);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setColumnFilters([]);
  };

  const hasActiveFilters = Object.values(activeFilters).some(values => values.length > 0);

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
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
            <div className="border-t my-1" />
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
            {table.getRowModel().rows?.length ? (
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 