(() => {
  const target = document.querySelector('#cross-canon');
  if (!target) return;
  const connections = [
    ['Berakhot and Shema', 'A Gemara question about when Shema is recited becomes richer when you return to the Torah declaration and see how it becomes a daily practice.', 'tractate-mastery.html?tractate=berakhot', 'source-reader.html?collection=shema', 'Read Shema with Berakhot'],
    ['Shabbat and responsibility', 'Mapping people, places, and actions in a legal case trains the same concrete attention that responsibility texts demand of a person.', 'tractate-mastery.html?tractate=shabbat', 'source-reader.html?collection=responsibility', 'Read responsibility with Shabbat'],
    ['Eruvin and Tefillah', 'A physical limit asks what purpose it serves; prayer likewise joins a concrete form to attention and intention.', 'tractate-mastery.html?tractate=eruvin', 'source-reader.html?collection=amidah', 'Read prayer with Eruvin'],
    ['Bava Kamma and covenant', 'Legal categories gain depth when their shared principle is named. Covenant sources ask what responsibility joins distinct cases.', 'tractate-mastery.html?tractate=bava-kamma', 'source-reader.html?collection=covenant', 'Read covenant with Bava Kamma']
  ];
  const [title, copy, gemara, canon, label] = connections[Math.floor(Date.now() / 86400000) % connections.length];
  target.innerHTML = `<p class="lesson-label">TODAY’S CROSS-CANON CONNECTION</p><h2>${title}</h2><p>${copy}</p><p><a href="${gemara}">Open Gemara source →</a> <span>·</span> <a href="${canon}">${label} →</a></p>`;
})();
