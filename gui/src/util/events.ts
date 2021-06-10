export const events = new EventSource("http://localhost:4932/events/");
events.onopen = () => console.log("open");
// @ts-ignore
window.events = events;
