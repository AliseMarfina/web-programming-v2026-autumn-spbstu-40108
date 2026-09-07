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
    }
    acc[dateKey].push(event);
    return acc;
  }, {});
}

export function getUniqueParticipants(events) {
  return [...new Set(events.flatMap((event) => event.participants || []))];
}

function getParticipantCount(event) {
  if (typeof event.participantCount === 'number') {
    return event.participantCount;
  }

  const p = event.participants;

  if (Array.isArray(p)) {
    return p.length;
  }
  if (p instanceof Set || p instanceof Map) {
    return p.size;
  }
  if (typeof p === 'number') {
    return p;
  }
  if (typeof p === 'string') {
    const trimmed = p.trim();
    return trimmed === ''
      ? 0
      : trimmed
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean).length;
  }
  if (p && typeof p === 'object') {
    if ('length' in p) {
      return Number(p.length) || 0;
    }
    if ('size' in p) {
      return Number(p.size) || 0;
    }
  }

  return 0;
}

export function groupEventsByParticipantCount(events) {
  return events.reduce((acc, event) => {
    const count = getParticipantCount(event);
    if (!acc[count]) {
      acc[count] = [];
    }
    acc[count].push(event);
    return acc;
  }, {});
}

export function findEventsByParticipant(events, participantName) {
  return events.filter((event) =>
    (event.participants || []).includes(participantName),
  );
}

export function findEventsByMonth(events, month) {
  const targetMonth = Number(month);
  return events.filter((event) => {
    const d = event.date instanceof Date ? event.date : new Date(event.date);
    if (isNaN(d.getTime())) {
      return false;
    }
    return d.getMonth() + 1 === targetMonth;
  });
}
