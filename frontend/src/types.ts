import { IconBaseProps } from "react-icons";
import { FaCarSide, FaCheck, FaShoppingBag, FaTimes, FaTv } from "react-icons/fa";
import { IoAirplane } from "react-icons/io5";
import { MdLocalDining } from "react-icons/md";

// basic trip information to be shown on the trip table
export interface TripInfo {
    tripid: string;
    name: string;
    start: Date;
    end: Date;
    destination: string;
    collaborators: string[];
}

// specific details about the trip
export interface TripData {
    metadata: TripInfo;
    events: EventData[];
}

export interface EventType {
    icon: React.ComponentType<IconBaseProps> | string;
    color: string;
}

export const EventTypes = {
    // transportation
    flight: {icon: IoAirplane, color: "bg-blue-300"},
    drive: {icon: FaCarSide, color: "bg-purple-300"},
    // lodging
    checkin: {icon: FaCheck, color: "bg-green-300"},
    checkout: {icon: FaTimes, color: "bg-red-300"},
    // activites
    dining: {icon: MdLocalDining, color: "bg-yellow-300"},
    entertainment: {icon: FaTv, color: "bg-emerald-300"},
    shopping: {icon: FaShoppingBag, color: "bg-cyan-300"},
} as const;


export interface EventData {
    type: EventType;
    title: string;
    description: string;
    startTime: Date | null;
    endTime: Date | null;
    people: string[];
}

export interface ScrapbookEntry {
    id: string;
    tripId: string;
    imageUrl: string;
    caption: string;
    uploadedBy: string;
    createdAt: Date;
}
