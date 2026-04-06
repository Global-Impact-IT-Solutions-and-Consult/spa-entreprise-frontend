import { format, parseISO, addMinutes } from "date-fns";

export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string; // ISO string
    startTime: string; // HH:mm format
    durationMinutes: number;
}

const formatToUTC = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss'Z'");
};

export const generateCalendarUrls = (event: CalendarEvent) => {
    try {
        // Handle cases where startDate might be a full ISO string (from backend) or just YYYY-MM-DD
        const datePart = event.startDate.includes('T') ? event.startDate.split('T')[0] : event.startDate;
        const start = parseISO(`${datePart}T${event.startTime}:00`);

        if (isNaN(start.getTime())) {
            throw new Error("Invalid start date/time");
        }

        const end = addMinutes(start, event.durationMinutes);
        const startStr = formatToUTC(start);
        const endStr = formatToUTC(end);

        const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${startStr}/${endStr}`;

        const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&startdt=${startStr}&enddt=${endStr}`;

        const yahooUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(event.title)}&st=${startStr}&et=${endStr}&desc=${encodeURIComponent(event.description)}&in_loc=${encodeURIComponent(event.location)}`;

        return {
            google: googleUrl,
            outlook: outlookUrl,
            yahoo: yahooUrl
        };
    } catch (error) {
        console.error("Failed to generate calendar URLs:", error);
        return { google: "#", outlook: "#", yahoo: "#" };
    }
};
