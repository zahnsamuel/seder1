(() => {
  const learnerId = Seder.currentLearnerId();
  const target = document.querySelector('#convergence');
  if (!target) return;
  const connections = [
    { skill: 'berakhot-sugya-flow', title: 'Berakhot and Shema', copy: 'A Gemara question about the time of Shema becomes clearer when you can read the Torah declaration and see how words become daily practice.', gemara: 'tractate-mastery.html?tractate=berakhot', canon: 'source-reader.html?collection=shema', label: 'Read Shema alongside Berakhot' },
    { skill: 'shabbat-case-map', title: 'Shabbat and responsibility', copy: 'Mapping people, places, and actions in a legal case trains the same moral attention that Mussar asks of a person in a concrete situation.', gemara: 'tractate-mastery.html?tractate=shabbat', canon: 'canon-course.html?course=responsibility-six', label: 'Connect case-mapping to responsibility' },
    { skill: 'pesachim-ambiguous-word', title: 'Pesachim and freedom', copy: 'A close question about one word teaches the patience needed to read a command, a choice, and a philosophical tension without flattening them.', gemara: 'tractate-mastery.html?tractate=pesachim', canon: 'canon-course.html?course=freedom-six', label: 'Read freedom with close attention' },
    { skill: 'eruvin-purpose-of-limit', title: 'Eruvin and prayer', copy: 'A measured boundary becomes intelligible through its purpose; prayer likewise joins concrete form to an inner discipline of attention.', gemara: 'tractate-mastery.html?tractate=eruvin', canon: 'canon-course.html?course=tefillah-six', label: 'Connect boundary and purpose' },
    { skill: 'bava-kamma-shared-principle', title: 'Bava Kamma and covenant', copy: 'Legal categories become a system when a shared principle is named. Canon study asks the same question: what joins distinct texts into one responsibility?', gemara: 'tractate-mastery.html?tractate=bava-kamma', canon: 'source-reader.html?collection=covenant', label: 'Trace a shared principle' }
  ];
  Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : {}).then((learner) => {
    const mastery = learner.mastery || {};
    const connection = connections.find((item) => (mastery[item.skill] || 0) >= 0.2) || connections[0];
    const due = (learner.reviewQueue || []).length;
    const established = Object.values(mastery).filter((score) => score >= 0.67).length;
    target.innerHTML = `<p class="lesson-label">GEMARA AND CANON CONVERGE</p><h2>${connection.title}</h2><p>${connection.copy}</p><p><a href="${connection.gemara}">Gemara source trail &rarr;</a> &middot; <a href="${connection.canon}">${connection.label} &rarr;</a></p><p><small>${established} skills established &middot; ${due} review${due === 1 ? '' : 's'} due</small></p>`;
  }).catch(() => {});
})();
