import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { translations } from '@translations';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import TablePagination from './TablePagination';
import TableSearch from './TableSearch';
import TableFilter from './TableFilter';

export default function DataTable({
  columns,
  data,
  selectable = true,
  actions = true,
  onEdit,
  onDelete,
  onView,
  onGenerateReport, // إضافة الخاصية الجديدة
  searchable = true,
  filterable = true,
  customActions,
  buttons = [],
}) {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const isDark = useSelector((state) => state.theme.darkMode === 'dark');
  const language = useSelector((state) => state.language.current);
  const t = translations[language];

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (searchQuery) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchQuery, filters, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredData.slice(start, start + perPage);
  }, [filteredData, currentPage, perPage]);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  return (
    <div
      className={`rounded-lg border m-4 max-sm:m-1 ${isDark ? 'bg-DarkBG1 border-DarkBG3' : 'bg-LightBG1 border-LightBG2'}`}
    >
      <div className="p-4 max-sm:p-2">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {searchable && (
            <TableSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t.search}
            />
          )}
          {filterable && (
            <TableFilter
              columns={columns}
              filters={filters}
              onChange={setFilters}
            />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDark ? 'divide-DarkBG1' : 'divide-LightBG3'}`}>
            <TableHeader
              columns={columns}
              selectable={selectable}
              sortConfig={sortConfig}
              onSort={handleSort}
              onSelectAll={handleSelectAll}
              selectedRows={selectedRows}
              totalRows={paginatedData.length}
            />
            <tbody
              className={`divide-y ${isDark ? 'divide-DarkBG1' : 'divide-LightBG3'}`}
            >
              {paginatedData.map((row, index) => (
                <TableRow
                  key={row.id}
                  row={row}
                  columns={columns}
                  selectable={selectable}
                  actions={actions}
                  selected={selectedRows.has(index)}
                  onSelect={() => handleSelectRow(index)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  onGenerateReport={onGenerateReport} // تمرير الدالة إلى TableRow
                  customActions={customActions}
                  buttons={buttons}
                  t={t}
                />
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          total={filteredData.length}
          perPage={perPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onPerPageChange={setPerPage}
        />
      </div>
    </div>
  );
}