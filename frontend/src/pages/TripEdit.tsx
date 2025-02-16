import PageContainer from '../components/PageContainer'
import Navbar from '../components/Navbar'
import { useState, useEffect } from 'react';
import { EventData, EventTypes, TripData } from '../types';
import { FaPlus } from 'react-icons/fa';
import filterEvents from '../lib/filterEvents';
import { useLocation } from 'react-router-dom';

export default function TripEdit() {
    const location = useLocation();
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
        setNewEvent({...newEvent, [e.target.name]: e.target.value});
    }

    return (
        <PageContainer>
            <Navbar/>

            <div className='mt-8'>
                <input 
                    className="font-bold text-4xl font-alex"
                    value={tripData.metadata.name}
                    onChange={(e) => tripData.metadata.name = e.target.value}
                />
            </div>

            <div className='mt-4'>
                <h3 className="font-alex font-bold text-xl">Locations</h3>
            </div>

            <div className='mt-4'>
                <button 
                    type="button"
                    onClick={() => console.log('add lodging')}
                    className='font-alex w-fit flex items-center gap-x-2 px-4 py-2 rounded-md text-white bg-black'
                >
                    <h3 className="font-bold text-xl">Lodging</h3>
                    <FaPlus/>
                </button>
                <div>
                    {filterEvents(tripData.events, [EventTypes.checkin, EventTypes.checkout]).map((event: EventData, idx: number) => (
                        <div key={idx}>
                            {event.title}
                        </div>
                    ))}
                </div>
            </div>

            <div className='mt-4'>
                <button 
                    type="button"
                    onClick={() => console.log('add transportation')}
                    className='cursor-pointer font-alex w-fit flex items-center gap-x-2 px-4 py-2 rounded-md text-white bg-black'
                >
                    <h3 className="font-bold text-xl">Transportation</h3>
                    <FaPlus/>
                </button>
                <div>
                    {filterEvents(tripData.events, [EventTypes.flight, EventTypes.drive]).map((event: EventData, idx: number) => (
                        <div key={idx}>
                            {event.title}
                        </div>
                    ))}
                </div>
            </div>

            <div className='mt-4 font-alex'>
                <h3 className="font-bold text-xl">Activities</h3>
                <h5 className="font-bold text-lg mt-2">Food + Drinks</h5>
                <div>
                    {filterEvents(tripData.events, [EventTypes.dining]).map((event: EventData, idx: number) => (
                        <div key={idx}>
                            {event.title}
                        </div>
                    ))}
                </div>

                <h5 className="font-bold text-lg mt-2">Entertainment</h5>
                <div>
                    {filterEvents(tripData.events, [EventTypes.entertainment]).map((event: EventData, idx: number) => (
                        <div key={idx}>
                            {event.title}
                        </div>
                    ))}
                </div>

                <h5 className="font-bold text-lg mt-2">Shopping</h5>
                <div>
                    {filterEvents(tripData.events, [EventTypes.shopping]).map((event: EventData, idx:number) => (
                        <div key={idx}>
                            {event.title}
                        </div>
                    ))}
                </div>

            </div>

            <button onClick={() => setDropDownOpen(true)}>
            add event
            </button>

            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white border-2 border-black/60 rounded-md ${dropDownOpen ? "flex flex-col" : "hidden"}`}>
                <h2 className="text-xl font-semibold mb-4">Create Event</h2>
                      <input name="title" placeholder="Event Title" className="w-full p-2 border rounded mb-2" onChange={handleChange} />
                      <textarea name="description" placeholder="Description" className="w-full p-2 border rounded mb-2" onChange={handleChange} />
                      <input name="startTime" type="datetime-local" className="w-full p-2 border rounded mb-2" onChange={handleChange} />
                      <input name="endTime" type="datetime-local" className="w-full p-2 border rounded mb-2" onChange={handleChange} />
                      <input name="people" placeholder="Comma-separated people" className="w-full p-2 border rounded mb-2" onChange={(e) => setNewEvent({ ...newEvent, people: e.target.value.split(",") })} />
                                
            </div>
        </PageContainer>
    )
}
