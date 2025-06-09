# Data Table with Filters

This directory contains enhanced data table components with filtering capabilities and localStorage persistence.

## Components

### DataTableWithFilters (Client-Side)

An enhanced version of the standard DataTable with multi-select filtering capabilities that filters data on the client side.

### DataTableServerSide (Server-Side) ⭐ **Recommended**

A server-side filtering version that sends filter parameters to the API, ideal for large datasets.

#### Features

- **Server-side filtering**: Filters are applied on the server, reducing data transfer
- **Server-side pagination**: Only loads the data needed for the current page
- **Multi-select filters**: Filter by multiple values in dropdown menus
- **localStorage persistence**: Filters and column visibility are remembered between page reloads
- **Active filter display**: Shows currently applied filters as removable badges
- **Clear filters**: Individual and bulk filter clearing
- **Debounced search**: Search with 300ms debounce to reduce API calls
- **Column visibility**: Show/hide columns with persistence
- **Shift+click**: Select/deselect all other filter items

#### Usage

```tsx
import { DataTableServerSide, FilterConfig } from '@/components/data-table/data-table-server-side';

const [filters, setFilters] = React.useState<Record<string, string[]>>({});
const [search, setSearch] = React.useState('');
const [pagination, setPagination] = React.useState({ offset: 0, limit: 100 });

const { data, isLoading } = useQuery({
  queryKey: ['items', filters, search, pagination],
  queryFn: () => fetchItems(filters, search, pagination.offset, pagination.limit),
});

const filterConfigs: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
];

<DataTableServerSide
  columns={columns}
  data={data?.items || []}
  searchKey="name"
  searchPlaceholder="Search items..."
  filters={filterConfigs}
  storageKey="my-table"
  onFiltersChange={setFilters}
  onSearchChange={setSearch}
  isLoading={isLoading}
  pagination={data?.pagination}
  onPaginationChange={(offset, limit) => setPagination({ offset, limit })}
/>
```

#### API Requirements

Your API endpoint should support the following query parameters:

- `limit`: Number of items per page
- `offset`: Starting position for pagination
- `search`: Search term for text filtering
- Filter parameters: Each filter key with comma-separated values

Example API response:
```json
{
  "items": [...],
  "pagination": {
    "total": 1000,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Filter Types

- **multiselect**: Multiple checkbox selection in dropdown

#### localStorage

- **Filters**: Automatically saved to localStorage using the key `table-filters-${storageKey}` and restored on page load
- **Column Visibility**: Automatically saved to localStorage using the key `table-columns-${storageKey}` and restored on page load

## Examples

### Content Items Table (Server-Side)

- **Status filter**: Filter by processing status (None, Download Queued, Processing, etc.)
- **Source filter**: Filter by content source
- **Notifications filter**: Filter by notification status (Sent/Pending)
- **Search**: Search in title and description
- **Pagination**: 100 items per page with server-side pagination

### Sources Table (Server-Side)

- **Type filter**: Filter by source type (RSS, API, etc.)
- **Status filter**: Filter by active/inactive status
- **Search**: Search in name and URL
- **Pagination**: 100 items per page with server-side pagination

## Performance Benefits

### Server-Side vs Client-Side

**Server-Side (DataTableServerSide)** ✅ **Recommended for production**
- Only loads filtered data from the server
- Supports large datasets (thousands of records)
- Reduces memory usage on the client
- Faster initial page loads
- Better for SEO and accessibility

**Client-Side (DataTableWithFilters)**
- Loads all data then filters on the client
- Good for small datasets (< 1000 records)
- Instant filtering after initial load
- Simpler implementation

## Implementation Notes

- Filters work with nested object properties (e.g., `source.name`)
- Boolean values are converted to strings for filtering
- Filter state persists across page reloads
- Multiple filters can be applied simultaneously
- Filters are combined with AND logic (all must match)
- Search is debounced to reduce API calls
- Pagination resets to first page when filters or search change 