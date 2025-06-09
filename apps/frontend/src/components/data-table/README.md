# Data Table with Filters

This directory contains enhanced data table components with filtering capabilities and localStorage persistence.

## Components

### DataTableWithFilters

An enhanced version of the standard DataTable with multi-select filtering capabilities.

#### Features

- **Multi-select filters**: Filter by multiple values in dropdown menus
- **localStorage persistence**: Filters and column visibility are remembered between page reloads
- **Active filter display**: Shows currently applied filters as removable badges
- **Clear filters**: Individual and bulk filter clearing
- **Search**: Standard text search functionality
- **Column visibility**: Show/hide columns with persistence
- **Shift+click**: Select/deselect all other filter items

#### Usage

```tsx
import { DataTableWithFilters, FilterConfig } from '@/components/data-table/data-table-with-filters';

const filters: FilterConfig[] = [
  {
    key: 'status', // Column accessor key
    label: 'Status', // Display label
    type: 'multiselect',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
];

<DataTableWithFilters
  columns={columns}
  data={data}
  searchKey="name"
  searchPlaceholder="Search items..."
  filters={filters}
  storageKey="my-table" // Unique key for localStorage
/>
```

#### Column Configuration

For columns that support filtering, add a `filterFn` to the column definition:

```tsx
{
  accessorKey: 'status',
  header: 'Status',
  filterFn: (row, columnId, filterValue) => {
    if (!filterValue || filterValue.length === 0) return true;
    const cellValue = row.getValue(columnId) as string;
    return filterValue.includes(cellValue);
  },
  cell: ({ row }) => {
    // Cell rendering logic
  },
}
```

#### Filter Types

- **multiselect**: Multiple checkbox selection in dropdown

#### localStorage

- **Filters**: Automatically saved to localStorage using the key `table-filters-${storageKey}` and restored on page load
- **Column Visibility**: Automatically saved to localStorage using the key `table-columns-${storageKey}` and restored on page load

## Examples

### Content Items Table

- **Status filter**: Filter by processing status (None, Download Queued, Processing, etc.)
- **Source filter**: Filter by content source
- **Notifications filter**: Filter by notification status (Sent/Pending)

### Sources Table

- **Type filter**: Filter by source type (RSS, API, etc.)
- **Status filter**: Filter by active/inactive status

## Implementation Notes

- Filters work with nested object properties (e.g., `source.name`)
- Boolean values are converted to strings for filtering
- Filter state persists across page reloads
- Multiple filters can be applied simultaneously
- Filters are combined with AND logic (all must match) 