export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('Excalivault content script loaded');
  }
});
