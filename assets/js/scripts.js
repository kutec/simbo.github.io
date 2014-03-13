(function($) {
  return $(document).ready(function() {
    $('.sidebar-toggle:first').on({
      click: function(ev) {
        ev.preventDefault;
        return $('body').toggleClass('sidebar-expanded');
      }
    });
    return $('a[href^="http://"]').each(function() {
      if (!((new RegExp('/' + window.location.host + '/')).test(this.href))) {
        return $(this).attr('target', '_blank');
      }
    });
  });
})(jQuery);

//# sourceMappingURL=scripts.js.map
