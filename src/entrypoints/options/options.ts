import '../../app.css';
import Options from './Options.svelte';
import { mount } from 'svelte';
import { initSentry } from '$lib/services/sentry';

initSentry();

mount(Options, {
  target: document.getElementById('app')!
})
