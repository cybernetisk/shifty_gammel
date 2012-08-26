function getDate(date)
{
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
}

function TimeAxis()
{
    this.start = 0;
    this.stop = 24*60;

    this.intervals = 60;

    this.lines = function(){
        var result = Array();
        for(var i = this.start; i < this.stop; i+= this.intervals)
            result.push(i);
        return result;
    };

    this.convert = function(date){
        var hour = date.getHour();
        var minute = date.getMinute();
        return (hour * 60 + minute - this.start) / (this.stop - this.start);
    };

    this.c = this.convert;
}
function collides(a,b)
{
    if(a.t_start <= b.t_start &&
        a.t_end > b.t_start)
            return true;
    if(b.t_start <= a.t_start &&
        b.t_end > a.t_start)
            return true;

    return false;
}

function Group(shift)
{
    /*
     * A group of shifts that overlap and needs to be sorted into columns.
     */
    
    this.columns = Array(new Column());
    
    this.t_start = shift.t_start;
    this.t_end = shift.t_end;
    this.shifts = Array();
    
    this.fits = function(shift)
    {
        // a shift fits into a group if it's within the time range.
        return collides(this, shift);
    }

    this.merge = function(group)
    {
        for(var i in group.shifts)
            this.push(group.shifts[i]);
    }
    
    this.push = function(shift)
    {
        /*
         * Add a shift to this group.
         */
        if(this.t_start == undefined || this.t_start > shift.t_start)
            this.t_start = shift.t_start;

        if(this.t_end == undefined || this.t_end < shift.t_end)
            this.t_end = shift.t_end;
        
        this.shifts.push(shift);

        /*
         * We try to push it into each column, if one returns true it fitted.
         * If not we have to try the next.
         */
        for(var i in this.columns)
            if(this._push(i, shift)) return true;

        // No column fitted, let's make a new one.
        this.columns.push( new Column() );
        this._push(this.columns.length - 1, shift);
        
        return true;
    }

    this._push = function(i, shift)
    {
        if(this.columns[i].push(shift))
        {
            shift.group = this;
            shift.index = i;
            return true;
        }
        return false;
    }
    
    if(shift != undefined)
        this._push(0, shift);
    
}

function Column()
{
    this.shifts = Array();

    this.push = function(shift)
    {
        for(var i in this.shifts)
            if(collides(this.shifts[i], shift))
                return false;

        this.shifts.push(shift);
        return true;
    }
}

function ShiftManager()
{
    /*
     * The shift manager class handles layout of shifts, checking where they
     * collide and splitting them into columns so that all is visible.
     *
     * A group is a set of shifts that overlap in some manner. A group splits the
     * shifts into n columns, where they are organized so that no two shifts 
     * within the same column overlap. If there's not free space in a column, it 
     * just makes a new one.
     *
     * Right now we reload all the data into the shift manager each time we have
     * a change. This runs well on chrome, but could lead to performance issues.
     * We should just reorder the affected groups, and merge/split them when
     * required.
     */
    this.shifts = {};
    
    this.groups = Array();

    this.axis = new TimeAxis()

    this.addShift = function(shift)
    {
        if(shift.t_start == undefined)
        {
            shift.t_start = new Date(shift.start);
            shift.t_end = new Date(shift.end);
        }
        shift.changed = true;

        var matches = Array();
        for(var i in this.groups)
                if(this.groups[i].fits(shift))
                    matches.push(this.groups[i]);
        
        if(matches.length > 0)
        {
            for(var i = 1; i < matches.length; i++)
            {
                matches[0].merge(matches[i]);
                this.groups.splice(this.groups.indexOf(matches[i]));
            }
            matches[0].push(shift);
            this.shifts[shift.id] = shift;
            return;
        }
        
        this.groups.push(new Group(shift));
        this.shifts[shift.id] = shift;
    }
}


function makeDayGrid()
{
    for(var i = 0; i < 7; i++)
    {
        var l = (i / 7.0 * 100).toFixed(3);
        var d = $("<div />");
        d.addClass("dayline");
        d.css('left', l + "%");
        $("#calendar").append(d);
    }
}

function makeHourGrid()
{
    for(var i = 0; i < 25; i++)
    {
        var h = (i / 24.0 * 100).toFixed(3);
        var d = $("<div />");
        d.addClass("hourline");
        d.css('top', h+'%');
        $("#calendar").append(d);
    }
}

function makeHalfHourGrid()
{
    for(var i = 0.5; i < 25; i++)
    {
        var h = (i / 24.0 * 100).toFixed(3);
        var d = $("<div />");
        d.addClass("halfhourline");
        d.css('top', h+'%');
        $("#calendar").append(d);
    }
}

function getPT(s)
{
    // converts hours and minutes into a top value
    return ((s.getHours() + s.getMinutes() / 60.0)/24.0*100).toFixed(3);
}

function setXAxis(e, s, d)
{
    /*
     *  a hack to convert time into a horizontal coordinate. Should be handled
     *  in the calendar view relative to start and stop values set there.
     */
    var day = (d.getDay() - 1) / 7.0 * 100;

    var p = parseFloat(e.index) / e.columns;

    var per = p / 7.0 * 100 + day;
    var width= (1.0 / 7 / e.columns * 100).toFixed(3);
    s.css('right', (100 - per - width) + "%");
    s.css("left", per + "%");
}


function CalendarView(div, start, stop)
{
    /*
     * This class handles fetching calendar info, feeding the shift manager for layout
     * and rendering the shifts.
     */
    this.div = div;
    this.start = start;
    this.stop = stop;

    var duration = this.stop.valueOf() - this.start.valueOf();
    this.aday = 24 * 60 * 60 * 1000;

    this.days = (duration / this.aday).toFixed(0);

    this.shiftManager = new ShiftManager();
    this.shifts = Array();
    
    this.refresh = function()
    {
        this.shiftManager = new ShiftManager();
        
        for(var i in this.shifts)
            this.shiftManager.addShift(this.shifts[i]);
        
        for(var i in this.shifts)
            this.renderShift(this.shifts[i]);

    };

    this.fetch = function()
    {
        
        var res = $.ajax('/shifts/calendar.json', {async:   false});

        data = jQuery.parseJSON(res.responseText);
        for(var i in data)
            this.shifts.push(data[i]);
    };
    
    this.renderShift = function(shift)
    {
        var start = getDate(shift.t_start);
        var stop = getDate(shift.t_end);
    //    shift.columns = shift.group.columns.length;

        $(".shift_" + shift.id).remove()
        shift.day = shift.t_start.getDay();
        shift.columns = shift.group.columns.length;
        if(start == stop)
        {
            var s = ich.shift(shift);
            //find the top coordinate for the shift
            s.css('top', getPT(shift.t_start) + "%");
            // get the height. Can't use bottom coordinate as this
            // messes up moving the shifts.
            s.css('height', (getPT(shift.t_end) - getPT(shift.t_start)) + "%");
            s.addClass("shift_" + shift.id);
            s.addClass("column_" + shift.index + "of" + shift.columns);
                s.data('shift', shift);

            // sets the x coordinate.
            setXAxis(shift, s, shift.t_start);
            $("#calendar").append(s);
        }
        else
        {
            /*
             * this handles the shift when it's split across two days,
             * it's basically the same as oneday shifts, but just draws it two
             * times (one on each day).
             *
             * Shifts spanning over more than one day is not supported.
             */
            var s = ich.shift(shift);
            s.css('top', getPT(shift.t_start) + "%");
            s.css('height', (100 - getPT(shift.t_start)) + "%");
            s.addClass("column_" + shift.index + "of" + shift.columns);
            setXAxis(shift, s, shift.t_start);
            s.addClass("shift_" + shift.id);
            s.data('shift', shift);
            $("#calendar").append(s);

            if(!(shift.t_end.getHours() == 0 && shift.t_end.getMinutes() == 0))
            {
                /*
                 * skip if shifts only runs til midnight, we don't need to redraw
                 * them on the second day.
                 */
                var s = ich.shift(shift);
                s.css('top', "0%");
                s.css('height', (getPT(shift.t_end)) + "%");
                s.addClass("column_" + shift.index + "of" + shift.columns);
                setXAxis(shift, s, shift.t_end);
                s.addClass("shift_" + shift.id);
                s.data('shift', shift);
                $("#calendar").append(s);
            }
        }
    };
}