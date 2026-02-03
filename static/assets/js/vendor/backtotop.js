!function ($) {
    "use strict";

    $(document).ready(function () {
        const path = document.querySelector(".rbt-progress-parent path");

        // ✅ If back-to-top SVG isn't on this page, do nothing (prevents crash)
        if (!path) return;

        const pathLength = path.getTotalLength();

        path.style.transition = path.style.WebkitTransition = "none";
        path.style.strokeDasharray = pathLength + " " + pathLength;
        path.style.strokeDashoffset = pathLength;
        path.getBoundingClientRect();
        path.style.transition = path.style.WebkitTransition =
            "stroke-dashoffset 10ms linear";

        const updatePath = function () {
            const scroll = $(window).scrollTop();
            const height = $(document).height() - $(window).height();
            path.style.strokeDashoffset = pathLength - (scroll * pathLength) / height;
        };

        updatePath();
        $(window).on("scroll", updatePath);

        $(window).on("scroll", function () {
            if ($(this).scrollTop() > 50) {
                $(".rbt-progress-parent").addClass("rbt-backto-top-active");
            } else {
                $(".rbt-progress-parent").removeClass("rbt-backto-top-active");
            }
        });

        $(".rbt-progress-parent").on("click", function (e) {
            e.preventDefault();
            $("html, body").animate({ scrollTop: 0 }, 550);
            return false;
        });
    });
}(jQuery);
