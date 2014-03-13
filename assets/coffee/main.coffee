# anonymous wrapper and dom-ready

(($) ->
    $(document).ready ->

        # Button: toggle sidebar

        $('.sidebar-toggle:first').on
            click: (ev) ->
                ev.preventDefault
                $('body').toggleClass 'sidebar-expanded'

        # open external links in new tab

        $('a[href^="http://"]').each ->
            if !( ( new RegExp '/'+window.location.host+'/' ).test this.href )
                $(this).attr 'target', '_blank'

        # end of dom-ready

)(jQuery)
