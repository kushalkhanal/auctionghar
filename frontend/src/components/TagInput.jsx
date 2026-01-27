import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

const TagInput = ({ tags, onChange, maxTags = 10, placeholder = "Add tags..." }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            // Remove last tag on backspace if input is empty
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const tag = input.trim().toLowerCase();

        // Validation
        if (!tag) {
            return;
        }

        if (tags.includes(tag)) {
            setError('Tag already exists');
            setTimeout(() => setError(''), 2000);
            return;
        }

        if (tags.length >= maxTags) {
            setError(`Maximum ${maxTags} tags allowed`);
            setTimeout(() => setError(''), 2000);
            return;
        }

        if (tag.length > 20) {
            setError('Tag must be 20 characters or less');
            setTimeout(() => setError(''), 2000);
            return;
        }

        onChange([...tags, tag]);
        setInput('');
        setError('');
    };

    const removeTag = (index) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className={`border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all`}>
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium animate-fade-in"
                    >
                        #{tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-2 hover:text-primary-dark transition-colors"
                            aria-label={`Remove ${tag} tag`}
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </span>
                ))}
                {tags.length < maxTags && (
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={addTag}
                        placeholder={tags.length === 0 ? placeholder : ''}
                        className="flex-1 min-w-[120px] outline-none bg-transparent"
                        maxLength={20}
                    />
                )}
            </div>
            {error && (
                <p className="text-red-500 text-xs mt-1 animate-fade-in">{error}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
                {tags.length}/{maxTags} tags • Press Enter or comma to add
            </p>
        </div>
    );
};

export default TagInput;
