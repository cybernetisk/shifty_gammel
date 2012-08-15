function getDate(date)
{
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
}

function ShiftManager()
{
    this.shifts = {};
    this.by_date = {};

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
    
    var round = Math.round;
    $("shift_" + shift.id).remove()
    shift.day = shift.t_start.getDay();
    if(start != stop)
    {
        var s = ich.shift(shift);
        s.css('top', round(shift.t_start.getHours() / 24 * 100) + "%");
        s.css('bottom', "0%");
        s.addClass("column_" + shift.index + "of" + shift.columns);
        setXAxis(shift, s, shift.t_start);
        s.addClass("shift_" + shift.id);
        $("#calendar").append(s);

        var s = ich.shift(shift);
        s.css('top', "0%");
        s.css('bottom', round(100 - shift.t_end.getHours() / 24 * 100) + "%");
        s.addClass("column_" + shift.index + "of" + shift.columns);
        setXAxis(shift, s, shift.t_end);
        s.addClass("shift_" + shift.id);
        $("#calendar").append(s)
    }
    else
    {
        var s = ich.shift(shift);
        s.css('top', round(shift.t_start.getHours() / 24 * 100) + "%");
        s.css('bottom', round(100 - shift.t_end.getHours() / 24 * 100) + "%");
        s.addClass("shift_" + shift.id);
        s.addClass("column_" + shift.index + "of" + shift.columns);
        setXAxis(shift, s, shift.t_start);
        $("#calendar").append(s);
    }
}

function setXAxis(e, s, d)
{
    var day = d.getDay() * 200;

    var p = parseFloat(e.index) / e.columns;

    var per = Math.round(p * 200 + day);
    s.css('width', Math.round(200 / e.columns) + "px");
    s.css("left", per + "px");
}