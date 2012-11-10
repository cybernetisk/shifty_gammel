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



function DataSource(start, stop, source)
{
    var self = this;

    //self.uri = uri;
    self.start = start;
    self.stop = stop;
    self.filter = Array();
    self.query = undefined;
    self.cancelable = false;
    self._filter = {};

    if(source == undefined)
        source = '/shifts/calendar.json';
    self.source = source;

    self.setTime = function(start, stop)
    {
        self.start = start;
        self.stop = stop;

        self.output.setTime(start, stop);
        self.fetch(false);
    }

    self.fetch = function(cancelable)
    {
        if(cancelable == undefined)
            cancelable = true;

        var data = {start:getDate(self.start), stop:getDate(self.stop) };
        if(self.last_update)
            data['updated'] = self.last_update;
        
        if(self.query != undefined)
        {
            if(!self.cancelable)
                return;

            self.query.abort();
        }
        
        self.cancelable = cancelable;
        data['filter'] = self._filter;
        
        self.query = $.post(self.source,data,
            function(data)
            { 
                self.handleData(data);
                self.query = undefined;
            });
    }

    self.setOutput = function(output)
    {
        self.output = output;
        self.output.clear();
        self.output.handleData(self.data);
        self.output.refresh();
    }

    self.filter = function(filter, reset){

        if(reset == true)
            self._filter = {};

        self._filter = $.extend(self._filter, filter);
        self.last_update = false;
        //self.clear();
        //self.update();
        self.fetch();
    }
    
    self.handleData = function(data)
    {
        self.data = data;
        self.output.clear();
        self.output.handleData(data);
    }
}

function ListView(div, start, stop)
{
    var self = this;
    self.div = div;
    div.html("");
    self.table = $("<table />");
    self.table.attr('id', 'availableShifts');

    div.append(self.table);
    self.setTime = function(start, stop)
    {
        
    }

    self.clear = function(){

    }

    self.addHeaders = function()
    {
        var row = $("<tr>");

        function add(d){row.append($("<th>").append(d));}

        add('Dato');
        add('Ukedag');
        add('Fra');
        add('Til');
        add('Type');
        add('Status');

        self.table.append(row);
    }

    self.handleData = function(data)
    {
        self.table.children().remove();
        self.addHeaders();
        for(var i = 0; i < data.length; i++)
        {
            var r = data[i];

            var row = $("<tr>");
            function add(data){row.append($("<td>").html(data));}

            var start = new Date(r.start);
            var stop = new Date(r.end);

            add(start.toString("yyyy-MM-dd"));
            add("ukedag");
            add(start.toString("HH:mm"));
            add(stop.toString("HH:mm"));
            add(r.shift_type.title);

            if(r.user != undefined)
            {

                add(r.user.username);
            }
            else
            {
                add('<a href="#">Available</a>');
            }
            self.table.append(row);
        }

        if(data.length == 0)
        {
            var row = $("<tr>");
            row.append($("<td>").attr('colspan',6).html("Ingen skift funnet"));

            self.table.append(row);
        }
    }
}


function WeekPicker(div, start, end, datasource)
{

    var self = this;
    
    self.start = new Date(start.getTime());
    self.end = new Date(end.getTime());
    self.datasource = datasource;
    self.div = div;


    
    self.prevDay = function()
    {
        self.start.add(-1).days();
        self.end.add(-1).days();
        self.datasource.setTime(self.start, self.end);
        self.update();
    }
    
    self.nextDay = function()
    {
        self.start.add(1).days();
        self.end.add(1).days();
        self.datasource.setTime(self.start, self.end);
        self.update();
    }
    
    self.prevWeek = function()
    {
        self.start.add(-7).days();
        self.end.add(-7).days();
        self.datasource.setTime(self.start, self.end);
        self.update();
    }
    
    self.nextWeek = function()
    {
        self.start.add(7).days();
        self.end.add(7).days();
        self.datasource.setTime(self.start, self.end);
        self.update();
    }
    
    self.update = function()
    {
        var c = $("<div>");
        
        var m = self;
        
        function addLink(text, func)
        {
            var p = $('<a href="#">' + text + '</a>');
            p.click(func);
            c.append(p);
        }
        
        addLink('Previous week', function(){m.prevWeek();});
        addLink('Prev day', function(){m.prevDay();});
        c.append("<span>Uke " + self.start.getWeekOfYear() + "</span>")

        addLink('Next day', function(){m.nextDay();});
        addLink('Next week', function(){m.nextWeek();});
        
        $(self.div).html(c);
    }
    self.update();
}


function FilterList(con, label, name, options, ds, multiple)
{
    var self = this;

    self.ds = ds;
    self.options = options;
    self.name = name;

    self.element = $('<div />');
    self.element.addClass("picker")
    self.element.append("<h3>" + label + "</h3>");

    self.multiple = multiple;
    if(self.multiple == undefined) self.multiple = false;

    self.updateFilter = function(){
        var selected = Array();

        $(".option.selected", self.element).each(function(){
            selected.push($(this).data('id'));
        })
        var tmp = {};
        tmp[self.name] = selected;

        if( (selected.length > 0) != self.element.hasClass("selected") )
            self.element.toggleClass("selected");

        self.ds.filter(tmp);
    }

    self.element.data("FilterList", self);

    for(var i in options)
    {
        var tmp = $('<div />');
        tmp.addClass('option');
        tmp.html(options[i]);
        tmp.data('id', i);
        if(window.location.hash.indexOf(options[i]) != -1)
            tmp.addClass("selected");
        self.element.append(tmp)
    }

    //self.updateFilter();

    if(self.multiple)
        $(".option", self.element).click(function(){ $(this).toggleClass('selected'); self.updateFilter();});
    else
        $(".option", self.element).click(function(){ 
            $(this).parent().children(".selected").not(this).removeClass("selected");
            $(this).toggleClass('selected'); 
            self.updateFilter();
        });

    con.append(self.element)
}


$(document).ready(function() {
    if ($("#view_calendar").length == 0) return;
    
    // buttons for different views
    $("#calendar_view").click(function(){
        datasource.setOutput(new CalendarView($("#calendar"), datasource.start, datasource.stop));
    });
    $("#list_view").click(function(){
        datasource.setOutput(new ListView($("#calendar"), datasource.start, datasource.stop));
    });

    $("#template").click(function(){
        var d = $("<div>");

        d.css({top:$(this).offset().top, left:$(this).offset().left, position:'absolute', width:200, background:'white', border:'1px solid black', padding:20});
        $.get('/templates.json', function(data)
        {
            for(var i = 0; i < data.length; i++)
            {
                var c = data[i];
                var m = $("<a href=\"#\"></a>");
                m.html(c.title);
                m.css('display','block');
                d.append(m);
            }
            $(document.body).append(d);

        });

        d.mouseout(function(event){
            if(d[0] != event.toElement && d.has(event.toElement).length == 0)
                $(this).remove()
        });
    });


    // 
    (function($){
        $.fn.disableSelection = function() {
            return this
                     .attr('unselectable', 'on')
                     .css('user-select', 'none')
                     .on('selectstart', false);
        };
    })(jQuery);

    // create shift
    $("#create_shift").click(function(){
        var d = $("<div>");

        d.css({top:$(this).offset().top, left:$(this).offset().left, position:'absolute', width:200, background:'white', border:'1px solid black', padding:20});

        $.get('/shift_types.json', function(data)
        {

            function addShiftType(c)
            {
                var shift_type_id = c.id;
                var m = $("<a href=\"#\"></a>");
                m.html(data[i].title);
                m.css('display','block');

                m.click(function(){createShiftInCalendar(c)});
                d.append(m);
            }

            for(var i = 0; i < data.length; i++)
            {
                addShiftType(data[i]);
            }

            $(document.body).append(d);
        });


        d.mouseout(function(event){
            if(d[0] != event.toElement && d.has(event.toElement).length == 0)
                $(this).remove()
        });
    });




    $(".pickType").live('click', function(event)
    {
        var x = $(".pickType.picked")
        var id = x.attr('shift_type');
        cv.filter({'shift_type':id});
    });

    function resized(event, ui)
    {
        var e = $(this);
        
        var s = e.data('shift');

        if(ui.position.top != ui.originalPosition.top)
        {
            var rx = ui.position.left / $("#calendar").width() * 100;
            var ry = ui.position.top / $("#calendar").height() * 100;
            var t = cv.offsetToTime(rx, ry);
        
            s.start = t;
        }
        else
        {
            var rx = ui.position.left / $("#calendar").width() * 100;
            var ry = (ui.position.top + ui.size.height) / $("#calendar").height() * 100;
            var t = cv.offsetToTime(rx, ry);
            s.end = t;
        }

        cv.refresh();
        makeEditable()
        changed(s)
    }

    function moved(event, ui)
    {
        var e = $(this);
        var s = e.data('shift');

        var t = cv.offsetToTime(ui.position.left    / $("#calendar").width() * 100, ui.position.top / $("#calendar").height() * 100);
        
        var diff = t.valueOf() - s.start.valueOf();


        s.start = new Date(s.start.valueOf() + diff);
        s.end = new Date(s.end.valueOf() + diff);

        cv.refresh();
        makeEditable()
        changed(s);
    }

    function changed(shift)
    {
        var start = getISODateTime(shift.start);
        var end = getISODateTime(shift.end);
        $.post('/shifts/' + shift.id +".json" , {'_method':'put', 'shift[start]':start, 'shift[end]':end}, function(e){

        });
    }

    function makeEditable()
    {
        
        $(".shift").not(".ui-draggable").draggable(
                {
                grid: [100/7, 1000/24/4],
                stop: moved
                });

        $(".shift").not(".ui-resizable").resizable(
            {
                handles: "n, s",
                grid: [10, 1000/24/4],
                stop: resized
             });

    }

    var cv = false;
    var datasource = undefined;
    $(function(){
        var s = new Date();
        s.setHours(0);

        s = new Date().moveToDayOfWeek(1, -1);
        s.setHours(0)

        var e = new Date(s.getTime()).add(7).days();

        datasource = new DataSource(s, e);

        if(window.innerWidth <= 800)
        {
            datasource.output = new ListView($("#calendar"), s, e);
        }
        else
            datasource.output = new CalendarView($("#calendar"), s, e);

        new WeekPicker($("#picker"), s, e, datasource);
        datasource.fetch();

        makeEditable();
        
        new FilterList($("#filters"), "Shift types", "shift_type", shifttypes, datasource, true);
        new FilterList($("#filters"), "Taken", "taken", {0:'Taken', 1:'Available'}, datasource);
        
        if (user.id) {
            var list = {};
            list[user.id] = user.username;
            new FilterList($("#filters"), "User", "user_id", list, datasource);
        }

        $("#show_filter").click(function(e)
        {
                $("#filters").toggleClass('hidden');
            if($("#filters").hasClass("hidden"))
                $(this).text("+");
            else
                $(this).text("-");
        });

        $("#filter_search").keyup(function(e)
        {
            var value = this.value.trim();
            value = value.split(/\s+/);
            var filter = Array()
            var username = Array();

            for(var i = 0; i < value.length; i++) 
            {
                if(Date.parse(value[i]))
                {
                    cv.setTime(Date.parse(value[i]));
                }
                else if(value[i] != "")
                    filter.push( value[i] + ".*");
            }

            $(".selected").removeClass("selected");
            
            if(filter.length > 0)
            {
                filter = new RegExp("(^" + filter.join("|^") + ")", "i");

                var e = function(){
                    if(this.innerText.match(filter))
                    {
                        $(this).addClass("selected");
                        }
                }
                $(".option").each(e);
            }
            $(".picker").each(function(){
                $(this).data("FilterList").updateFilter();
            });
        });

        $("#calendar").mousedown(function(e){
            p = e.srcElement;
            while(p != this && !$(p).hasClass("shift"))
                p = p.parentNode;
            if(p != this) return;
            e.preventDefault();
            return 1;
        });

        //window.setInterval(function(){cv.update();makeEditable()}, 5000);
    });

});