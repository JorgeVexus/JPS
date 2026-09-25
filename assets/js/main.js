(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Scroll reveal — Apple-style fade + rise, staggered via CSS delays
     --------------------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Subtle parallax on the hero background image
     --------------------------------------------------------------------- */
  var parallaxLayer = document.querySelector('[data-parallax-layer]');
  var parallaxRoot = document.querySelector('[data-parallax-root]');

  if (parallaxLayer && parallaxRoot && !prefersReducedMotion) {
    var ticking = false;

    function updateParallax() {
      var rect = parallaxRoot.getBoundingClientRect();
      var progress = rect.top / (window.innerHeight || 1); // 0 at top of view, negative as it scrolls up
      var offset = Math.max(-40, Math.min(40, progress * -40));
      parallaxLayer.style.transform = 'scale(1.08) translateY(' + offset.toFixed(2) + 'px)';
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateParallax();
  }

  /* ---------------------------------------------------------------------
     Magnetic buttons — gentle pull toward the cursor within bounds
     --------------------------------------------------------------------- */
  if (!prefersReducedMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var magnets = Array.prototype.slice.call(document.querySelectorAll('[data-magnetic]'));

    magnets.forEach(function (el) {
      var strength = 0.28;

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = 'translate(' + (x * strength).toFixed(2) + 'px,' + (y * strength).toFixed(2) + 'px)';
      });

      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------------------
     Button ripple — press feedback
     --------------------------------------------------------------------- */
  var rippleTargets = Array.prototype.slice.call(document.querySelectorAll('.btn'));

  rippleTargets.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (prefersReducedMotion) return;

      var rect = btn.getBoundingClientRect();
      var holder = btn.querySelector('.ripple');
      if (!holder) {
        holder = document.createElement('span');
        holder.className = 'ripple';
        btn.appendChild(holder);
      }
      holder.innerHTML = '';

      var size = Math.max(rect.width, rect.height);
      var span = document.createElement('span');
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - rect.left - size / 2) + 'px';
      span.style.top = (e.clientY - rect.top - size / 2) + 'px';
      holder.appendChild(span);

      window.setTimeout(function () {
        if (span.parentNode) span.parentNode.removeChild(span);
      }, 650);
    });
  });
})();
