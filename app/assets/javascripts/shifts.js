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
    this.columns = Array(new Column());
    
    this.t_start = shift.t_start;
    this.t_end = shift.t_end;
    this.shifts = Array();
    
    this.fits = function(shift)
    {
        return collides(this, shift);
        var a = this;
        var b = shift;
        
        if(a.t_start <= b.t_start &&
            a.t_end >= b.t_start)
                return true;
        if(b.t_start <= a.t_start &&
            b.t_end >= a.t_start)
                return true;
    }

    this.merge = function(group)
    {
        for(var i in group.shifts)
            this.push(group.shifts[i]);
    }
    
    this.push = function(shift)
    {
        if(this.t_start == undefined || this.t_start < shift.t_start)
            this.t_start = shift.t_start;

        if(this.t_end == undefined || this.t_end < shift.t_end)
            this.t_end = shift.t_end;
        
        this.shifts.push(shift);
        
        for(var i in this.columns)
            if(this._push(i, shift)) return true;
        
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
    this.shifts = {};
    
    this.groups = Array();

    this.axis = new TimeAxis()

    this.updateColumns = function(shift, high)
    {
        if(shift.columns < high)
        {
            shift.columns = high;
            shift.changed = true;
            this.setIndex(shift);
            
            for(var i in shift.collisions)
                this.columns = this.updateColumns(shift.collisions[i], high);
            
            return this.columns;
        }
        else
        {
            return high;
        }
    }

    this.updateShift = function(shift)
    {
        
    }

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
                this.groups.splice(this.groups.indexof(matches[i]));
            }
            matches[0].push(shift);
            this.shifts[shift.id] = shift;
            return;
        }
        
        this.groups.push(new Group(shift));
        this.shifts[shift.id] = shift;
    }


    this.fix_columns = function(shift)
    {
        shift.collisions = this.collisions(shift);
        
    }

    this.collisions = function(shift)
    {
        var collides = [];
        for(var i in this.shifts)
        {
            if(this.collides(this.shifts[i], shift))
                collides.push(this.shifts[i]);
        }

        return collides;
    }

}

function render_shift(shift)
{
    var start = getDate(shift.t_start);
    var stop = getDate(shift.t_end);
//    shift.columns = shift.group.columns.length;
    
    $(".shift_" + shift.id).remove()
    shift.day = shift.t_start.getDay();
    shift.columns = shift.group.columns.length;
    if(start != stop)
    {
        var s = ich.shift(shift);
        s.css('top', getPT(shift.t_start) + "%");
        s.css('bottom', "0%");
        s.addClass("column_" + shift.index + "of" + shift.columns);
        setXAxis(shift, s, shift.t_start);
        s.addClass("shift_" + shift.id);
        s.data('shift', shift);
        $("#calendar").append(s);

        if(!(shift.t_end.getHours() == 0 && shift.t_end.getMinutes() == 0))
        {
            var s = ich.shift(shift);
            s.css('top', "0%");
            s.css('bottom', (100 - getPT(shift.t_end)) + "%");
            s.addClass("column_" + shift.index + "of" + shift.columns);
            setXAxis(shift, s, shift.t_end);
            s.addClass("shift_" + shift.id);
            s.data('shift', shift);
            $("#calendar").append(s);
        }
    }
    else
    {
        var s = ich.shift(shift);
        s.css('top', getPT(shift.t_start) + "%");
        s.css('bottom', (100 - getPT(shift.t_end)) + "%");
        s.addClass("shift_" + shift.id);
        s.addClass("column_" + shift.index + "of" + shift.columns);
            s.data('shift', shift);
        setXAxis(shift, s, shift.t_start);
        $("#calendar").append(s);
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

function getPT(s)
{
    return ((s.getHours() + s.getMinutes() / 60.0)/24.0*100).toFixed(3);
}

function setXAxis(e, s, d)
{
    var day = (d.getDay() - 1) / 7.0 * 100;

    var p = parseFloat(e.index) / e.columns;

    var per = p / 7.0 * 100 + day;
    var width= (1.0 / 7 / e.columns * 100).toFixed(3);
    s.css('right', (100 - per - width) + "%");
    s.css("left", per + "%");
}