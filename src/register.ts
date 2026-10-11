export const register = [
  { pilgrim: "Ashwatthama", domain: "moon", statement: "No moon lit my road." },
  { pilgrim: "Bali", domain: "sun", statement: "At dawn I walked toward the Gate with the sun rising behind it, and my shadow trailed behind me." },
  { pilgrim: "Vyasa", domain: "river", statement: "I waded the Sarayu from its western bank to its eastern, and the current pushed me toward my right hand." },
  { pilgrim: "Hanuman", domain: "polestar", statement: "Walking east along the road, the Pole Star stayed on my left." },
  { pilgrim: "Vibhishana", domain: "wind", statement: "Walking east, the wind blew in my face the whole way." },
  { pilgrim: "Kripa", domain: "frost", statement: "At midnight my breath showed as mist." },
  { pilgrim: "Parashurama", domain: "sky", statement: "I counted the Seven Sages all night, and not a cloud hid one of them." },
];

export const departments = [
  { id: "skies", title: "Dept. of Skies", desk: "Chandra-desk", badge: "01", kind: "honest" },
  { id: "dawn", title: "Dept. of Dawn", desk: "Surya-desk", badge: "02", kind: "honest" },
  { id: "waters", title: "Dept. of Waters", desk: "Jala-desk", badge: "03", kind: "honest" },
  { id: "winds", title: "Dept. of Winds", desk: "Vayu-desk", badge: "04", kind: "honest" },
  { id: "retention", title: "Customer Retention", desk: "Kali-desk", badge: "05", kind: "liar" },
] as const;

export type DepartmentId = (typeof departments)[number]["id"];
