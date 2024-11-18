import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, Loader2 } from 'lucide-react';

interface DiaryEntryProps {
  title?: string;
  content: string;
  date: Date;
  mood?: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export const DiaryEntry: React.FC<DiaryEntryProps> = ({
  title,
  content,
  date,
  mood,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 transition-all hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          {title && (
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
          )}
          <p className="text-sm text-gray-500">
            {format(date, 'PPP p')}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            disabled={isDeleting}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{content}</p>
      
      <div className="flex flex-wrap gap-2 mt-4">
        {mood && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
            <span className="mr-1">😊</span> {mood}
          </span>
        )}

      </div>
    </div>
  );
};