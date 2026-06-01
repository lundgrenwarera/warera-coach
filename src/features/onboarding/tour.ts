import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function runTour(onDone: () => void): void {
  const tour = driver({
    showProgress: true,
    overlayClickBehavior: () => {},
    popoverClass: "warera-tour",
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Got it",
    onDestroyed: onDone,
    steps: [
      {
        element: "[data-tour='milestone']",
        popover: { title: "Your next move", description: "The single most important thing to do right now." },
      },
      {
        element: "[data-tour='missions']",
        popover: { title: "Missions", description: "Tick these off as you complete them in War Era." },
      },
      {
        element: "[data-tour='missions-title']",
        popover: {
          description: "Click the title to open missions on War Era.",
          popoverClass: "warera-tour warera-tip",
        },
      },
      {
        element: "[data-tour='recommendations']",
        popover: { title: "Recommendations", description: "Ranked actions to grow faster, colored by urgency." },
      },
      {
        element: "[data-tour='companies']",
        popover: {
          title: "Companies",
          description: "Your companies, their AE levels and storage, and what to build or upgrade next.",
        },
      },
      {
        element: "[data-tour='companies-title']",
        popover: {
          description: "Click the title to open companies on War Era.",
          popoverClass: "warera-tour warera-tip",
        },
      },
      {
        element: "[data-tour='companies-card']",
        popover: {
          description: "Click any company card to open it on War Era.",
          popoverClass: "warera-tour warera-tip",
        },
      },
      {
        element: "[data-tour='skills']",
        popover: { title: "Skills", description: "Where to spend skill points to stay on the optimal path." },
      },
      {
        element: "[data-tour='skills-title']",
        popover: {
          description: "Click the title to open your skills on War Era.",
          popoverClass: "warera-tour warera-tip",
        },
      },
      {
        element: "[data-tour='skill-legend']",
        popover: {
          title: "Reading the skill tiles",
          description:
            "have = points you already put in, need = where to spend next, ahead = beyond what the plan needs.",
        },
      },
      {
        element: "[data-tour='inventory']",
        popover: { title: "Inventory", description: "Import your items so the coach can factor them in." },
      },
    ],
  });
  tour.drive();
}
