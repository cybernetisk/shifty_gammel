function getDate(date)
{
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    if(m < 10) m = "0" + m;
    if(d < 10) d  = "0" + d;

    return y + "-" + m + "-" + d;
}

function getISODateTime(d){
    // padding function
    var s = function(a,b){return(1e15+a+"").slice(-b)};

    // default date parameter
    if (typeof d === 'undefined'){
        d = new Date();
    };

    // return ISO datetime
    return d.getFullYear() + '-' +
        s(d.getMonth()+1,2) + '-' +
        s(d.getDate(),2) + ' ' +
        s(d.getHours(),2) + ':' +
        s(d.getMinutes(),2) + ':' +
        s(d.getSeconds(),2);
}

function collides(a,b)
{
    if(a.start <= b.start &&
        a.end > b.start)
            return true;
    if(b.start <= a.start &&
        b.end > a.start)
            return true;

    if(b.start < a.start &&
        b.end > a.end)
            return true;

    if(a.start < b.start &&
        a.end > b.end)
            return true;

    return false;
}

function Group(shift)
{
    /*
     * A group of shifts that overlap and needs to be sorted into columns.
     */
    
    this.columns = Array(new Column());
    
    this.start = shift.start;
    this.end = shift.end;
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
        if(this.start == undefined || this.start > shift.start)
            this.start = shift.start;

        if(this.end == undefined || this.end < shift.end)
            this.end = shift.end;
        
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

    this.addShift = function(shift)
    {
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




function CalendarView(div, start, stop)
{
    /*
     * This class handles fetching calendar info, feeding the shift manager for layout
     * and rendering the shifts.
     */
    this.div = div;
    this.start = new Date('2012-08-27');// start;
    this.stop = new Date('2012-09-03');

    var duration = this.stop.valueOf() - this.start.valueOf();
    this.aday = 24 * 60 * 60 * 1000;

    this.days = (duration / this.aday).toFixed(0);
    
    this.shiftManager = new ShiftManager();
    this.shifts = {};
    
    this.refresh = function()
    {
        this.shiftManager = new ShiftManager();
        
        for(var i in this.shifts)
            this.shiftManager.addShift(this.shifts[i]);

        this.render();
    };

    this.render = function()
    {
        for(var i in this.shifts)
            if(this.shifts[i].changed)
                this.renderShift(this.shifts[i]);
    }

    this.last_update = false;

    this.update = function()
    {
        if(this.fetch())
            this.refresh();
    }
    
    this.fetch = function()
    {
        var data = {start:getDate(this.start), stop:getDate(this.stop) };
        if(this.last_update)
            data['updated'] = this.last_update;
        
        var res = $.ajax('/shifts/calendar.json', {type:'post',
            data:data, async:   false});
            
        data = jQuery.parseJSON(res.responseText);
        for(var i in data)
        {
            var shift = data[i];

            if(this.last_update == false || shift.updated_at > this.last_update)
                this.last_update = shift.updated_at;

            shift.start = new Date(shift.start);
            shift.end = new Date(shift.end);
            this.shifts[shift.id] = shift;
        }

        return data.length > 0;
    };
    
    this.renderShift = function(shift)
    {
        shift.day = shift.start.getDay();
        shift.columns = shift.group.columns.length;

        var width = 100 / this.days / shift.columns;
        var pos = this.timeToOffset(shift.start);

        var i_offset = 100 / this.days / shift.columns * shift.index;

        var left = pos[0] + i_offset;
        var top = pos[1];
        
        shift.test = left + "," + top
        var height = (shift.end.valueOf() - shift.start.valueOf()) / this.aday * 100;
        
        var css = {'top':top.toFixed(2) + "%",
            'left':left.toFixed(2) + "%",
            'width':width.toFixed(2) + "%",
            'height':height.toFixed(2) + "%"};

        var cmp = css.top + css.left + css.width + css.height;

        if(cmp == shift.last)
            return;
        shift.last = cmp;

        $(".shift_" + shift.id).remove()
        var s = ich.shift(shift);
        var pos = this.timeToOffset(shift.start);
        
        s.css(css);

        s.addClass("shift_" + shift.id);
        s.addClass("column_" + shift.index + "of" + shift.columns);
            s.data('shift', shift);

        $("#calendar").append(s);
//
        if(top + height > 100)
        {
            css.top = (top - 100).toFixed(2) + "%"
            css.left = (left + 1 / this.days * 100).toFixed(2) + "%"
            var s = ich.shift(shift);

            s.css(css);

            s.addClass("column_" + shift.index + "of" + shift.columns);
            s.addClass("shift_" + shift.id);
            s.data('shift', shift);
            $("#calendar").append(s);
        }
    };

    this.timeToOffset = function(time)
    {
        var s = time.valueOf() - this.start.valueOf();

        var day = Math.floor(s / this.aday);
        var time = s - day * this.aday;

        var x = (day / this.days * 100);
        var y = (time / this.aday * 100);

        return Array(x,y);
    }

    this.offsetToTime = function(x,y)
    {
        var day = Math.round(x / 100.0 * this.days);

        var time = Math.round(y / 100.0 * 900) / 900;
        
        time = day + time;
        
        time = Math.round(time * this.aday);
        time += this.start.valueOf();

        return new Date(time);
    }
}