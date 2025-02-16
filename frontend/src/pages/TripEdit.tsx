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
    const [dateRange, setDateRange] = useState([null, null]);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const navigate = useNavigate();

    useEffect(() => {   
        if (dateRange[0] && dateRange[1] && tripData) {
            tripData.metadata.start = dayjs(dateRange[0]).toDate();
            tripData.metadata.end = dayjs(dateRange[1]).toDate();
            console.log(tripData);
        }
    }, [dateRange]);

    useEffect(() => {
        async function fetchData() {
            // If we have initial trip data, use it to create the trip
            if (initialTripData) {
                setTripData({
                    metadata: {
                        tripid: 'new',
                        name: `Trip to ${initialTripData.location}`,
                        start: new Date(initialTripData.startDate),
                        end: new Date(initialTripData.endDate),
                        destination: initialTripData.location,
                        collaborators: [],
                    },
                    budget: [],
                    events: [],
                });
            } else {
                // Your existing fetchData logic for editing existing trips
                console.log(tripData);
                setTripData({
                    metadata: {
                        tripid: '1',
                        name: 'Trip 1',
                        start: new Date(),
                        end: new Date(),
                        destination: 'San Francisco',
                        collaborators: ["user1", "user2"],
                    },
                    budget: [1000],
                    events: [{
                        type: EventTypes.flight,
                        title: 'Flight 1',
                        description: 'Description 1',
                        startTime: new Date(),
                        endTime: new Date(),
                        people: ['user1', 'user2'],
                    }],
                });
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

    function createEvent() {
        // Add the new event to the trip data
        if (tripData === null) {
            return;
        }
        console.log(newEvent);
        setTripData({
            ...tripData,
            events: [...tripData.events, newEvent]
        });
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
                "activities": tripData.events,
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

    return (
        <PageContainer>
            <Navbar/>
            
            <div className='mt-8 flex items-center gap-x-2'>
                {isEditingTitle ? (
                    <input 
                        className="font-bold text-4xl font-alex px-2 py-1 border-b-2 border-black/60 focus:outline-none"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                saveTitleChanges();
                            } else if (e.key === 'Escape') {
                                setIsEditingTitle(false);
                            }
                        }}
                        onBlur={saveTitleChanges}
                        autoFocus
                    />
                ) : (
                    <div 
                        className="flex items-center gap-x-2 cursor-pointer group"
                        onClick={handleTitleEdit}
                    >
                        <h1 className="font-bold text-4xl font-alex group-hover:text-gray-700">
                            {tripData.metadata.name}
                        </h1>
                        <FaPencilAlt className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </div>

            <div className="mt-8 space-y-8 max-w-4xl mx-auto">
                <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-200'>
                    <h3 className="font-alex font-bold text-xl mb-4">Destination</h3>
                    <LocationEdits
                        location={tripData.metadata.destination}
                        setLocation={(location) => tripData.metadata.destination = location}
                    />
                </div>

                <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-200'>
                    <h3 className="font-alex font-bold text-xl mb-4">Trip Dates</h3>
                    <DatePicker date={dateRange} setDate={setDateRange} />
                </div>

                <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-200'>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-alex font-bold text-xl">Lodging</h3>
                        <button 
                            type="button"
                            onClick={() => console.log('add lodging')}
                            className='font-alex flex items-center gap-x-2 px-4 py-2 rounded-md text-black bg-[#E3D1FF] hover:bg-[#E3D1FF]/80 transition-colors'
                        >
                            Add Lodging
                            <FaPlus/>
                        </button>
                    </div>
                    <div className="space-y-2">
                        {filterEvents(tripData.events, [EventTypes.checkin, EventTypes.checkout]).map((event: EventData, idx: number) => (
                            <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50">
                                {event.title}
                            </div>
                        ))}
                    </div>
                </div>

                <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-200'>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-alex font-bold text-xl">Transportation</h3>
                        <button 
                            type="button"
                            onClick={() => console.log('add transportation')}
                            className='font-alex flex items-center gap-x-2 px-4 py-2 rounded-md text-black bg-[#E3D1FF] hover:bg-[#E3D1FF]/80 transition-colors'
                        >
                            Add Transportation
                            <FaPlus/>
                        </button>
                    </div>
                    <div className="space-y-2">
                        {filterEvents(tripData.events, [EventTypes.flight, EventTypes.drive]).map((event: EventData, idx: number) => (
                            <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50">
                                <div className="font-semibold">{event.title}</div>
                                <div className="text-sm text-gray-600">
                                    {event.startTime ? new Date(event.startTime).toLocaleString() : ""}
                                    {event.endTime ? ` - ${new Date(event.endTime).toLocaleString()}` : ""}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-200'>
                    <h3 className="font-alex font-bold text-xl mb-4">Activities</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <h5 className="font-alex font-bold text-lg mb-2">Food + Drinks</h5>
                            <div className="space-y-2">
                                {filterEvents(tripData.events, [EventTypes.dining]).map((event: EventData, idx: number) => (
                                    <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50">
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h5 className="font-alex font-bold text-lg mb-2">Entertainment</h5>
                            <div className="space-y-2">
                                {filterEvents(tripData.events, [EventTypes.entertainment]).map((event: EventData, idx: number) => (
                                    <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50">
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h5 className="font-alex font-bold text-lg mb-2">Shopping</h5>
                            <div className="space-y-2">
                                {filterEvents(tripData.events, [EventTypes.shopping]).map((event: EventData, idx:number) => (
                                    <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50">
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex gap-x-4 justify-end'>
                    <button 
                        onClick={() => setDropDownOpen(true)}
                        className='font-alex px-6 py-2 rounded-lg text-black bg-[#E3D1FF] hover:bg-[#E3D1FF]/80 transition-colors'
                    >
                        Add Event
                    </button>

                    <button 
                        onClick={saveTrip}
                        className='font-alex px-6 py-2 rounded-lg text-black bg-[#E3D1FF] hover:bg-[#E3D1FF]/80 transition-colors'
                    >
                        Save Trip
                    </button>
                </div>
            </div>

            <div className={`fixed inset-0 bg-black/20 ${dropDownOpen ? "flex" : "hidden"}`}>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white border-2 border-black/60 rounded-md w-[90%] max-w-md`}>
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
                    <input name="title" placeholder="Event Title" className="w-full p-2 border rounded mb-4" onChange={handleChange} />
                    <textarea name="description" placeholder="Description" className="w-full p-2 border rounded mb-4" onChange={handleChange} />
                    <input name="startTime" type="datetime-local" className="w-full p-2 border rounded mb-4" onChange={handleChange} />
                    <input name="endTime" type="datetime-local" className="w-full p-2 border rounded mb-4" onChange={handleChange} />
                    <input name="people" placeholder="Comma-separated people" className="w-full p-2 border rounded mb-4" onChange={(e) => setNewEvent({ ...newEvent, people: e.target.value.split(",") })} />
                    <button 
                        onClick={createEvent}
                        className='w-full font-alex px-4 py-2 rounded-md text-white bg-black hover:bg-black/80 transition-colors'
                    >
                        Create Event
                    </button>
                </div>
            </div>
        </PageContainer>
    )
}
