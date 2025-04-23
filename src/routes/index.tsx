import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [convertedFiles, setConvertedFiles] = useState<string[]>([]);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string>('');

    const selectFolder = async () => {
        try {
            console.log('Opening folder dialog...');
            const selected = await open({
                directory: true,
                multiple: false,
                title: 'Select a folder with images',
                defaultPath: '/home',
            });

            console.log('Dialog result:', selected);

            if (selected === null) {
                console.log('User cancelled the dialog');
                return;
            }

            if (typeof selected === 'string') {
                console.log('Selected folder:', selected);
                setSelectedFolder(selected);
                setError('');
            } else {
                console.error('Unexpected result type:', typeof selected);
                setError('Unexpected result from folder selection');
            }
        } catch (err) {
            console.error('Error in selectFolder:', err);
            setError(
                `Error selecting folder: ${err instanceof Error ? err.message : String(err)}`,
            );
        }
    };

    const convertImages = async () => {
        if (!selectedFolder) {
            setError('Please select a folder first');
            return;
        }

        setIsConverting(true);
        setError('');

        try {
            console.log('Starting conversion for folder:', selectedFolder);
            const result = await invoke<string[]>('convert_images_to_webp', {
                folderPath: selectedFolder,
            });
            console.log('Conversion result:', result);
            setConvertedFiles(result);
        } catch (err) {
            console.error('Error in convertImages:', err);
            setError(
                `Error converting images: ${err instanceof Error ? err.message : String(err)}`,
            );
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className='p-8 max-w-4xl mx-auto'>
            <h1 className='text-3xl font-bold mb-6'>Image to WebP Converter</h1>

            <div className='space-y-4'>
                <div className='flex items-center space-x-4'>
                    <button
                        onClick={selectFolder}
                        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
                    >
                        Select Folder
                    </button>
                    <span className='text-gray-600'>
                        {selectedFolder || 'No folder selected'}
                    </span>
                </div>

                <button
                    onClick={convertImages}
                    disabled={!selectedFolder || isConverting}
                    className={`px-4 py-2 rounded transition-colors ${
                        !selectedFolder || isConverting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                    {isConverting ? 'Converting...' : 'Convert Images'}
                </button>

                {error && (
                    <div className='text-red-500 mt-2 p-2 bg-red-50 rounded'>
                        <p className='font-semibold'>Error:</p>
                        <p className='whitespace-pre-wrap'>{error}</p>
                    </div>
                )}

                {convertedFiles.length > 0 && (
                    <div className='mt-6'>
                        <h2 className='text-xl font-semibold mb-2'>
                            Converted Files:
                        </h2>
                        <ul className='space-y-1'>
                            {convertedFiles.map((file, index) => (
                                <li
                                    key={index}
                                    className='text-gray-600'
                                >
                                    {file}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
