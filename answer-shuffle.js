(() => {
  function shuffleChoices() {
    document.querySelectorAll('.choices:not([data-seder-shuffled])').forEach((group) => {
      group.dataset.sederShuffled = 'true';
      [...group.children].sort(() => Math.random() - 0.5).forEach((choice) => group.appendChild(choice));
    });
  }
  new MutationObserver(() => queueMicrotask(shuffleChoices)).observe(document.documentElement, { childList: true, subtree: true });
  shuffleChoices();
})();
