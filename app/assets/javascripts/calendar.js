
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



function CalendarView(div, start, stop)
{
    /*
     * This class handles fetching calendar info, feeding the shift manager for layout
     * and rendering the shifts.
     */
    var self = this;

    self.div = div;
    div.html("");
    self.shiftManager = new ShiftManager();
    self.shifts = {};
    self.weekgrid = new WeekGrid(div, start, stop);

    self.refresh = function()
    {
        self.shiftManager = new ShiftManager();
        
        for(var i in this.shifts)
            self.shiftManager.addShift(this.shifts[i]);

        self.render();
        self.weekgrid.refresh();
    };

    self.render = function()
    {
        for(var i in self.shifts)
            if(self.shifts[i].changed)
                self.renderShift(self.shifts[i]);
    }
    
    self.last_update = false;

    self.clear = function(){
        self.shifts = {};
        $(".shift").remove();
    }

    self.handleData = function(data)
    {
        for(var i in data)
        {
            var shift = data[i];

            if(self.last_update == false || shift.updated_at > self.last_update)
                self.last_update = shift.updated_at;

            self.addShift(shift);
        }

        if(data.length > 0)
            self.refresh();
        
        self.query = undefined;
    }
    
    self.addShift = function(shift)
    {
        shift.start = new Date(shift.start);
        shift.end = new Date(shift.end);
        self.shifts[shift.id] = shift;
    }

    self.removeShift = function(shift_id)
    {
        $("shift_" + shift_id).remove();
        delete self.shifts[shift_id];
    }

    this.renderShift = function(shift)
    {
        shift.day = shift.start.getDay();
        shift.columns = shift.group.columns.length;

        var width = 100 / this.days / shift.columns;
        var pos = self.timeToOffset(shift.start);

        var i_offset = 100 / self.days / shift.columns * shift.index;

        var left = pos[0] + i_offset;
        var top = pos[1];
        
        shift.test = left + "," + top;
        var height = (shift.end.valueOf() - shift.start.valueOf()) / self.aday * 100;
        
        var css = {'top':top.toFixed(2) + "%",
            'left':left.toFixed(2) + "%",
            'width':width.toFixed(2) + "%",
            'height':height.toFixed(2) + "%",
            'z-index':top.toFixed(0)};

        var cmp = css.top + css.left + css.width + css.height;

        if(cmp == shift.last)
        {
            return;
        }
        shift.last = cmp;

        shift.start_time = shift.start.toString("HH:mm:ss")
        shift.end_time = shift.end.toString("HH:mm:ss")

        $(".shift_" + shift.id).remove()
        var s = ich.shift(shift);
        var pos = self.timeToOffset(shift.start);
        
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
            css['z-index'] = (top - 100).toFixed(2);
            var s = ich.shift(shift);

            s.css(css);

            s.addClass("column_" + shift.index + "of" + shift.columns);
            s.addClass("shift_" + shift.id);
            s.data('shift', shift);
            $("#calendar").append(s);
        }
    };

    self.timeToOffset = function(time)
    {
        /*
         * Converts Date object to x y coordinates
         */
        var s = time.valueOf() - self.start.valueOf();

        var day = Math.floor(s / self.aday);
        var time = s % self.aday;
        
        assert(time < self.aday);
        
        var x = (day / self.days * 100);
        var y = (time / self.aday * 100);

        return Array(x,y);
    }

    /**
     * Converts x y coordinates to a date object
     */
    this.offsetToTime = function(x,y)
    {
        // day = fixed 0 to 6
        var day = Math.floor(x / 100.0 * self.days);
        
        // time = decimal 0 to 1
        var time = y / 100.0;
        
        // add day and time and "scale" it to this.aday
        time = Math.round((day + time) * self.aday);
        
        // round to closest 15 min
        time = Math.round(time / 900000) * 900000;
        
        // add time of week start
        time += self.start.valueOf();
        
        time = new Date(time);
        time.setSeconds(0);
        return time;
    }

    this.setTime = function(start, stop)
    {
        if(stop == undefined)
            stop = new Date(start.valueOf() + self.stop.valueOf() - self.start.valueOf());
        
        self.start = start;//new Date('2012-08-27');// start;
        self.stop = stop;// new Date('2012-09-03');

        var duration = self.stop.valueOf() - self.start.valueOf();
        self.aday = 24 * 60 * 60 * 1000;

        self.days = (duration / this.aday).toFixed(0);
        self.last_update = false;
        self.weekgrid.setTime(start,stop);

        //this.fetch(false);
    }
    self.setTime(start, stop);
}


function WeekGrid(div, start, stop)
{
    this.div = div;
    this.start = start;
    this.stop = stop;
    this.days = (this.stop.valueOf() - this.start.valueOf()) / (24 * 3600 * 1000);


    this.setTime = function(start, stop)
    {
        this.start = start;
        this.stop = stop;
        this.refresh();
    }

    this.refresh = function()
    {
        $(".dayline").remove()
        for(var i = 0; i < this.days; i++)
        {
            var l = (i / this.days * 100).toFixed(3);
            var d = $("<div />");
            d.addClass("dayline");
            d.css('left', l + "%");

            var date = new Date(this.start).add(i).days();
            d.text(date.toString("d/M/yyyy"));

            $(this.div).append(d);
        }
    }
    makeHourGrid();
    makeHalfHourGrid();
}




function createShiftInCalendar(shift_type)
{

    var mousedown = false;

    var start = undefined;
    var stop;
    var duration = 60;

    var g = $("#calendar");

    var onmousemove = function(event){
      var x = event.pageX - $("#calendar").offset().left;
      var y = event.pageY - $("#calendar").offset().top;

      x = Math.round(x / $("#calendar").width() * 100);
      y = Math.round(y / $("#calendar").height() * 100);

      var time = datasource.output.offsetToTime(x, y);
      if(start == undefined)
        start = time;

      if(!mousedown)
      {
        start = time;
        stop = new Date(time).add(duration).minutes();
      }
      else
      {
        if(time <= start)
        {
          stop = new Date(start).add(duration).minutes();
          start = time;
          duration = Math.round((stop - start) / (60 * 1000));

        }
        else
        {
          stop = time;
          duration = Math.round((stop - start) / (60 * 1000));
        }
      }

      var shift = {id:'temporary', shift_type_id:shift_type.id, shift_type:shift_type};
      shift['start'] = start;
      shift['end'] = stop;

      datasource.output.addShift(shift);
      datasource.output.refresh();
      $(".shift_temporary").css('z-index', 999999);
      $(".shift_temporary a").click(function(){return false;});
    };
    var onmousedown = function(){mousedown=new Date().getTime();};
    var onmouseup = function(event){
        mousedown=false;

        if(event.shiftKey == false)
        {
          g.unbind('mousemove');
          g.unbind('mousedown');
          g.unbind('mouseup');
        }

      var shift = {id:'temporary', shift_type_id:shift_type.id};
      shift['start'] = start;
      shift['end'] = stop;
        $.post("/shifts.json", {shift:shift}, function(data)
          {

            datasource.output.addShift(data);
            datasource.output.removeShift("temporary");
            datasource.output.refresh();
            $(".shift_" + data.id).css('border', '1px solid red');
          });
      }
  g.unbind('mousemove');
  g.unbind('mousedown');
  g.unbind('mouseup');
    g.mousemove(onmousemove);
    g.mousedown(onmousedown);
    g.mouseup(onmouseup);
}