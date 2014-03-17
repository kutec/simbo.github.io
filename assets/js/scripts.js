(function($) {
  return $(document).ready(function() {
    var disqusPublicKey, disqusShortname, disqusUrls, loadPage;
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
      $list = $('.site-search-results ul');
      index = null;
      indexData = null;
      reqRunning = false;
      $list.on({
        markCurrent: function() {
          return $list.find('a').each(function() {
            var $a, href;
            $a = $(this).removeClass('current');
            href = $a.attr('href');
            if (href === window.location.pathname || href === window.location) {
              return $a.addClass('current');
            }
          });
        }
      }).trigger('markCurrent');
      $input.on({
        focus: function() {
          return $('body').addClass('sidebar-expanded');
        }
      });
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
            $.each(results, function(i) {
              return $list.append($('<li/>').append($('<a href="' + this.url + '" tabindex="2"/>').append([$('<span class="date"/>').html(this.date)[0], $('<span class="title"/>').html(this.title)[0], $('<span class="excerpt"/>').html(this.excerpt)[0]])));
            });
          }
          $list.trigger('markCurrent');
        }
        $input.removeClass('loading');
      };
      $form.on({
        submit: function() {
          if (!$input.data('last-val') || $input.data('last-val') !== $input.val()) {
            $input.data('last-val', $input.val());
            if (!index) {
              buildIndex();
            } else {
              search();
            }
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
        var $a, href;
        $a = $(this);
        href = $a.attr('href');
        if (href.substr(0, 6) === '/demo/' || $a.hasClass('external') || (href.substr(0, 4) === 'http' && !((new RegExp('/' + window.location.host + '/')).test(href)))) {
          window.open(href, '_blank');
        } else if (history.pushState && !$a.hasClass('exclude')) {
          if (!((href === window.location.pathname) || (href === window.location))) {
            loadPage(href, true);
          }
        } else {
          return true;
        }
        return false;
      }
    }, 'a');
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
            $('main').replaceWith($main);
            $('.site-search-results ul').trigger('markCurrent');
            return $('body').removeClass('sidebar-expanded');
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) {},
          complete: function() {}
        });
      };
      history.replaceState({
        url: location.href
      }, $('title').html(), location.href);
      $(window).on({
        popstate: function(ev) {
          var state;
          state = ev.originalEvent.state;
          if (state) {
            return loadPage(state.url, false);
          }
        }
      });
    }
    $(window).on({
      keypress: function(ev) {
        if ($(':focus').filter(':input').not(':button').length === 0 && !(ev.altKey || ev.shiftKey || ev.ctrlKey || ev.metaKey)) {
          switch (ev.which) {
            case 115:
            case 83:
              $('.site-search input').focus();
              break;
            case 112:
            case 80:
              $('body').removeClass('sidebar-expanded');
              $('.pagination .left').click();
              break;
            case 110:
            case 78:
              $('body').removeClass('sidebar-expanded');
              $('.pagination .right').click();
              break;
            case 120:
            case 88:
              $('body').removeClass('sidebar-expanded');
              break;
            default:
              console.debug(ev.which);
              return true;
          }
          return false;
        }
        return true;
      }
    });
    disqusPublicKey = '4x3jCxzfcKh6b9Cq44f6qCeEPKPZipi5vA94XrAgYWIKSpNC3aNpnqxup9N2ZuOG';
    disqusShortname = 'simboslog';
    disqusUrls = [];
    return $('body').on({
      countComments: function() {
        var commentsLinks;
        disqusUrls = [];
        commentsLinks = $('.comments-link');
        commentsLinks.each(function() {
          return disqusUrls.push($(this).data('url'));
        });
        return $.ajax({
          type: 'GET',
          url: 'https://disqus.com/api/3.0/threads/set.jsonp',
          data: {
            api_key: disqusPublicKey,
            forum: disqusShortname,
            thread: disqusUrls
          },
          cache: false,
          dataType: 'jsonp',
          success: function(data) {
            return $.each(data.response, function() {
              return commentsLinks.filter('[data-disqus-url="' + this.link + '"]').html(this.posts + ' comments');
            });
          }
        });
      }
    }).trigger('countComments');
  });
})(jQuery);

//# sourceMappingURL=scripts.js.map
