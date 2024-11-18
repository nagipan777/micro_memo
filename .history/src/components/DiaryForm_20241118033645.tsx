import React, { useState } from 'react';
import { X } from 'lucide-react';

interface DiaryFormProps {
  onSubmit: (entry: {
    title?: string;
    content: string;
    mood?: string;
    tags: string[];
  }) => void;
  initialValues?: {
    title?: string;
    content: string;
    mood?: string;
  };
}

const MOOD_OPTIONS = [
  'Happy',
  'Calm',
  'Excited',
  'Tired',
  'Anxious',
  'Motivated',
];

export const DiaryForm: React.FC<DiaryFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [content, setContent] = useState(initialValues?.content || '');
  const [mood, setMood] = useState(initialValues?.mood || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, mood, tags });
    if (!initialValues) {
      setTitle('');
      setContent('');
      setMood('');
    }
  };


  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <input
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={4}
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How are you feeling?
        </label>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMood(option)}
              className={`px-4 py-2 rounded-full text-sm ${
                mood === option
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Save Entry
      </button>
    </form>
  );
};