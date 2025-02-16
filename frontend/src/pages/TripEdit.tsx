import PageContainer from '../components/PageContainer'
import Navbar from '../components/Navbar'
import { useState, useEffect } from 'react';
import { EventData, EventTypes, TripData } from '../types';
import { FaPlus, FaPencilAlt } from 'react-icons/fa';
import filterEvents from '../lib/filterEvents';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import LocationEdits from '../components/LocationEdits';
import DatePicker from '../components/DatePicker';
import dayjs from 'dayjs';

export default function TripEdit() {
    const location = useLocation();
    const { uid, tripid } = useParams();
    const initialTripData = location.state?.tripData;
    const [tripData, setTripData] = useState<TripData | null>(null);
    const [activityIds, setActivityIds] = useState<string[]>([]);
    const [dropDownOpen, setDropDownOpen] = useState<boolean>(false);
    const [newEvent, setNewEvent] = useState<EventData>({
        type: EventTypes.flight,
        title: '',
        description: '',
        startTime: null,
        endTime: null,
        people: [],
    });
    let eventMappings = {
        "flight": EventTypes.flight,
        "drive": EventTypes.drive,
        "checkin": EventTypes.checkin,
        "checkout": EventTypes.checkout,
        "dining": EventTypes.dining,
        "entertainment": EventTypes.entertainment,
        "shopping": EventTypes.shopping,
    }
    const [dateRange, setDateRange] = useState([
        dayjs(new Date()),
        dayjs(new Date()).add(7, 'day')
    ]);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {   
        if (dateRange[0] && dateRange[1] && tripData) {
            setTripData({
                ...tripData,
                metadata: {
                    ...tripData.metadata,
                    start: dateRange[0].toDate(),
                    end: dateRange[1].toDate(),
                }
            });
        }
    }, [dateRange]);

    useEffect(() => {
        async function fetchData() {
            if (initialTripData) {
                setTripData({
                    metadata: {
                        tripid: 'new',
                        name: `Trip to ${initialTripData.location}`,
                        start: dayjs(initialTripData.startDate).toDate(),
                        end: dayjs(initialTripData.endDate).toDate(),
                        destination: initialTripData.location,
                        collaborators: [],
                    },
                    events: [],
                });
                // Set initial date range based on trip dates
                setDateRange([
                    dayjs(initialTripData.startDate),
                    dayjs(initialTripData.endDate)
                ]);
            } else {
                // Your existing fetchData logic for editing existing trips
                const res = await fetch(`${import.meta.env.VITE_API_URL}/trip/${tripid}/${uid}`);
                const data = await res.json();
                console.log(data);
                const existingTrip = {
                    metadata: {
                        tripid: tripid,
                        name: data.title,
                        start: new Date(data.start_date),
                        end: new Date(data.end_date),
                        destination: data.destination,
                        collaborators: data.collaborators,
                    },
                    events: [{
                        type: EventTypes.flight,
                        title: 'Flight 1',
                        description: 'Description 1',
                        startTime: new Date(),
                        endTime: new Date(),
                        people: [],
                    }],
                };
                setTripData(existingTrip);
                // Set initial date range based on existing trip dates
                setDateRange([
                    dayjs(existingTrip.metadata.start),
                    dayjs(existingTrip.metadata.end)
                ]);
            }
        }

        fetchData();
    }, [initialTripData]);

    if (tripData === null) {
        return (
            <PageContainer>
                <Navbar/>
            </PageContainer>
        )
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        console.log(e.target.name, e.target.value);
        setNewEvent({...newEvent, [e.target.name]: e.target.value});
    }

    async function createEvent() {
        // Add the new event to the trip data
        if (tripData === null) {
            return;
        }
        console.log(newEvent);
        setTripData({
            ...tripData,
            events: [...tripData.events, newEvent]
        });
        const newActivityId = crypto.randomUUID().toString();
        const userToken = getCookie('session');
        // save activity to backend
        const r = await fetch(`${import.meta.env.VITE_API_URL}/activity/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({
                "activity_id": newActivityId,
                "icon": String(newEvent.type.icon),
                "color": newEvent.type.color,
                "title": newEvent.title,
                "description": newEvent.description,
                "start_time": newEvent.startTime,
                "end_time": newEvent.endTime,
                "people": newEvent.people,
            }),
        });
        const d = await r.json();
        console.log(d);
        setActivityIds([...activityIds, newActivityId])
        // Reset the new event form
        setNewEvent({
            type: EventTypes.flight,
            title: '',
            description: '',
            startTime: null,
            endTime: null,
            people: [],
        });
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    const saveTrip = async () => {
        try {
            // Save the trip data to the database
            if (tripData === null) {
                return
            }
            const dbObj = {
                "trip_id": tripid,
                "title": tripData.metadata.name,
                "destination": tripData.metadata.destination,
                "start_date": tripData.metadata.start,
                "end_date": tripData.metadata.end,
                "owner_id": uid,
                "collaborators": tripData.metadata.collaborators,
                "created_at": "", // handled in backend
                "activities": activityIds,
                "lodging_id": "1",
                "travel_id" : "1",
                "status": new Date() >= tripData.metadata.start ? "active" : "past",
            };
            const userToken = getCookie('session');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/trips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                credentials: 'include',
                body: JSON.stringify(dbObj),
            });
            const data = await res.json();
            console.log(data);

            // After successful save, navigate to My Trips using the correct route pattern
            navigate(`/trips/${uid}`);
        } catch (error) {
            console.error('Failed to save trip:', error);
            // Optionally add error handling/notification here
        }
    };

    const handleTitleEdit = () => {
        if (isEditingTitle) {
            saveTitleChanges();
        } else {
            setTempTitle(tripData?.metadata.name || '');
            setIsEditingTitle(true);
        }
    };

    const saveTitleChanges = () => {
        if (tripData && tempTitle.trim()) {
            setTripData({
                ...tripData,
                metadata: { ...tripData.metadata, name: tempTitle }
            });
        }
        setIsEditingTitle(false);
    };

    const renderTabContent = () => {
        // Helper function to filter events
        const filterEventsByTypes = (events: EventData[], types?: EventTypes[]) => {
            if (!types) return events;
            return events.filter(event => types.includes(event.type));
        };

        switch (activeTab) {
            case 'Overview':
                return (
                    <div className="grid grid-cols-3 gap-8">
                        {/* Left column - Timeline */}
                        <div className="col-span-2 space-y-8">
                            {/* Location Editor */}
                            <div className='bg-white shadow-sm rounded-xl p-6 border border-gray-200'>
                                <h3 className="font-alex font-bold text-2xl mb-4">Location</h3>
                                <LocationEdits
                                    location={tripData.metadata.destination}
                                    setLocation={(location) => {
                                        setTripData({
                                            ...tripData,
                                            metadata: {
                                                ...tripData.metadata,
                                                destination: location
                                            }
                                        });
                                    }}
                                />
                            </div>

                            {/* Date Range Selector */}
                            <div className='bg-white shadow-sm rounded-xl p-6 border border-gray-200'>
                                <h3 className="font-alex font-bold text-2xl mb-4">Trip Dates</h3>
                                <DatePicker 
                                    date={dateRange} 
                                    setDate={(newDateRange) => {
                                        if (newDateRange[0] && newDateRange[1]) {
                                            setDateRange([
                                                dayjs(newDateRange[0]),
                                                dayjs(newDateRange[1])
                                            ]);
                                        }
                                    }}
                                />
                            </div>

                            {/* Timeline */}
                            <div className='bg-white shadow-sm rounded-xl p-6 border border-gray-200'>
                                <h3 className="font-alex font-bold text-2xl mb-6">Trip Timeline</h3>
                                <div className="space-y-4">
                                    {tripData.events.sort((a, b) => 
                                        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                                    ).map((event, idx) => (
                                        <div key={idx} className="flex items-start gap-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="w-24 text-sm text-gray-600">
                                                {dayjs(event.startTime).format('MMM D, h:mm A')}
                                            </div>
                                            <div>
                                                <div className="font-medium">{event.title}</div>
                                                <div className="text-sm text-gray-600">{event.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right column - Stats & Actions */}
                        <div className="space-y-6">
                            <div className='bg-white shadow-sm rounded-xl p-6 border border-gray-200'>
                                <h3 className="font-alex font-bold text-xl mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => setDropDownOpen(true)}
                                        className='w-full font-alex px-4 py-2 rounded-lg text-black bg-[#E3D1FF] hover:bg-[#E3D1FF]/80 transition-colors flex items-center justify-center gap-x-2'
                                    >
                                        <FaPlus className="text-sm"/>
                                        <span>Add Event</span>
                                    </button>
                                    <button 
                                        onClick={saveTrip}
                                        className='w-full font-alex px-4 py-2 rounded-lg text-white bg-black hover:bg-black/80 transition-colors'
                                    >
                                        Save Trip
                                    </button>
                                </div>
                            </div>

                            <div className='bg-white shadow-sm rounded-xl p-6 border border-gray-200'>
                                <h3 className="font-alex font-bold text-xl mb-4">Trip Stats</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Duration</span>
                                        <span className="font-medium">
                                            {dayjs(tripData.metadata.end).diff(tripData.metadata.start, 'day')} days
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Activities</span>
                                        <span className="font-medium">{tripData.events.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Travelers</span>
                                        <span className="font-medium">{tripData.metadata.collaborators.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            
            case 'Transportation':
                return (
                    <div className="space-y-6">
                        <div className='bg-white shadow-sm rounded-xl p-6 border border-gray-200'>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-alex font-bold text-2xl">Transportation</h3>
                                <button 
                                    onClick={() => setDropDownOpen(true)}
                                    className='font-alex px-4 py-2 rounded-lg text-black bg-[#E3D1FF] hover:bg-[#E3D1FF]/80 transition-colors flex items-center gap-x-2'
                                >
                                    <FaPlus className="text-sm"/>
                                    <span>Add Transportation</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                {filterEventsByTypes(tripData.events, [EventTypes.flight, EventTypes.drive]).map((event, idx) => (
                                    <div key={idx} className="flex items-start gap-x-4 p-4 border rounded-lg">
                                        <div className="w-24 text-sm text-gray-600">
                                            {dayjs(event.startTime).format('MMM D, h:mm A')}
                                        </div>
                                        <div>
                                            <div className="font-medium">{event.title}</div>
                                            <div className="text-sm text-gray-600">{event.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'Lodging':
                return (
                    <div className="space-y-6">
                        <div className='bg-white shadow-sm rounded-xl p-6 border border-gray-200'>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-alex font-bold text-2xl">Lodging</h3>
                                <button 
                                    onClick={() => setDropDownOpen(true)}
                                    className='font-alex px-4 py-2 rounded-lg text-black bg-[#E3D1FF] hover:bg-[#E3D1FF]/80 transition-colors flex items-center gap-x-2'
                                >
                                    <FaPlus className="text-sm"/>
                                    <span>Add Lodging</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                {filterEventsByTypes(tripData.events, [EventTypes.checkin, EventTypes.checkout]).map((event, idx) => (
                                    <div key={idx} className="flex items-start gap-x-4 p-4 border rounded-lg">
                                        <div className="w-24 text-sm text-gray-600">
                                            {dayjs(event.startTime).format('MMM D, h:mm A')}
                                        </div>
                                        <div>
                                            <div className="font-medium">{event.title}</div>
                                            <div className="text-sm text-gray-600">{event.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'Activities':
                return (
                    <div className="space-y-6">
                        <div className='bg-white shadow-sm rounded-xl p-6 border border-gray-200'>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-alex font-bold text-2xl">Activities</h3>
                                <button 
                                    onClick={() => setDropDownOpen(true)}
                                    className='font-alex px-4 py-2 rounded-lg text-black bg-[#E3D1FF] hover:bg-[#E3D1FF]/80 transition-colors flex items-center gap-x-2'
                                >
                                    <FaPlus className="text-sm"/>
                                    <span>Add Activity</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                {filterEventsByTypes(tripData.events, [EventTypes.dining, EventTypes.entertainment, EventTypes.shopping]).map((event, idx) => (
                                    <div key={idx} className="flex items-start gap-x-4 p-4 border rounded-lg">
                                        <div className="w-24 text-sm text-gray-600">
                                            {dayjs(event.startTime).format('MMM D, h:mm A')}
                                        </div>
                                        <div>
                                            <div className="font-medium">{event.title}</div>
                                            <div className="text-sm text-gray-600">{event.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <PageContainer>
            <Navbar/>
            
            {/* Hero section with larger, more impactful design */}
            <div className='relative py-16 bg-gradient-to-b from-[#E3D1FF]/30 to-transparent'>
                <div className='max-w-5xl mx-auto px-6'>
                    <div className='space-y-4'>
                        {/* Title section */}
                        <div className='flex items-center gap-x-2'>
                            {isEditingTitle ? (
                                <input 
                                    className="font-bold text-5xl font-alex px-2 py-1 border-b-2 border-black/60 focus:outline-none bg-transparent w-full"
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveTitleChanges();
                                        if (e.key === 'Escape') setIsEditingTitle(false);
                                    }}
                                    onBlur={saveTitleChanges}
                                    autoFocus
                                />
                            ) : (
                                <div 
                                    className="flex items-center gap-x-2 cursor-pointer group"
                                    onClick={handleTitleEdit}
                                >
                                    <h1 className="font-bold text-5xl font-alex group-hover:text-gray-700">
                                        {tripData.metadata.name}
                                    </h1>
                                    <FaPencilAlt className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                        </div>
                        
                        {/* Quick summary stats */}
                        <div className="flex gap-x-6 text-gray-600">
                            <div className="flex items-center gap-x-2">
                                <span className="font-medium">{tripData.metadata.destination}</span>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <span>{dayjs(tripData.metadata.start).format('MMM D')} - {dayjs(tripData.metadata.end).format('MMM D, YYYY')}</span>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <span>{tripData.metadata.collaborators.length} travelers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content with tabs */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Navigation Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        {['Overview', 'Transportation', 'Lodging', 'Activities'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    font-alex text-lg pb-4 px-1 border-b-2 
                                    ${tab === activeTab 
                                        ? 'border-[#E3D1FF] text-black font-medium' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </div>

            {/* Modal for adding events */}
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${dropDownOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 bg-white border border-gray-200 rounded-xl w-[90%] max-w-md shadow-2xl`}>
                    <div className='flex items-center justify-between gap-x-4 mb-4'>
                        <h2 className="text-xl font-semibold">Create Event</h2>
                        <button 
                            onClick={() => setDropDownOpen(false)}
                            className='px-2 py-1 rounded hover:bg-gray-100'
                        >
                            Close
                        </button>
                    </div>
                    <div className='mb-4'>
                        <select 
                            name="type" 
                            onChange={(e) => setNewEvent({ ...newEvent, type: eventMappings[e.target.value] })}
                            className="w-full p-2 border rounded"
                        >
                            {Object.keys(eventMappings).map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <input 
                        name="title" 
                        placeholder="Event Title" 
                        className="w-full p-2 border rounded mb-4" 
                        onChange={handleChange} 
                    />
                    <textarea 
                        name="description" 
                        placeholder="Description" 
                        className="w-full p-2 border rounded mb-4" 
                        onChange={handleChange} 
                    />
                    <input 
                        name="startTime" 
                        type="datetime-local" 
                        className="w-full p-2 border rounded mb-4" 
                        onChange={handleChange} 
                    />
                    <input 
                        name="endTime" 
                        type="datetime-local" 
                        className="w-full p-2 border rounded mb-4" 
                        onChange={handleChange} 
                    />
                    <input 
                        name="people" 
                        placeholder="Comma-separated people" 
                        className="w-full p-2 border rounded mb-4" 
                        onChange={(e) => setNewEvent({ ...newEvent, people: e.target.value.split(",") })} 
                    />
                    <button 
                        onClick={() => {
                            createEvent();
                            setDropDownOpen(false);
                        }}
                        className='w-full font-alex px-4 py-2 rounded-md text-white bg-black hover:bg-black/80 transition-colors'
                    >
                        Create Event
                    </button>
                </div>
            </div>
        </PageContainer>
    )
}
