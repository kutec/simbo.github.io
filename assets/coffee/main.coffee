# anonymous wrapper and dom-ready

(($) ->
    $(document).ready ->

        #--- Button: toggle sidebar

        $('.sidebar-toggle:first').on
            click: (ev) ->
                ev.preventDefault
                $('body').toggleClass 'sidebar-expanded'

        #--- lunr search integration

        $('.site-search').each ->
            $form = $(this).find('form')
            $input = $form.find('input')
            $list = $('.site-search-results ul')
            index = null
            indexData = null
            reqRunning = false

            # mark current page in search results
            $list.on
                markCurrent: ->
                    $list.find('a').each ->
                        $a = $(this).removeClass 'current'
                        href = $a.attr 'href'
                        if href==window.location.pathname or href==window.location
                            $a.addClass 'current'
            .trigger 'markCurrent'

            # show sidebar when searchfield is focussed
            $input.on
                focus: ->
                    $('body').addClass 'sidebar-expanded'

            # build search index from lunr.data
            buildIndex = ->
                if !reqRunning
                    $.ajax
                        url: '/lunr.data'
                        dataType: 'text'
                        beforeSend: ->
                            reqRunning = true
                            $input.addClass 'loading'
                        success: (data) ->
                            index = lunr ->
                                this.field 'title',
                                    boost: 10
                                this.field 'content'
                                this.ref 'id'
                                return
                            data = data.trim().split /\n{2,}/
                            indexData = []
                            $.each data, (i) ->
                                d = this.trim().split /\n/
                                d =
                                    title: d[0]
                                    content: d[1]
                                    url: d[2]
                                    excerpt: d[3]
                                    date: d[4]
                                indexData[i] = d
                                index.add
                                    title: d.title
                                    content: d.content
                                    id: i
                        error: (XMLHttpRequest, textStatus, errorThrown) ->
                            #console.debug textStatus
                        complete: ->
                            reqRunning = false
                            $input.removeClass 'loading'
                            search()
                return

            # search the index
            search = ->
                $input.addClass 'loading'
                if index
                    results = []
                    if $input.val().length>0
                        indexResults = index.search $input.val()
                        $.each indexResults, ->
                            results.push indexData[this.ref]
                    else
                        results = indexData
                    $list.empty()
                    if results.length==0
                        $list.append $('<li class="no-results">Nothing found.</li>')
                    else
                        $.each results, (i) ->
                            $list.append $('<li/>').append $('<a href="'+this.url+'" tabindex="2"/>').append [
                                $('<span class="date"/>').html(this.date)[0]
                                $('<span class="title"/>').html(this.title)[0]
                                $('<span class="excerpt"/>').html(this.excerpt)[0]
                            ]
                    $list.trigger 'markCurrent'
                $input.removeClass 'loading'
                return

            # bind search events
            $form.on
                submit: ->
                    if !$input.data('last-val') or $input.data('last-val')!=$input.val()
                        $input.data 'last-val', $input.val()
                        if !index
                            buildIndex()
                        else
                            search()
                    return false
            $input.on
                change: ->
                    $form.trigger 'submit'
                keyup: ->
                    $form.trigger 'submit'
            $form.trigger 'submit'

        #--- handle links

        $(document).on
            click: ->
                $a = $(this)
                href = $a.attr 'href'
                # open external links in new window/tab
                if href.substr(0,6)=='/demo/' or $a.hasClass('external') or ( href.substr(0,4)=='http' and !((new RegExp '/'+window.location.host+'/').test href) )
                    window.open href, '_blank'
                # load internal content
                else if history.pushState and !$a.hasClass('exclude')
                    if !((href==window.location.pathname) or (href==window.location))
                        loadPage href, true
                else
                    return true
                return false
        , 'a'

        #--- history manipulation

        if history.pushState

            # load content into page
            loadPage = (url, push) ->
                $.ajax
                    url: url
                    dataType: 'html'
                    beforeSend: ->
                    success: (data) ->
                        $data = $(data)
                        $title = $data.filter('title')
                        $main = $data.filter('main')
                        if push
                            history.pushState {url: url}, $title.html(), url
                        $('title').replaceWith $title
                        $('main').replaceWith $main
                        $('.site-search-results ul').trigger 'markCurrent'
                        $('body').removeClass 'sidebar-expanded'
                    error: (XMLHttpRequest, textStatus, errorThrown) ->
                        # console.debug textStatus
                    complete: ->

            # set initial history state
            history.replaceState {url: location.href}, $('title').html(), location.href

            # history popstate handler
            $(window).on
                popstate: (ev) ->
                    state = ev.originalEvent.state
                    if state
                        loadPage state.url, false

        #--- keyboard shortcuts

        $(window).on
            keypress: (ev) ->
                if $(':focus').filter(':input').not(':button').length==0 and !(ev.altKey || ev.shiftKey || ev.ctrlKey || ev.metaKey)
                    switch ev.which
                        when 115,83 # S
                            $('.site-search input').focus()
                        when 112,80 # P
                            $('body').removeClass 'sidebar-expanded'
                            $('.pagination .left').click()
                        when 110,78 # N
                            $('body').removeClass 'sidebar-expanded'
                            $('.pagination .right').click()
                        when 120,88 # X
                            $('body').removeClass 'sidebar-expanded'
                        else
                            console.debug ev.which
                            return true
                    return false
                return true

        #--- disqus comment counts

        disqusPublicKey = '4x3jCxzfcKh6b9Cq44f6qCeEPKPZipi5vA94XrAgYWIKSpNC3aNpnqxup9N2ZuOG'
        disqusShortname = 'simboslog'
        disqusUrls = []

        $('body').on
            countComments: ->
                disqusUrls = []
                commentsLinks = $('.comments-link')
                commentsLinks.each ->
                    disqusUrls.push $(this).data('url')
                $.ajax
                    type: 'GET'
                    url: 'https://disqus.com/api/3.0/threads/set.jsonp'
                    data:
                        api_key: disqusPublicKey
                        forum: disqusShortname
                        thread: disqusUrls
                    cache: false
                    dataType: 'jsonp'
                    success: (data) ->
                        $.each data.response, ->
                            commentsLinks.filter('[data-disqus-url="'+this.link+'"]').html this.posts+' comments'
        .trigger 'countComments'


        #--- end of dom-ready

)(jQuery)
