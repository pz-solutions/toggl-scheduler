export default function cleaner({
  treshold = 3,
  startAccessor = "start",
  stopAccessor = "stop",
  titleAccessor = "title",
  removePattern
}) {
  return events => {
    const deletes = [];
    let currentEvents = [];
    if (removePattern) {
      for (const event of events) {
        if (removePattern.test(event[titleAccessor])) {
          deletes.push(event);
        } else {
          currentEvents.push(event);
        }
      }
    } else {
      currentEvents = [...events];
    }
    const sorted = currentEvents.sort(
      (a, b) => a[startAccessor] - b[startAccessor]
    );
    let prev = null;
    let prevPushed = false;
    const updates = [];
    for (const event of sorted) {
      if (!prev) {
        prev = event;
        continue;
      }
      if (prev[titleAccessor] !== event[titleAccessor]) {
        prevPushed = false;
        prev = event;
        continue;
      }
      if (prev[stopAccessor] + treshold > event[startAccessor]) {
        if (prev[stopAccessor] < event[stopAccessor]) {
          prev[stopAccessor] = event[stopAccessor];
          if (!prevPushed) {
            prevPushed = true;
            updates.push(prev);
          }
        }
        deletes.push(event);
      }
    }
    return {
      deletes,
      updates
    };
  };
}
