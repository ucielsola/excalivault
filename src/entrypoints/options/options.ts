import "../../app.css";

import { mount } from "svelte";

import { initSentry } from "$lib/services/sentry";

import Options from "./Options.svelte";

initSentry();

mount(Options, {
  target: document.getElementById("app")!,
});
