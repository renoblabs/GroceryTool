'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabaseClient';
import { isDemoMode, createDemoList } from '@/lib/demoMode';

type ImportMethod = 'file' | 'text' | 'url';
type ParsedItem = {
  item: string;
  quantity?: number;
  unit?: string;
  notes?: string;
};

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMethod, setImportMethod] = useState<ImportMethod>('file');
  const [listName, setListName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    parseFile(file);
  }, []);

  // Parse the selected file
  const parseFile = useCallback((file: File) => {
    setError(null);
    const fileType = file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv';
    
    if (fileType === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (Array.isArray(json)) {
            const validItems = json
              .filter(item => typeof item === 'object' && item !== null && 'item' in item)
              .map(({ item, quantity, unit, notes }) => ({
                item: String(item),
                quantity: quantity ? Number(quantity) : undefined,
                unit: unit ? String(unit) : undefined,
                notes: notes ? String(notes) : undefined,
              }));
            
            if (validItems.length === 0) {
              setError('No valid items found in JSON');
              return;
            }
            
            setParsedItems(validItems);
          } else {
            setError('JSON must be an array of items');
          }
        } catch (err) {
          setError('Invalid JSON format');
          console.error(err);
        }
      };
      reader.onerror = () => setError('Error reading file');
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`CSV parsing error: ${results.errors[0].message}`);
            return;
          }
          
          const items = results.data
            .filter((row: any) => row.item || row.Item || row.NAME || row.name || row.product)
            .map((row: any) => {
              // Try to find the item column using various common names
              const item = row.item || row.Item || row.NAME || row.name || row.product || '';
              const quantity = parseFloat(row.quantity || row.Quantity || row.qty || row.QTY || '');
              const unit = row.unit || row.Unit || row.UNIT || '';
              const notes = row.notes || row.Notes || row.description || row.Description || '';
              
              return {
                item,
                quantity: isNaN(quantity) ? undefined : quantity,
                unit: unit || undefined,
                notes: notes || undefined,
              };
            });
          
          if (items.length === 0) {
            setError('No valid items found in CSV');
            return;
          }
          
          setParsedItems(items);
        },
        error: (err: any) => {
          setError(`CSV parsing error: ${err.message}`);
          console.error(err);
        }
      });
    }
  }, []);

  // Parse text input (one item per line)
  const parseTextInput = useCallback(() => {
    setError(null);
    if (!textInput.trim()) {
      setError('Please enter some items');
      return;
    }
    
    const lines = textInput
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    
    if (lines.length === 0) {
      setError('No items found');
      return;
    }
    
    const parsedItems: ParsedItem[] = lines.map(line => {
      // Try to parse quantity and unit from the line
      // Examples: "2x 4L milk", "1kg rice", "5 apples"
      const qtyUnitRegex = /^(\d+(?:\.\d+)?)\s*(?:x\s*)?(\w+)?\s+(.+)$/i;
      const match = line.match(qtyUnitRegex);
      
      if (match) {
        const [, qtyStr, possibleUnit, itemName] = match;
        const quantity = parseFloat(qtyStr);
        
        // Check if the possible unit is actually a unit or part of the item name
        const commonUnits = ['kg', 'g', 'l', 'ml', 'oz', 'lb', 'dozen', 'dz', 'ea'];
        const isUnit = commonUnits.includes(possibleUnit?.toLowerCase());
        
        if (isUnit) {
          return {
            item: itemName.trim(),
            quantity,
            unit: possibleUnit,
          };
        } else {
          // If not a recognized unit, treat as part of the item name
          return {
            item: `${possibleUnit} ${itemName}`.trim(),
            quantity,
          };
        }
      }
      
      // If no quantity/unit pattern, just use the whole line as the item
      return { item: line };
    });
    
    setParsedItems(parsedItems);
  }, [textInput]);

  // Fetch and parse Google Sheets URL
  const fetchSheetsCsv = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      if (!urlInput.trim()) {
        setError('Please enter a Google Sheets URL');
        return;
      }
      
      // Check if it's a Google Sheets URL
      if (!urlInput.includes('docs.google.com/spreadsheets')) {
        setError('URL must be a Google Sheets document');
        return;
      }
      
      // If it's a view/edit URL, try to convert to CSV export URL
      let csvUrl = urlInput;
      if (!urlInput.includes('/export')) {
        // Extract the sheet ID
        const matches = urlInput.match(/\/d\/([^/]+)/);
        if (!matches || !matches[1]) {
          setError('Invalid Google Sheets URL format');
          return;
        }
        
        const sheetId = matches[1];
        csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      }
      
      // Fetch the CSV
      const response = await fetch('/api/proxy-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: csvUrl }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Google Sheet');
      }
      
      const csvText = await response.text();
      
      // Parse the CSV
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`CSV parsing error: ${results.errors[0].message}`);
            return;
          }
          
          const items = results.data
            .filter((row: any) => row.item || row.Item || row.NAME || row.name || row.product)
            .map((row: any) => {
              const item = row.item || row.Item || row.NAME || row.name || row.product || '';
              const quantity = parseFloat(row.quantity || row.Quantity || row.qty || row.QTY || '');
              const unit = row.unit || row.Unit || row.UNIT || '';
              const notes = row.notes || row.Notes || row.description || row.Description || '';
              
              return {
                item,
                quantity: isNaN(quantity) ? undefined : quantity,
                unit: unit || undefined,
                notes: notes || undefined,
              };
            });
          
          if (items.length === 0) {
            setError('No valid items found in the Google Sheet');
            return;
          }
          
          setParsedItems(items);
        },
        error: (err: any) => {
          setError(`CSV parsing error: ${err.message}`);
          console.error(err);
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch or parse Google Sheet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [urlInput]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      parseFile(files[0]);
    }
  }, [parseFile]);

  // Save the list
  const saveList = async () => {
    setError(null);
    
    if (!listName.trim()) {
      setError('Please enter a list name');
      return;
    }
    
    if (parsedItems.length === 0) {
      setError('No items to save');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isDemoMode()) {
        const demoItems = parsedItems.map(({ item, ...rest }) => ({
          raw_text: item,
          ...rest
        }));
        const newList = createDemoList(listName, demoItems);
        router.push(`/lists/${newList.id}`);
        return;
      }

      // Get current session and token
      const { data: { session } } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (!token) {
        router.push('/login?redirect=/import');
        return;
      }
      
      // Create the list
      const response = await fetch('/api/lists/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: listName,
          items: parsedItems,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create list');
      }
      
      const { id } = await response.json();
      router.push(`/lists/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-page">
      <h1 className="text-xl mb-4">Import Grocery List</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="tabs mb-4">
        <button
          className={`tab ${importMethod === 'file' ? 'active' : ''}`}
          onClick={() => setImportMethod('file')}
        >
          Upload File
        </button>
        <button
          className={`tab ${importMethod === 'text' ? 'active' : ''}`}
          onClick={() => setImportMethod('text')}
        >
          Paste Text
        </button>
        <button
          className={`tab ${importMethod === 'url' ? 'active' : ''}`}
          onClick={() => setImportMethod('url')}
        >
          Google Sheets
        </button>
      </div>
      
      <div className="import-content mb-6">
        {importMethod === 'file' && (
          <div
            className={`import-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.json"
              className="hidden"
            />
            <p>Drag & drop a CSV or JSON file here, or click to browse</p>
            <p className="text-sm text-gray">Supported formats: CSV, JSON</p>
          </div>
        )}
        
        {importMethod === 'text' && (
          <div className="form-group">
            <label htmlFor="textInput">Paste your grocery list (one item per line)</label>
            <textarea
              id="textInput"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="2x 4L milk&#10;1kg rice&#10;5 apples&#10;bread"
              rows={10}
              className="w-full"
            />
            <button
              onClick={parseTextInput}
              disabled={loading || !textInput.trim()}
              className="btn mt-2"
            >
              Parse Items
            </button>
          </div>
        )}
        
        {importMethod === 'url' && (
          <div className="form-group">
            <label htmlFor="urlInput">Google Sheets URL</label>
            <input
              id="urlInput"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full"
            />
            <p className="text-sm text-gray mt-1">
              Make sure your sheet is published to the web or shared with anyone with the link
            </p>
            <button
              onClick={fetchSheetsCsv}
              disabled={loading || !urlInput.trim()}
              className="btn mt-2"
            >
              Fetch Sheet
            </button>
          </div>
        )}
      </div>
      
      {parsedItems.length > 0 && (
        <div className="preview mb-6">
          <h2 className="mb-2">Preview ({parsedItems.length} items)</h2>
          
          <div className="form-group mb-4">
            <label htmlFor="listName">List Name</label>
            <input
              id="listName"
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="My Grocery List"
              required
              className="w-full"
            />
          </div>
          
          <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {parsedItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.item}</td>
                    <td>{item.quantity !== undefined ? item.quantity : ''}</td>
                    <td>{item.unit || ''}</td>
                    <td>{item.notes || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button
            onClick={saveList}
            disabled={loading || !listName.trim()}
            className="btn mt-4"
          >
            {loading ? 'Saving...' : 'Save List'}
          </button>
        </div>
      )}
      
      <style jsx>{`
        .tabs {
          display: flex;
          border-bottom: 1px solid var(--gray-300);
        }
        
        .tab {
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          color: var(--gray-500);
        }
        
        .tab.active {
          color: var(--primary);
          border-bottom: 2px solid var(--primary);
        }
        
        .import-area {
          border: 2px dashed var(--gray-300);
          border-radius: var(--border-radius);
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .import-area:hover, .import-area.dragging {
          border-color: var(--primary);
          background-color: rgba(0, 112, 243, 0.05);
        }
        
        .hidden {
          display: none;
        }
      `}</style>
    </div>
  );
}
