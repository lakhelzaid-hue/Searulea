import { Presentation } from "@oai/artifact-tool";

function keys(label, value) {
  const own = Reflect.ownKeys(value ?? {});
  const proto = value ? Reflect.ownKeys(Object.getPrototypeOf(value) ?? {}) : [];
  console.log(label, { own, proto });
}

const p = Presentation.create({ slideSize: { width: 1440, height: 810 } });
keys("presentation", p);
keys("masters", p.masters);
keys("layouts", p.layouts);
const m = p.masters.add("Probe Master");
const l = p.layouts.add("Probe Layout");
keys("master", m);
keys("master background", m.background);
keys("master shapes", m.shapes);
keys("master images", m.images);
keys("layout", l);
keys("layout background", l.background);
keys("layout shapes", l.shapes);
keys("layout images", l.images);
keys("layout placeholders", l.placeholders);
const s = p.slides.add();
keys("slide", s);
keys("slide placeholders", s.placeholders);
l.setParentLayoutId(m.id);
l.placeholders.add({ type: "title", index: 0, geometry: "textbox", position: { left: 80, top: 80, width: 600, height: 80 }, text: "Title" });
l.placeholders.add({ type: "body", index: 0, geometry: "textbox", position: { left: 80, top: 180, width: 500, height: 300 }, text: "Body A" });
l.placeholders.add({ type: "body", index: 1, geometry: "textbox", position: { left: 700, top: 180, width: 500, height: 300 }, text: "Body B" });
s.setLayout(l);
console.log("layout placeholder summary", l.placeholders.summary());
console.log("slide placeholder summary", s.placeholders.summary());
for (const ph of s.placeholders.getAll()) {
  keys("placeholder", ph);
  console.log("placeholder position", ph.position);
  console.log("placeholder text style", ph.text?.style);
  console.log("placeholder proto", ph.toProto?.());
}
