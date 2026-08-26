import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      setEvents(res.data);
      if (res.data.length > 0) {
        // Keep current selected if valid, otherwise pick first
        setActiveEvent(prev => {
          if (prev) {
            const found = res.data.find(e => e.id === prev.id);
            return found || res.data[0];
          }
          return res.data[0];
        });
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const selectEventById = (id) => {
    const found = events.find(e => e.id === Number(id));
    if (found) {
      setActiveEvent(found);
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        setActiveEvent,
        selectEventById,
        refreshEvents: fetchEvents,
        loading
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}
