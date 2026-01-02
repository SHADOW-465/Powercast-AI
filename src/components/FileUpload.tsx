import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
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
          // Validate structure
          // Expect timestamp, load
          const data = results.data;
          if (data.length > 0 && 'timestamp' in (data[0] as any) && 'load' in (data[0] as any)) {
            onDataLoaded(data);
          } else {
            alert("Invalid CSV format. Header must be: timestamp,load");
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
    <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:bg-slate-800/50 transition-colors cursor-pointer relative group">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-cyan-400">
        {fileName ? (
           <>
             <FileText className="w-10 h-10" />
             <span className="font-medium text-slate-200">{fileName}</span>
             <span className="text-xs">Click to replace</span>
           </>
        ) : (
           <>
             <Upload className="w-10 h-10" />
             <span className="font-medium">Drop Load Data CSV or Click to Upload</span>
             <span className="text-xs text-slate-500">Format: timestamp, load</span>
           </>
        )}
      </div>
    </div>
  );
}
