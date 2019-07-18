import cleaner from "./cleaner";
console.log(cleaner);
describe("cleaner", () => {
  const events = [
    { id: 1, start: 1, stop: 10, title: "ABC" },
    { id: 2, start: 10, stop: 12, title: "POMODORO" },
    { id: 3, start: 12, stop: 20, title: "ABC" },
    { id: 4, start: 21, stop: 30, title: "ABCD" },
    { id: 5, start: 40, stop: 50, title: "ABC" },
    { id: 6, start: 41, stop: 45, title: "ABC" },
  ];
  const clean = cleaner({ treshold: 4, removePattern: /POMODORO/ });
  const result = clean(events);
  console.log(result);
  it("merges two events", () => {
    expect(result.updates[0].id).toBe(1);
    expect(result.updates[0].start).toBe(1);
    expect(result.updates[0].stop).toBe(20);
  });
  it("removes POMODORO", () => {
    expect(result.deletes[0].id).toBe(2);
  });
  it("removes merged", () => {
    expect(result.deletes[1].id).toBe(3);
  });
});
