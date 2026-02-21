import { useState, useEffect, useRef, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTablePageEvent, DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import type { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { fetchArtworks } from './services/artworkService';
import type { Artwork } from './types/artwork';

const App = () => {
  // Main Data States
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [first, setFirst] = useState<number>(0);
  const [rows, setRows] = useState<number>(12);
  const [page, setPage] = useState<number>(1);

  // Persistent Selection Logic
  const [bulkSelectionLimit, setBulkSelectionLimit] = useState<number>(0);
  const [manualSelectionMap, setManualSelectionMap] = useState<Map<number, Artwork>>(new Map());
  const [manualDeselectionMap, setManualDeselectionMap] = useState<Map<number, Artwork>>(new Map());
  
  // Custom Selection Input
  const [selectCount, setSelectCount] = useState<number | null>(null);
  const op = useRef<OverlayPanel>(null);

  useEffect(() => {
    loadArtworks();
  }, [page]);

  const loadArtworks = async () => {
    setLoading(true);
    try {
      const response = await fetchArtworks(page);
      setArtworks(response.data || []);
      setTotalRecords(response.pagination.total || 0);
      if (response.pagination.limit) setRows(response.pagination.limit);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onPage = (event: DataTablePageEvent) => {
    setFirst(event.first);
    setPage((event.page ?? 0) + 1);
  };

  /**
   * Computed selection for the CURRENT page.
   */
  const currentSelection = useMemo(() => {
    return artworks.filter((artwork, index) => {
      const globalIndex = (page - 1) * rows + index + 1;
      if (manualSelectionMap.has(artwork.id)) return true;
      if (manualDeselectionMap.has(artwork.id)) return false;
      return globalIndex <= bulkSelectionLimit;
    });
  }, [artworks, page, rows, bulkSelectionLimit, manualSelectionMap, manualDeselectionMap]);

  /**
   * Total Selected Count across ALL pages.
   */
  const totalSelectedCount = useMemo(() => {
    const bulkCount = Math.min(bulkSelectionLimit, totalRecords);
    return bulkCount + manualSelectionMap.size - manualDeselectionMap.size;
  }, [bulkSelectionLimit, totalRecords, manualSelectionMap.size, manualDeselectionMap.size]);

  /**
   * Handles row checkbox interactions.
   */
  const onSelectionChange = (e: DataTableSelectionMultipleChangeEvent<Artwork[]>) => {
    const nextSelection = e.value;
    const currentSelectionIds = new Set(currentSelection.map(a => a.id));
    const nextSelectionIds = new Set(nextSelection.map(a => a.id));

    const newManualSelection = new Map(manualSelectionMap);
    const newManualDeselection = new Map(manualDeselectionMap);

    artworks.forEach((artwork, index) => {
      const globalIndex = (page - 1) * rows + index + 1;
      const isCurrentlySelected = currentSelectionIds.has(artwork.id);
      const isNextSelected = nextSelectionIds.has(artwork.id);

      if (isCurrentlySelected && !isNextSelected) {
        // Was selected, now deselected
        if (globalIndex <= bulkSelectionLimit) {
          newManualDeselection.set(artwork.id, artwork);
        }
        newManualSelection.delete(artwork.id);
      } else if (!isCurrentlySelected && isNextSelected) {
        // Was deselected, now selected
        if (globalIndex <= bulkSelectionLimit) {
          newManualDeselection.delete(artwork.id);
        } else {
          newManualSelection.set(artwork.id, artwork);
        }
      }
    });

    setManualSelectionMap(newManualSelection);
    setManualDeselectionMap(newManualDeselection);
  };

  const handleBulkSubmit = () => {
    if (selectCount !== null && selectCount >= 0) {
      setBulkSelectionLimit(selectCount);
      setManualSelectionMap(new Map());
      setManualDeselectionMap(new Map());
    }
    op.current?.hide();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Artworks - {totalSelectedCount} Selected</h1>
      
      <DataTable 
        value={artworks} 
        lazy 
        paginator 
        first={first} 
        rows={rows} 
        totalRecords={totalRecords} 
        onPage={onPage}
        loading={loading}
        selection={currentSelection}
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"
        dataKey="id"
        tableStyle={{ minWidth: '60rem' }}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        
        <Column 
          header={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                type="button" 
                icon="pi pi-chevron-down" 
                onClick={(e) => op.current?.toggle(e)} 
                className="p-button-text p-button-secondary p-0"
                style={{ marginLeft: '5px' }}
              />
              <OverlayPanel ref={op} showCloseIcon>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px' }}>
                  <label htmlFor="bulk-count">Select Rows:</label>
                  <InputNumber 
                    id="bulk-count"
                    value={selectCount} 
                    onValueChange={(e: InputNumberValueChangeEvent) => setSelectCount(e.value ?? null)} 
                    placeholder="Enter number..." 
                    min={0}
                  />
                  <Button 
                    label="Apply Selection" 
                    onClick={handleBulkSubmit} 
                    className="p-button-sm"
                  />
                </div>
              </OverlayPanel>
            </div>
          }
          headerStyle={{ width: '3rem' }}
        />

        <Column field="title" header="title" />
        <Column field="place_of_origin" header="place_of_origin" />
        <Column field="artist_display" header="artist_display" />
        <Column field="inscriptions" header="inscriptions" body={(r: Artwork) => r.inscriptions || 'None'} />
        <Column field="date_start" header="date_start" />
        <Column field="date_end" header="date_end" />
      </DataTable>
    </div>
  );
};

export default App;
