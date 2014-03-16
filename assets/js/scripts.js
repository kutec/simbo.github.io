(function($) {
  return $(document).ready(function() {
    var loadPage;
    $('.sidebar-toggle:first').on({
      click: function(ev) {
        ev.preventDefault;
        return $('body').toggleClass('sidebar-expanded');
      }
    });
    $('.site-search').each(function() {
      var $form, $input, $list, buildIndex, index, indexData, reqRunning, search;
      $form = $(this).find('form');
      $input = $form.find('input');
      $list = $('.site-search-results').find('ul');
      index = null;
      indexData = null;
      reqRunning = false;
      buildIndex = function() {
        if (!reqRunning) {
          $.ajax({
            url: '/lunr.data',
            dataType: 'text',
            beforeSend: function() {
              reqRunning = true;
              return $input.addClass('loading');
            },
            success: function(data) {
              index = lunr(function() {
                this.field('title', {
                  boost: 10
                });
                this.field('content');
                this.ref('id');
              });
              data = data.trim().split(/\n{2,}/);
              indexData = [];
              return $.each(data, function(i) {
                var d;
                d = this.trim().split(/\n/);
                d = {
                  title: d[0],
                  content: d[1],
                  url: d[2],
                  excerpt: d[3],
                  date: d[4]
                };
                indexData[i] = d;
                return index.add({
                  title: d.title,
                  content: d.content,
                  id: i
                });
              });
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {},
            complete: function() {
              reqRunning = false;
              $input.removeClass('loading');
              return search();
            }
          });
        }
      };
      search = function() {
        var indexResults, results;
        $input.addClass('loading');
        if (index) {
          results = [];
          if ($input.val().length > 0) {
            indexResults = index.search($input.val());
            $.each(indexResults, function() {
              return results.push(indexData[this.ref]);
            });
          } else {
            results = indexData;
          }
          $list.empty();
          if (results.length === 0) {
            $list.append($('<li class="no-results">Nothing found.</li>'));
          } else {
            $.each(results, function() {
              return $list.append($('<li/>').append($('<a href="' + this.url + '">').append([$('<span class="date"/>').html(this.date)[0], $('<span class="title"/>').html(this.title)[0], $('<span class="excerpt"/>').html(this.excerpt)[0]])));
            });
          }
        }
        $input.removeClass('loading');
      };
      $form.on({
        submit: function() {
          if (!index) {
            buildIndex();
          } else {
            search();
          }
          return false;
        }
      });
      $input.on({
        change: function() {
          return $form.trigger('submit');
        },
        keyup: function() {
          return $form.trigger('submit');
        }
      });
      return $form.trigger('submit');
    });
    $(document).on({
      click: function() {
        var href;
        href = $(this).attr('href');
        if (href.substr(0, 4) === 'http' && !((new RegExp('/' + window.location.host + '/')).test(href))) {
          window.open(href, '_blank');
        } else if (history.pushState && href !== window.location.pathname && href !== window.location) {
          loadPage(href, true);
        }
        return false;
      }
    }, 'a[href]');
    if (history.pushState) {
      loadPage = function(url, push) {
        return $.ajax({
          url: url,
          dataType: 'html',
          beforeSend: function() {},
          success: function(data) {
            var $data, $main, $title;
            $data = $(data);
            $title = $data.filter('title');
            $main = $data.filter('main');
            if (push) {
              history.pushState({
                url: url
              }, $title.html(), url);
            }
            $('title').replaceWith($title);
            return $('main').replaceWith($main);
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) {
            return console.debug(textStatus);
          },
          complete: function() {}
        });
      };
      history.replaceState({
        url: location.href
      }, $('title').html(), location.href);
      return $(window).on({
        popstate: function(ev) {
          var state;
          state = ev.originalEvent.state;
          if (state) {
            return loadPage(state.url, false);
          }
        }
      });
    }
  });
})(jQuery);

//# sourceMappingURL=scripts.js.map
