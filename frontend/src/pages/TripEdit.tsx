import PageContainer from '../components/PageContainer'
import Navbar from '../components/Navbar'
import { useState, useEffect } from 'react';
import { TripData } from '../types';

export default function TripEdit() {

    const [tripData, setTripData] = useState<TripData | null>(null);

    useEffect(() => {

        async function fetchData() {
            console.log(tripData);
            setTripData({
                tripid: "123",
                collaborators: ["123"],
                name: "New York with the boys",
                locations: ["New York"],
                dates: [new Date()],
                budget: [1000],
                transportation: [],
                lodging: [],
                dining: [],
                entertainment: [],
                shopping: []
            });
        }

        fetchData();

    }, [])

    if (tripData === null) {
        return (
            <PageContainer>
                <Navbar/>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <Navbar/>

            <div className='mt-8'>
                <input 
                    className="font-bold text-4xl font-alex"
                    value={tripData.name}
                    onChange={e => setTripData({...tripData, name: e.target.value})}
                />
            </div>

            <div>
                <h3 className="font-bold">Locations</h3>
                <ul>
                    {tripData.locations.map((location, i) => (
                        <li key={i}>{location}</li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="font-bold">Lodging</h3>
                <ul>
                    {tripData.locations.map((location, i) => (
                        <li key={i}>{location}</li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="font-bold">Activities</h3>
                <h5 className="font-bold">Food + Drinks</h5>
                <div>
                    {tripData.dining.map((event, i) => (
                        <div key={i}>
                            <p>{event.title}</p>
                            <p>{event.description}</p>
                        </div>
                    ))}
                </div>

                <h5 className="font-bold">Entertainment</h5>
                <div>
                    {tripData.dining.map((event, i) => (
                        <div key={i}>
                            <p>{event.title}</p>
                            <p>{event.description}</p>
                        </div>
                    ))}
                </div>

                <h5 className="font-bold">Shopping</h5>
                <div>
                    {tripData.dining.map((event, i) => (
                        <div key={i}>
                            <p>{event.title}</p>
                            <p>{event.description}</p>
                        </div>
                    ))}
                </div>

            </div>
        </PageContainer>
    )
}
