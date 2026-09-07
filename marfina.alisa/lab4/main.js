import {Event} from './model.js';

const STORAGE_KEY = 'lab4_events_data';

function loadEvents() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data).map(
        (e) => new Event(e.id, e.title, e.participants, e.date),
      );
    } catch {
      return [];
    }
  }
  return [];
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function renderEvents(events) {
  const list = document.querySelector('[data-testid="entity-list"]');
  if (!list) {
    return;
  }

  list.innerHTML = '';

  events.forEach((event) => {
    const card = document.createElement('div');
    card.setAttribute('data-testid', 'entity-card');

    const dateStr =
      event.date instanceof Date
        ? event.date.toISOString().split('T')[0]
        : String(event.date);

    card.innerHTML = `
      <h3>${event.title}</h3>
      <p><strong>Дата:</strong> ${dateStr}</p>
      <p><strong>Участники:</strong> ${event.participants.join(', ') || 'Нет'}</p>
      <p><strong>Количество участников:</strong> ${event.participantCount}</p>
      <div class="event-actions">
        <input type="text" placeholder="Имя участника" class="participant-input" data-event-id="${event.id}">
        <button class="add-participant-btn" data-event-id="${event.id}">Добавить участника</button>
        <button class="remove-participant-btn" data-event-id="${event.id}">Удалить участника</button>
        <button data-testid="delete-entity" data-event-id="${event.id}">Удалить мероприятие</button>
      </div>
    `;
    list.appendChild(card);
  });

  document.querySelectorAll('.add-participant-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const eventId = Number(e.target.dataset.eventId);
      const input = e.target.parentElement.querySelector('.participant-input');
      const name = input.value.trim();
      if (name) {
        addParticipantAsync(eventId, name);
        input.value = '';
      }
    });
  });

  document.querySelectorAll('.remove-participant-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const eventId = Number(e.target.dataset.eventId);
      const input = e.target.parentElement.querySelector('.participant-input');
      const name = input.value.trim();
      if (name) {
        removeParticipantAsync(eventId, name);
        input.value = '';
      }
    });
  });

  document.querySelectorAll('[data-testid="delete-entity"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const eventId = Number(e.target.dataset.eventId);
      removeEventAsync(eventId);
    });
  });
}

function addEventAsync(eventData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const events = loadEvents();
      const newEvent = new Event(
        eventData.id,
        eventData.title,
        eventData.participants || [],
        eventData.date,
      );
      events.push(newEvent);
      saveEvents(events);
      renderEvents(events);
      resolve(newEvent);
    }, 300);
  });
}

function removeEventAsync(eventId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let events = loadEvents();
      events = events.filter((e) => e.id !== eventId);
      saveEvents(events);
      renderEvents(events);
      resolve();
    }, 300);
  });
}

function addParticipantAsync(eventId, name) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const events = loadEvents();
      const event = events.find((e) => e.id === eventId);
      if (event) {
        event.addParticipant(name);
        saveEvents(events);
        renderEvents(events);
      }
      resolve();
    }, 300);
  });
}

function removeParticipantAsync(eventId, name) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const events = loadEvents();
      const event = events.find((e) => e.id === eventId);
      if (event) {
        event.removeParticipant(name);
        saveEvents(events);
        renderEvents(events);
      }
      resolve();
    }, 300);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const events = loadEvents();
  renderEvents(events);

  const form = document.querySelector('form[data-testid="entity-form"]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const participantsStr = formData.get('participants');
      const participants = participantsStr
        ? participantsStr
            .split(',')
            .map((p) => p.trim())
            .filter((p) => p)
        : [];

      const eventData = {
        id: Number(formData.get('id')),
        title: formData.get('title'),
        date: formData.get('date'),
        participants,
      };

      addEventAsync(eventData);
      form.reset();
    });
  }
});
