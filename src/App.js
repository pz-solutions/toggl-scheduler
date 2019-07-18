import React, { useState } from "react";
import qs from "qs";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { useFetch, useInterval } from "./hooks";
import moment from "moment";
import "./App.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import cleaner from "./cleaner";
const DragAndDropCalendar = withDragAndDrop(Calendar);
const globalizeLocalizer = momentLocalizer(moment);
const startDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
const endDate = new Date();
function Event({ title, event }) {
  return (
    <span>
      <strong>{title}</strong>
      {event.tags && ":  " + event.tags.join(", ")}
    </span>
  );
}
var search = qs.parse(window.location.search.substring(1));
const apiToken = search.api_token;
console.log(apiToken);
const axiosConfig = {
  auth: {
    username: apiToken,
    password: "api_token"
  }
};
const clean = cleaner({ treshold: 5*60*1000, removePattern: /Pomodoro/ });
function App() {
  const [start_date, setStartDate] = useState(startDate);
  const [end_date, setEndDate] = useState(endDate);
  const [myEventsList, loadEvents] = useFetch(
    `https://www.toggl.com/api/v8/time_entries?${qs.stringify({
      start_date,
      end_date
    })}`,
    axiosConfig
  );
  const events = myEventsList.map(o => ({
    ...o,
    start: moment(o.start).toDate(),
    stop: moment(o.stop).toDate()
  }));
  useInterval(() => {
    setEndDate(new Date());
    loadEvents();
  }, 5 * 60 * 1000);
  const saveEvent = async event => {
    await axios.put(
      `https://www.toggl.com/api/v8/time_entries/${event.event.id}`,
      {
        time_entry: {
          start: moment(event.start).format(),
          stop: moment(event.end).format(),
          duration: event.end / 1000 - event.start / 1000
        }
      },
      axiosConfig
    );
    loadEvents();
  };
  const deleteEvent = async event => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure to do this?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            await axios.delete(
              `https://www.toggl.com/api/v8/time_entries/${event.id}`,
              axiosConfig
            );
            loadEvents();
          }
        },
        {
          label: "No"
        }
      ]
    });
  };
  const cleanUp = async event => {
    console.log("cleanup", event);
    const toReduce = events.filter(
      e => e.start >= event.start && e.stop <= event.end && e.duration>=0
    );
    const result = clean(toReduce.map(o=>({id:o.id, start:o.start.getTime(), stop: o.stop.getTime(), title:o.description})));
    if(result.deletes.length>0 || result.updates.length > 0){
      confirmAlert({
        title: "Confirm to cleanup",
        message: "Are you sure to do this?",
        buttons: [
          {
            label: "Yes",
            onClick: async () => {
              for (const deletion of result.deletes) {
                await axios.delete(
                  `https://www.toggl.com/api/v8/time_entries/${deletion.id}`,
                  axiosConfig
                );
              }
              for (const update of result.updates) {
                await axios.put(
                  `https://www.toggl.com/api/v8/time_entries/${update.id}`,
                  {
                    time_entry: {
                      duration: update.stop / 1000 - update.start / 1000,
                      start: moment(update.start).format(),
                      stop: moment(update.stop).format(),
                    }
                  },
                  axiosConfig
                );
              }
              
              loadEvents();
            }
          },
          {
            label: "No"
          }
        ]
      });
    }
  };
  const selectEvent = async event => {
    if (event.duration !== event.stop / 1000 - event.start / 1000) {
      confirmAlert({
        title: "Confirm to fix duration",
        message: "Are you sure to do this?",
        buttons: [
          {
            label: "Yes",
            onClick: async () => {
              await axios.put(
                `https://www.toggl.com/api/v8/time_entries/${event.id}`,
                {
                  time_entry: {
                    duration: event.stop / 1000 - event.start / 1000
                  }
                },
                axiosConfig
              );
              loadEvents();
            }
          },
          {
            label: "No"
          }
        ]
      });
    }
  };
  return (
    <div className="App" style={{ height: "100vh" }}>
      <DragAndDropCalendar
        style={{ padding: 15 }}
        selectable
        resizable
        localizer={globalizeLocalizer}
        events={events}
        startAccessor="start"
        endAccessor="stop"
        titleAccessor="description"
        onEventResize={saveEvent}
        onEventDrop={saveEvent}
        onDoubleClickEvent={deleteEvent}
        onSelectEvent={selectEvent}
        onSelectSlot={cleanUp}
        defaultView="week"
        step={15}
        timeslots={1}
        views={["month", "week", "day"]}
        components={{
          event: Event
        }}
      />
    </div>
  );
}

export default App;
