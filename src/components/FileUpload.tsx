import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';

interface FileUploadProps {
  onDataLoaded: (data: any[]) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data;
          if (data.length > 0 && 'timestamp' in (data[0] as any) && 'load' in (data[0] as any)) {
            onDataLoaded(data);
          } else {
            alert("Invalid CSV. Expected 'timestamp' and 'load'.");
            setFileName(null);
          }
        },
        error: (err) => {
            alert("Error parsing CSV: " + err.message);
        }
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <Upload className="w-8 h-8 opacity-50" />
        {fileName ? (
           <div className="text-center">
             <span className="text-xs font-bold text-slate-600 block">{fileName}</span>
             <span className="text-[10px] text-blue-500">Click to replace</span>
           </div>
        ) : (
           <div className="text-center">
             <span className="text-xs font-bold text-slate-600 block">Drag-and-drop CSV</span>
             <span className="text-[10px]">or click to browse</span>
           </div>
        )}
      </div>
    </div>
  );
}
