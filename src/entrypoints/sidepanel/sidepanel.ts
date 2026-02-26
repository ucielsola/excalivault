import '../../app.css';
import SidePanel from './SidePanel.svelte';
import { mount } from 'svelte';

mount(SidePanel, {
  target: document.getElementById('app')!
})
