import PageContainer from "../components/PageContainer";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { TripInfo } from "../types";
import { RiArrowRightUpLine } from "react-icons/ri";
import { NavLink, useParams } from "react-router-dom";
import { startEndDateNicer } from "../lib/dateFormatter";
import { useNavigate } from "react-router-dom";

export default function TripTable() {
    const navigate = useNavigate();
    const {uid} = useParams();
    const [tripsData, setTripsData] = useState<TripInfo[]>([]);
    const [groupedTrips, setGroupedTrips] = useState<{
        current: TripInfo[],
        upcoming: TripInfo[],
        past: TripInfo[]
    }>({
        current: [],
        upcoming: [],
        past: []
    });
    const tableHeaders:string[] = ["Trip Name", "Start / End Date", "Destination", "Collaborators"]
    const colors = {
        blue: "bg-blue-500",
        green: "bg-green-500",
        red: "bg-red-500",
        yellow: "bg-yellow-500",
        purple: "bg-purple-500",
        pink: "bg-pink-500",
        teal: "bg-teal-500",
    };
    
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${uid}/trips`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.trips) {
                    setTripsData(data.trips.map((trip: any) => ({
                        ...trip,
                        start: new Date(trip.start),
                        end: new Date(trip.end)
                    })));
                }
            } catch (error) {
                console.error("Error fetching trips:", error);
            }
        }

        fetchData();
    }, [uid]);

    useEffect(() => {
        const now = new Date();
        const grouped = {
            current: tripsData.filter(trip => 
                trip.status === "active" && 
                trip.start <= now && 
                trip.end >= now
            ),
            upcoming: tripsData.filter(trip => 
                trip.status === "active" && 
                trip.start > now
            ),
            past: tripsData.filter(trip => 
                trip.status !== "active" || 
                trip.end < now
            )
        };
        setGroupedTrips(grouped);
    }, [tripsData]);

    const handlePlanClick = () => {
        const tripData = {
            location: "San Francisco",
            startDate: null,
            endDate: null,
        };
        navigate(`/trips/${uid}/${crypto.randomUUID().toString()}/edit`, { 
            state: { tripData }
        });
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
                    {trips.map((tripInfo: TripInfo, idx: number) => (
                        <div key={idx} className="grid grid-cols-4 py-4 font-alex font-medium text-lg">
                            <NavLink
                                to={`./${tripInfo.tripid}`}
                                className={"flex gap-x-2 items-center"}
                            >
                                {tripInfo.name}
                                <RiArrowRightUpLine className="font-2xl font-bold" />
                            </NavLink>
                            <p className="flex items-center">{startEndDateNicer(tripInfo.start, tripInfo.end)}</p>
                            <p className="flex items-center">{tripInfo.destination}</p>
                            <p className="flex items-center">
                                {tripInfo.collaborators.map((_: string, idx: number) => (
                                    <div key={idx} className={`-mr-2 w-8 aspect-square rounded-full ${Object.values(colors)[Math.floor(Math.random() * 7)]}`}>
                                    </div>
                                ))}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <PageContainer>
            <Navbar/>

            <div className="mt-12">
                <button type="button" onClick={handlePlanClick} className={`mt-16 px-4 py-2 rounded-md bg-black text-white font-bold`} to={`/trips/${uid}/${crypto.randomUUID().toString()}/edit`}>
                    Create New Trip
                </button>
            </div>

            <div className="mt-8">
                <div className="grid grid-cols-4 pb-4 border-b-2 border-black/20">
                    {tableHeaders.map((tableHeader:string) => (
                        <p key={tableHeader} className="font-alex font-bold text-xl">
                            {tableHeader}
                        </p>
                    ))}
                </div>
            </div>

            <TripSection trips={groupedTrips.current} title="Current Trip" />
            <TripSection trips={groupedTrips.upcoming} title="Upcoming Trips" />
            <TripSection trips={groupedTrips.past} title="Past Trips" />
        </PageContainer>
    );
}
