
import React, { useState, useRef, useEffect } from 'react';
import { DeliveryItem, AttachedFile } from '../types';
import { X, Upload, FileText, Sparkles, Save, Calendar, Type } from 'lucide-react';
import { improveText } from '../services/geminiService';

interface ActionDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DeliveryItem) => void;
  initialData?: DeliveryItem;
}

export const ActionDeliveryModal: React.FC<ActionDeliveryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [results, setResults] = useState('');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isImproving, setIsImproving] = useState<'description' | 'results' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDate(initialData.date);
        setDescription(initialData.description);
        setResults(initialData.results || '');
        setFiles(initialData.attachments);
      } else {
        // Reset form for new entry
        setTitle('');
        setDate('');
        setDescription('');
        setResults('');
        setFiles([]);
      }
    }
  }, [isOpen, initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: AttachedFile[] = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleImprove = async (type: 'description' | 'results') => {
    const textToImprove = type === 'description' ? description : results;
    if (!textToImprove || textToImprove.length < 5) return;

    setIsImproving(type);
    const improved = await improveText(textToImprove, type === 'description' ? 'actions' : 'results');
    if (improved) {
      if (type === 'description') setDescription(improved);
      else setResults(improved);
    }
    setIsImproving(null);
  };

  const handleSave = () => {
    // Descrição não é mais obrigatória
    if (!title || !date) {
      alert("Por favor, preencha os campos obrigatórios (Título e Período/Data).");
      return;
    }

    const newItem: DeliveryItem = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      title,
      date,
      description,
      results,
      attachments: files
    };

    onSave(newItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {initialData ? 'Editar Entrega / Marco' : 'Nova Entrega / Marco'}
            </h3>
            <p className="text-sm text-gray-500">Detalhe a realização específica vinculada a esta ação estratégica.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Title Field */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Type size={16} className="text-gov-blue" /> Título da Entrega <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-lightBlue outline-none transition-all"
                placeholder="Ex: Aquisição de 80 Notebooks"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Date Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar size={16} className="text-gov-blue" /> Período/Data <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-lightBlue outline-none transition-all"
                placeholder="Ex: Mar/2025"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Description Field - Opcional */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">Descrição do Executado</label>
              <button 
                onClick={() => handleImprove('description')}
                disabled={isImproving === 'description' || !description}
                className="text-xs flex items-center gap-1 text-gov-lightBlue hover:text-gov-blue disabled:opacity-50"
              >
                <Sparkles size={14} /> {isImproving === 'description' ? 'Melhorando...' : 'Melhorar com IA'}
              </button>
            </div>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-lightBlue outline-none text-sm"
              placeholder="Descreva detalhadamente o que foi realizado nesta entrega..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Results Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">Resultados e Benefícios (Opcional)</label>
              <button 
                onClick={() => handleImprove('results')}
                disabled={isImproving === 'results' || !results}
                className="text-xs flex items-center gap-1 text-gov-lightBlue hover:text-gov-blue disabled:opacity-50"
              >
                <Sparkles size={14} /> {isImproving === 'results' ? 'Melhorando...' : 'Melhorar com IA'}
              </button>
            </div>
            <textarea
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-lightBlue outline-none text-sm"
              placeholder="Quais foram os impactos diretos desta entrega específica?"
              value={results}
              onChange={(e) => setResults(e.target.value)}
            />
          </div>

          {/* Attachments Field */}
          <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-700">Evidências da Entrega</span>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs bg-white border border-gray-300 hover:bg-gray-100 px-3 py-1 rounded shadow-sm flex items-center gap-2 transition-colors"
              >
                <Upload size={14} /> Adicionar Arquivo
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={handleFileChange}
              />
            </div>

            {files.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {files.map(file => (
                  <div key={file.id} className="relative group bg-white p-2 rounded border border-gray-200 flex flex-col items-center">
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X size={12} />
                    </button>
                    {file.type.startsWith('image/') ? (
                      <img src={file.previewUrl} alt={file.name} className="h-12 w-12 object-cover rounded mb-1" />
                    ) : (
                      <FileText className="h-12 w-12 text-gray-400 mb-1" />
                    )}
                    <span className="text-[10px] text-center w-full truncate text-gray-600" title={file.name}>{file.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center text-gray-400">Nenhum arquivo anexado a esta entrega.</p>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-gov-blue hover:bg-blue-800 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save size={18} /> Salvar Entrega
          </button>
        </div>
      </div>
    </div>
  );
};
