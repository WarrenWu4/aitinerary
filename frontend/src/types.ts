import { IconBaseProps } from "react-icons";
import { FaCarSide, FaCheck, FaTimes } from "react-icons/fa";
import { IoAirplane } from "react-icons/io5";

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
    icon: React.ComponentType<IconBaseProps>;
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
    dining: {icon: FaCheck, color: "bg-yellow-300"},
    entertainment: {icon: FaCheck, color: "bg-emerald-300"},
    shopping: {icon: FaCheck, color: "bg-cyan-300"},
} as const;

export interface EventData {
    type: EventType;
    title: string;
    description: string;
    startTime: Date | null;
    endTime: Date | null;
    people: string[];
}
