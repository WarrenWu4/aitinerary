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
