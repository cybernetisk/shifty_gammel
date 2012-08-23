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

function ShiftManager()
{
    this.shifts = {};
    this.by_date = {};

    this.axis = new TimeAxis()

    this.updateColumns = function(shift, high)
    {
        if(shift.columns < high)
        {
            shift.columns = high;
            this.setIndex(shift);
            for(var i in shift.collisions)
                this.updateColumns(shift.collisions[i], high);
            return high;
        }
        else
        {
            return shift.columns;
        }
    }

    this.setIndex = function(shift)
    {
        for(var i = 0; i < shift.columns; i++)
        {
            var free = true;
            for(var j in shift.collisions)
                if(shift.collisions[j].index != undefined &&
                    shift.collisions[j].index == i)
                        free = false;
            if(free)
            {
                shift.index = i;
                return;
            }
        }

    }
    this.addShift = function(shift)
    {
        shift.t_start = new Date(shift.start);
        shift.t_end = new Date(shift.end);
        
        if(!(shift.id in this.shifts))
        {

            this.shifts[shift.id] = shift;
            
            //this.render_shift(shift);

            shift.collisions = this.collisions(shift);

            shift.columns = 0;
            this.updateColumns(shift, shift.collisions.length);

            this.setIndex(shift);
        }

        
//        if(!(shift.id in this.shifts) || shift != this.shifts[shift.id])
//        {
//
//            this.shifts[shift.id] = shift;
//            this.render_shift(shift)
//        }


    }

    this.collides = function(a,b)
    {
        if(a.t_start <= b.t_start &&
             a.t_end > b.t_start)
             return true;

        if(a.t_start <= b.t_end &&
            a.t_end > b.t_end)
             return true;

        if(a.t_start >= b.t_start &&
               a.t_end <= b.t_end)
               return true;
           
        return false;
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
    
    $("shift_" + shift.id).remove()
    shift.day = shift.t_start.getDay();
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