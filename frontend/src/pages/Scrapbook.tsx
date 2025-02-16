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
    const [groupedTrips, setGroupedTrips] = useState<{
        current: TripInfo[],
        upcoming: TripInfo[],
        past: TripInfo[]
    }>({
        current: [],
        upcoming: [],
        past: []
    });

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

    // Group trips by status
    useEffect(() => {
        const now = new Date();
        const grouped = {
            current: trips.filter(trip => 
                trip.status === "active" && 
                trip.start <= now && 
                trip.end >= now
            ),
            upcoming: trips.filter(trip => 
                trip.status === "active" && 
                trip.start > now
            ),
            past: trips.filter(trip => 
                trip.status !== "active" || 
                trip.end < now
            )
        };
        setGroupedTrips(grouped);
    }, [trips]);

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

    const TripSection = ({ trips, title }: { trips: TripInfo[], title: string }) => {
        if (trips.length === 0) return null;
        
        return (
            <div className="mt-8">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="font-alex text-xl">{title}</h2>
                        <div className="flex-grow h-[1px] bg-black/20"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip) => (
                            <button
                                key={trip.tripid}
                                onClick={() => setSelectedTrip(trip.tripid)}
                                className={`p-4 rounded-xl transition-colors ${
                                    selectedTrip === trip.tripid 
                                        ? 'bg-[#E3D1FF] text-black' 
                                        : 'bg-white hover:bg-gray-100'
                                }`}
                            >
                                <h3 className="font-alex text-lg mb-2">{trip.name}</h3>
                                <p className="text-sm text-gray-600">{trip.destination}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <PageContainer>
            <Navbar />
            
            {/* Hero section - reduced vertical padding */}
            <div className='relative py-8 bg-gradient-to-b from-[#E3D1FF]/30 to-transparent'>
                <div className='max-w-7xl mx-auto px-6'>
                    <div className='space-y-2'>
                        <h1 className="font-bold text-5xl font-alex">Trip Scrapbook</h1>
                        <p className="text-gray-600">Capture and share your favorite travel moments</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-4 pb-8">
                {/* Trip Sections */}
                <TripSection trips={groupedTrips.current} title="Current Trip" />
                <TripSection trips={groupedTrips.upcoming} title="Upcoming Trips" />
                <TripSection trips={groupedTrips.past} title="Past Trips" />

                {selectedTrip && (
                    <>
                        {/* Upload Section */}
                        <div className="mt-8 bg-white shadow-sm rounded-xl p-6 border border-gray-200">
                            <h2 className="font-alex text-2xl mb-4">Add to Scrapbook</h2>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Add a caption..."
                                    value={uploadCaption}
                                    onChange={(e) => setUploadCaption(e.target.value)}
                                    className="flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E3D1FF]"
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
                                    className={`px-6 py-3 rounded-lg font-alex text-white bg-black cursor-pointer transition-colors ${
                                        isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/80'
                                    }`}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                                </label>
                            </div>
                        </div>

                        {/* Scrapbook Grid */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {scrapbookEntries.map(entry => (
                                <div key={entry.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                    <div className="aspect-video relative">
                                        <img 
                                            src={entry.imageUrl} 
                                            alt={entry.caption} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-gray-800 mb-2 font-medium">{entry.caption}</p>
                                        <div className="flex items-center gap-x-2 text-sm text-gray-500">
                                            <span>{entry.uploadedBy}</span>
                                            <span>•</span>
                                            <span>{dayjs(entry.createdAt).format('MMM D, YYYY')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!selectedTrip && (
                    <div className="text-center py-12">
                        <div className="text-gray-500 mb-4">Select a trip to view its scrapbook</div>
                        <NavLink
                            to={`/trips/${uid}`}
                            className="font-alex inline-block px-6 py-3 rounded-lg text-white bg-black hover:bg-black/80 transition-colors"
                        >
                            View My Trips
                        </NavLink>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
