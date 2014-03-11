(function($) {
  $(document).ready(function() {
    $('.sidebar-toggle:first').each(function() {
      $(this).on({
        click: function(ev) {
          ev.preventDefault;
          $('body').toggleClass('sidebar-expanded');
        }
      });
    });
  });
})(jQuery);

//# sourceMappingURL=scripts.js.map
