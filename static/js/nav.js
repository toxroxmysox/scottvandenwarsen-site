(function () {
  var toggle = document.querySelector('.svw-nav__toggle');
  var links = document.querySelector('.svw-nav__links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    links.classList.toggle('is-open');
    var expanded = links.classList.contains('is-open');
    toggle.setAttribute('aria-expanded', expanded);
  });
})();
