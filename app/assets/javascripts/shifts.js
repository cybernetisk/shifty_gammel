$(document).ready(function() {
    // Start point for the new shift
    var start = 0;
    var stop = 0;

    // Variable to store the shift object, so we can change it later
    var shift = null;

    // Variable to keep track of mouse down
    var mouse_down = false; 
    $(".day ul").mousedown(function(e) {
        // Set the start point
        start = e.pageY - $(this).offset().top;

        start = Math.floor(start / 10) * 10;

        // Min length is 15 minutes = 10 px
        stop = start + 10;

        // Track the mouse unntil it's moused up
        mouse_down = true;

        draw_shift(this);
    }).mousemove(function(e) {
        if (mouse_down) {
            stop = e.pageY - $(this).offset().top;

            stop = Math.ceil(stop / 10) * 10;

            if (stop - start < 10) {
                stop = start + 10;
            }

            draw_shift(this);
        }
    }).mouseup(function(e) {

        // Calculate the end point
        /*stop = e.pageY - $(this).offset().top;

        stop = Math.ceil(stop / 10) * 10;

        // Check that the endpoint is at least
        // 15 minutes from the start point
        if (stop - start < 10) {
            stop = start + 10;
        }

        // Draw the shift
        draw_shift(this); */

        // toggle_popup();

        mouse_down = false;

        //shift = null;
    });

    function draw_shift(element) {
        if (!shift) {
            shift = $("<li class=\"event\"></li>");
        }
        shift.css("top", start + "px");
        shift.css("height", (stop - start) + "px");
        $(element).append(shift);
    }
});
