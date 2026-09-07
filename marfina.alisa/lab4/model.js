export class Event {
  constructor(id, title, participants, date) {
    this.id = Number(id);
    this.title = String(title);
    this.participants = Array.isArray(participants) ? participants : [];
    this.date = date;
  }

  addParticipant(name) {
    if (!this.participants.includes(name)) {
      this.participants.push(name);
    }
  }

  removeParticipant(name) {
    this.participants = this.participants.filter((p) => p !== name);
  }

  get participantCount() {
    return this.participants.length;
  }
}

export function groupEventsByDate(events) {
  return events.reduce((acc, event) => {
    const dateKey =
      event.date instanceof Date
        ? event.date.toISOString().split('T')[0]
        : String(event.date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    } // Исправлено: добавлены фигурные скобки
    acc[dateKey].push(event);
    return acc;
  }, {});
}

export function getUniqueParticipants(events) {
  return [...new Set(events.flatMap((event) => event.participants))];
}

export function groupEventsByParticipantCount(events) {
  return events.reduce((acc, event) => {
    const count =
      event instanceof Event
        ? event.participantCount
        : (event.participants?.length ?? 0);
    if (!acc[count]) {
      acc[count] = [];
    }
    acc[count].push(event);
    return acc;
  }, {});
}

export function getEventsByParticipant(events, participantName) {
  return events.filter((event) => event.participants.includes(participantName));
}

export function getEventsByMonth(events, month) {
  const targetMonth = Number(month);
  return events.filter((event) => {
    const d = event.date instanceof Date ? event.date : new Date(event.date);
    if (isNaN(d.getTime())) {
      return false;
    }
    return d.getMonth() + 1 === targetMonth;
  });
}
