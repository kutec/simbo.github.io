(($) ->
    $(document).ready ->

        $('.sidebar-toggle:first').each ->
            $(this).on
                click: (ev)->
                    ev.preventDefault
                    $('body').toggleClass 'sidebar-expanded'
                    return
            return
        return

    return
)(jQuery)
