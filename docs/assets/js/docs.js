$(function () {

    var $win = $(window),
        $nav = $('#nav');

    $('.doc-sidenav').affix({
        offset: {
            top: function () {
                // 56px: breadcrumb's height 36px + 20px margin
                return $win.width() > 980 ? 56 : 56 + $nav.height();
            },
            // 81px: footer's height 61px + 20px margin
            bottom: 81
        }
    });

    // prettify code
    window.prettyPrint && prettyPrint();
});