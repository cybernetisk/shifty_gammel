function assert(value, str)
{
    if(!value)
    throw "Assert failed";
}

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


function DataSource(uri, start, stop)
{
    this.uri = uri;
    this.start = start;
    this.stop = stop;
    
    this.fetch = function()
    {
        if(cancelable == undefined) cancelable = true;
        var data = {start:getDate(this.start), stop:getDate(this.stop) };
        if(this.last_update)
            data['updated'] = this.last_update;
        
        var cv = this;
        if(this.query != undefined)
        {
            if(!this.cancelable)
                return;
            this.query.abort();
        }
        
        this.cancelable = cancelable;
        
        
        this.query = $.post('/shifts/calendar.json',data,
        
        function(data)
        { 
            cv.handleData(data);
        });
    }
    
    this.handleData(data)
    {
        
    }
}


function CalendarView(div, start, stop)
{
    /*
     * This class handles fetching calendar info, feeding the shift manager for layout
     * and rendering the shifts.
     */
    this.div = div;
    
    this.shiftManager = new ShiftManager();
    this.shifts = {};
    this.weekgrid = new WeekGrid(div, start, stop);
    
    this.refresh = function()
    {
        this.shiftManager = new ShiftManager();
        
        for(var i in this.shifts)
            this.shiftManager.addShift(this.shifts[i]);

        this.render();
        this.weekgrid.refresh();
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
    
    this._filter = {};
    
    this.fetch = function(cancelable)
    {
        if(cancelable == undefined) cancelable = true;
        var data = {start:getDate(this.start), stop:getDate(this.stop) };
        if(this.last_update)
            data['updated'] = this.last_update;
        
        data['filter'] = this._filter;

        var cv = this;
        if(this.query != undefined)
        {
            if(!this.cancelable)
                return;
            this.query.abort();
        }
        
        this.cancelable = cancelable;
        
        
        this.query = $.post('/shifts/calendar.json',data,
        
            function(data)
            { 
                cv.handleData(data);
            });
    };

    this.filter = function(filter, reset)
    {
        if(reset == true)
            this._filter = {};

        this._filter = $.extend(this._filter, filter);
        this.last_update = false;
        this.clear();
        this.update();
    }

    this.clear = function(){
        this.shifts = {};
        $(".shift").remove();
    }

    this.handleData = function(data)
    {
        for(var i in data)
        {
            var shift = data[i];

            if(this.last_update == false || shift.updated_at > this.last_update)
                this.last_update = shift.updated_at;

            shift.start = new Date(shift.start);
            shift.end = new Date(shift.end);
            this.shifts[shift.id] = shift;
        }

        if(data.length > 0)
            this.refresh();
        
        this.query = undefined;
    }
    


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
            css['z-index'] = (top - 100).toFixed(2);
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
        /*
         * Converts Date object to x y coordinates
         */
        var s = time.valueOf() - this.start.valueOf();

        var day = Math.floor(s / this.aday);
        var time = s % this.aday;
        
        assert(time < this.aday);
        
        var x = (day / this.days * 100);
        var y = (time / this.aday * 100);

        return Array(x,y);
    }

    this.offsetToTime = function(x,y)
    {
        /*
         * Converts x y coordinates to a date object
         */
        var day = Math.floor(x / 100.0 * this.days);

        var time = Math.round(y / 100.0 * 900) / 900;
        
        time = day + time;
        
        time = Math.round(time * this.aday);
        time += this.start.valueOf();

        time = new Date(time);
        time.setSeconds(0);
        return time;
    }

    this.makeDayGrid = function ()
    {
        for(var i = 0.0; i < this.days; i++)
        {
        }
    }

    this.setTime = function(start, stop)
    {
        if(stop == undefined)
            stop = new Date(start.valueOf() + this.stop.valueOf() - this.start.valueOf());
        
        this.start = start;//new Date('2012-08-27');// start;
        this.stop = stop;// new Date('2012-09-03');

        var duration = this.stop.valueOf() - this.start.valueOf();
        this.aday = 24 * 60 * 60 * 1000;

        this.days = (duration / this.aday).toFixed(0);
        this.last_update = false;
        
        this.fetch(false);
    }
    this.setTime(start, stop);


}


function WeekGrid(div, start, stop)
{
    this.div = div;
    this.start = start;
    this.stop = stop;
    this.days = (this.stop.valueOf() - this.start.valueOf()) / (24 * 3600 * 1000);

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
}


function WeekPicker(div, start, end, cv)
{

    this.start = start;
    this.end = end;
    this.cv = cv;
    this.div = div;
    
    this.prevDay = function()
    {
        this.start.add(-1).days();
        this.end.add(-1).days();
        this.cv.setTime(this.start, this.end);
        this.update();
    }
    
    this.nextDay = function()
    {
        this.start.add(1).days();
        this.end.add(1).days();
        this.cv.setTime(this.start, this.end);
        this.update();
    }
    
    this.prevWeek = function()
    {
        this.start.add(-7).days();
        this.end.add(-7).days();
        this.cv.setTime(this.start, this.end);
        this.update();
    }
    
    this.nextWeek = function()
    {
        this.start.add(7).days();
        this.end.add(7).days();
        this.cv.setTime(this.start, this.end);
        this.update();
    }
    
    this.update = function()
    {
        var c = $("<div>");
        
        var m = this;
        
        function addLink(text, func)
        {
            var p = $('<a href="#">' + text + '</a>');
            p.click(func);
            c.append(p);
        }
        
        addLink('Previous week', function(){m.prevWeek();});
        addLink('Prev day', function(){m.prevDay();});
        addLink('Next day', function(){m.nextDay();});
        addLink('Next week', function(){m.nextWeek();});
        
        $(this.div).html(c);
    }
    this.update();
}

function FilterList(con, label, name, options, cv, multiple)
{
    this.cv = cv;
    this.options = options;
    this.name = name;

    this.element = $('<div />');
    this.element.addClass("picker")
    this.element.append("<h3>" + label + "</h3>");

    this.multiple = multiple;
    if(this.multiple == undefined) this.multiple = false;

    var a = this;
    var updateCV = function(){
        var selected = Array();

        $(".option.selected", a.element).each(function(){
            selected.push($(this).data('id'));
        })
        var tmp = {};
        tmp[a.name] = selected;

        if( (selected.length > 0) != a.element.hasClass("selected") )
            a.element.toggleClass("selected");

        cv.filter(tmp);
    }
    this.updateCV = updateCV;

    this.element.data("FilterList", this);

    for(var i in options)
    {
        var tmp = $('<div />');
        tmp.addClass('option');
        tmp.html(options[i]);
        tmp.data('id', i);
        if(window.location.hash.indexOf(options[i]) != -1)
            tmp.addClass("selected");
        this.element.append(tmp)
    }

    updateCV();

    if(this.multiple)
        $(".option", this.element).click(function(){ $(this).toggleClass('selected'); updateCV();});
    else
        $(".option", this.element).click(function(){ 
            $(this).parent().children(".selected").not(this).removeClass("selected");
            $(this).toggleClass('selected'); 
            updateCV();
        });

    con.append(this.element)
}