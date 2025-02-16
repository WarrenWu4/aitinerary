import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import Navbar from '../components/Navbar';
import { TripInfo, ScrapbookEntry } from '../types';
import { NavLink } from 'react-router-dom';
import dayjs from 'dayjs';

export default function Scrapbook() {
    const { uid, tripid } = useParams();
    const [trips, setTrips] = useState<TripInfo[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<string | null>(tripid || null);
    const [scrapbookEntries, setScrapbookEntries] = useState<ScrapbookEntry[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadCaption, setUploadCaption] = useState('');

    // Fetch trips the user is part of
    useEffect(() => {
        async function fetchTrips() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${uid}/trips`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.trips) {
                    setTrips(data.trips.map((trip: any) => ({
                        ...trip,
                        start: new Date(trip.start),
                        end: new Date(trip.end)
                    })));
                }
            } catch (error) {
                console.error("Error fetching trips:", error);
            }
        }
        fetchTrips();
    }, [uid]);

    // Fetch scrapbook entries when a trip is selected
    useEffect(() => {
        if (!selectedTrip) return;

        async function fetchScrapbookEntries() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/trips/${selectedTrip}/scrapbook`, {
                    credentials: 'include'
                });
                const data = await response.json();
                setScrapbookEntries(data.entries.map((entry: any) => ({
                    ...entry,
                    createdAt: new Date(entry.createdAt)
                })));
            } catch (error) {
                console.error("Error fetching scrapbook entries:", error);
            }
        }

        fetchScrapbookEntries();
    }, [selectedTrip]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedTrip) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('caption', uploadCaption);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/trips/${selectedTrip}/scrapbook/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            const data = await response.json();
            setScrapbookEntries(prev => [...prev, {
                ...data.entry,
                createdAt: new Date(data.entry.createdAt)
            }]);
            setUploadCaption('');
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <PageContainer>
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="font-alex text-4xl font-bold mb-8">Trip Scrapbook</h1>
                
                {/* Trip Selection */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
                    {trips.map(trip => (
                        <button
                            key={trip.tripid}
                            onClick={() => setSelectedTrip(trip.tripid)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                                selectedTrip === trip.tripid 
                                    ? 'bg-[#E3D1FF] text-black' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            {trip.name}
                        </button>
                    ))}
                </div>

                {selectedTrip && (
                    <>
                        {/* Upload Section */}
                        <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                            <h2 className="font-alex text-2xl mb-4">Add to Scrapbook</h2>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Add a caption..."
                                    value={uploadCaption}
                                    onChange={(e) => setUploadCaption(e.target.value)}
                                    className="flex-grow p-2 border rounded"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className={`px-4 py-2 rounded bg-black text-white cursor-pointer ${
                                        isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/80'
                                    }`}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                                </label>
                            </div>
                        </div>

                        {/* Scrapbook Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {scrapbookEntries.map(entry => (
                                <div key={entry.id} className="bg-white rounded-xl overflow-hidden shadow-md">
                                    <img 
                                        src={entry.imageUrl} 
                                        alt={entry.caption} 
                                        className="w-full aspect-video object-cover"
                                    />
                                    <div className="p-4">
                                        <p className="text-gray-800 mb-2">{entry.caption}</p>
                                        <p className="text-sm text-gray-500">
                                            Added by {entry.uploadedBy} on {dayjs(entry.createdAt).format('MMM D, YYYY')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!selectedTrip && (
                    <div className="text-center text-gray-500 mt-12">
                        Select a trip to view its scrapbook
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
