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

    function getDate(dt)
    {
        return dt.getFullYear().toString() + "_" + dt.getMonth().toString() + "_" + dt.getDate().toString();
    }

    function setXAxis(shift, date)
    {
        var s = new Date(date);
        var dow = s.getDay();
        shift.css('left', Math.round(dow/7*100)+"%");
        shift.css('width', Math.round(1.0/7*100) + "%");
    }

    function ShiftManager()
    {
        this.shifts = Array();
        this.addShift = function(shift)
        {
            shift.t_start = new Date(shift.start);
            shift.t_end = new Date(shift.end);
            this.shifts.push(shift);
        }

        this.collides = function(a,b)
        {
            if(a.t_start < b.t_start &&
                 a.t_end > b.t_start)
                 return true;
            if(a.t_start < b.t_end &&
                a.t_end > b.t_end)
                 return true;
            
        }
        this.collisions = function(shift)
        {
            shift.t_start = new Date(shift.start);
            shift.t_end = new Date(shift.end);

            count = 0;
            for(var i in this.shifts)
            {


            }
                }
        }
    }

    function render_shift(shift)
    {
        var start = getDate(new Date(shift.start));
        var stop = getDate(new Date(shift.end));
        var round = Math.round;
        if(start != stop)
        {
            var s = ich.shift(shift);
            s.css('top', round(new Date(shift.start).getHours() / 24 * 100) + "%");
            s.css('bottom', "0%");
            setXAxis(s, shift.start);
            $("#calendar").append(s);

            var s = ich.shift(shift);
            s.css('top', "0%");
            s.css('bottom', round(100 - new Date(shift.end).getHours() / 24 * 100) + "%");
            setXAxis(s, shift.stop);
            $("#calendar").append(s)
        }
        else
        {
            var s = ich.shift(shift);
            s.css('top', round(new Date(shift.start).getHours() / 24 * 100) + "%");
            s.css('bottom', round(100 - new Date(shift.end).getHours() / 24 * 100) + "%");
            setXAxis(s, shift.start);
            $("#calendar").append(s);
        }
    }

    $.get("/shifts/calendar.json", function(data){
        for(var i in data)
            render_shift(data[i]);
    })
});
