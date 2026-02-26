import "../../app.css";

import { mount } from "svelte";

import { initSentry } from "$lib/services/sentry";

import App from "./App.svelte";

initSentry();

mount(App, {
  target: document.getElementById("app")!,
});
