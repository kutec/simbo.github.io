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
            $list = $('.site-search-results').find('ul')
            index = null
            indexData = null
            reqRunning = false

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
                        $.each results, ->
                            $list.append $('<li/>').append $('<a href="'+this.url+'">').append [
                                $('<span class="date"/>').html(this.date)[0]
                                $('<span class="title"/>').html(this.title)[0]
                                $('<span class="excerpt"/>').html(this.excerpt)[0]
                            ]
                $input.removeClass 'loading'
                return

            # bind search events
            $form.on
                submit: ->
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
                href = $(this).attr 'href'
                # open external links in new window/tab
                if href.substr(0,4)=='http' and !( ( new RegExp '/'+window.location.host+'/' ).test href )
                    window.open href, '_blank'
                # load internal content
                else if history.pushState and !$(this).hasClass('exclude') and href!=window.location.pathname and href!=window.location
                    loadPage href, true
                else
                    return true
                return false

        , 'a[href]'

        #--- history manipulation

        if history.pushState

            # load content into page
            loadPage = (url,push) ->
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
                    error: (XMLHttpRequest, textStatus, errorThrown) ->
                        console.debug textStatus
                    complete: ->

            # set initial history state
            history.replaceState {url: location.href}, $('title').html(), location.href

            # history popstate handler
            $(window).on
                popstate: (ev) ->
                    state = ev.originalEvent.state
                    if state
                        loadPage state.url, false

        #--- end of dom-ready

)(jQuery)
