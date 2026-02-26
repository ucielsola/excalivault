import "../../app.css";
import App from "./App.svelte";
import { mount } from "svelte";
import { initSentry } from "$lib/services/sentry";

initSentry();

mount(App, {
  target: document.getElementById("app")!,
});
