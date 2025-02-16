// filters events by the different types of events then sorts it by start time
import { EventData, EventType } from "../types";

export default function filterEvents(events: EventData[], filters: EventType[]) {
    let filteredEvents: EventData[] = [];
    for (let event of events) {
        for (let filter of filters) {
            if (event.type.icon === filter.icon && event.type.color === filter.color) {
                filteredEvents.push(event);
            }
        }
    }
    // filteredEvents.sort((e1, e2) => e1.startTime.getTime() - e2.startTime.getTime());
    return filteredEvents;
}

export function getNextEvent(events: EventData[]) {
    let nextEvent = events[0];
    for (let event of events) {
        if (nextEvent.startTime && event.startTime && (event.startTime.getTime() < nextEvent.startTime.getTime())) {
            nextEvent = event;
        }
    }
    return nextEvent;
}

export function getEventsOnDate(events?: EventData[], date?: Date | null) {
    if (!date || !events || date === null) {
        return [];
    }
    let eventsOnDate: EventData[] = [];
    for (let event of events) {
        if (event.startTime && event.startTime.getDate() === date.getDate()) {
            eventsOnDate.push(event);
        }
    }
    return eventsOnDate;
}

export function eventTypeDefaults(event: EventData) {
    if (event.type.color === "bg-blue-300") {
        // if airplane display: title, start/end time, people flying
        // bonus: add arrival time, embed ticket
        return {
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            people: event.people
        }
    }


    return "";
}
