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
    self.last_update = 0;

    if(source == undefined)
        source = '/shifts_calendar.json';
    self.source = source;

    self.setTime = function(start, stop)
    {
        if(stop != undefined)
        {
            self.start = start;
            self.stop = stop;
        }
        else
        {
            var duration = self.stop - self.start;
            self.start = start;
            self.stop = stop = start + duration;
        }
        if(self.output != undefined)
            self.output.setTime(start, stop);
        self.fetch(false);
    }

    self.fetch = function(cancelable)
    {
        if(cancelable == undefined)
            cancelable = true;

        var data = {start:getDate(self.start), stop:getDate(self.stop), duration:7};
        if(self.last_update)
            data['updated'] = self.last_update;
        
        if(self.query != undefined)
        {
            if(!self.cancelable)
                return;

            self.query.abort();
        }
        
        self.cancelable = cancelable;
        data = $.extend(data, self._filter);
        
        self.query = $.post(self.source,data,
            function(data)
            { 
                self.handleData(data);
                self.query = undefined;
            });
    }
    
    self.refresh = function()
    {
        self.output.clear();
        self.output.refresh();
    }

    self.setOutput = function(output)
    {
        self.output = output;
        self.output.clear();
        if (self.data) self.output.handleData(self.data);
        self.output.refresh();
    }

    self.filter = function(filter, reset){

        if(reset == true)
            self._filter = {};

        self._filter = $.extend(self._filter, filter);
        self.last_update = false;

        query = "";
        query += "start=" + encodeURIComponent(getISODateTime(self.start));
        query += "&stop=" + encodeURIComponent(getISODateTime(self.stop));
        for(var k in self._filter)
        {
            for(var i = 0; i < self._filter[k].length; i++)
            {
                if(query)
                    query += "&";
                query += encodeURIComponent(k) + "=" + encodeURIComponent(self._filter[k][i]);
            }
        }
        console.log(query);

        //self.clear();
        //self.update();
        self.fetch();
    }
    
    self.handleData = function(data)
    {
        self.data = data;
        if(self.output != undefined)
        {
            self.output.clear();
            self.output.handleData(data);
        }
        else
        {
            console.warn("Output not defined");
        }
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
        add('Template');
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
            if(r.template != undefined)
                add(r.template.template.title);
            else
                add("");

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
    };

    self.refresh = $.noop;
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
    self.element.attr('id', 'picker_' + name)
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
        tmp.addClass('option_' + i);
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




var cv = false;
var datasource = undefined;

// code for calendar-page only
$(document).ready(function() {
    if ($("#view_calendar").length == 0) return;

    $("#template").click(function(){
        var d = $("<div>");

        d.css({top:$(this).offset().top, left:$(this).offset().left, position:'absolute', width:200, background:'white', border:'1px solid black', padding:20});
        $.get('/templates.json', function(data)
        {
            for(var i = 0; i < data.length; i++)
            {
                var c = data[i];
                var m = $("<a />");
                var id = c.id;

                m.click(function(){
                    $.get(this.href, function(){
                        datasource.fetch();
                    });
                    d.remove();

                    return false;
                });

                m.html(c.title);
                m.css('display','block');
                m.attr('href', "/templates/" + id + "/apply/" + getDate(datasource.start));
                d.append(m);
            }
            $(document.body).append(d);

        });

        d.mouseout(function(event){
            if(d[0] != event.relatedTarget && d.has(event.relatedTarget).length == 0)
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
            if(d[0] != event.relatedTarget && d.has(event.relatedTarget).length == 0)
                $(this).remove()
        });
    });

    $("#edit_shift").click(function(){
        var tmp = new CalendarEditor(datasource.output);
        tmp.makeEditable();


    var onmousemove = function(event){
        var calendar_div = $("#calendar");
      var x = event.pageX - calendar_div.offset().left;
      var y = event.pageY - calendar_div.offset().top;

      x = x / calendar_div.width() * 100;
      y = y / calendar_div.height() * 100;

      console.log(x + "," + y + "-"+ datasource.output.offsetToTime(x,y));
  };
  $("#calendar").mousemove(onmousemove);
    });


    $(".pickType").live('click', function(event)
    {
        var x = $(".pickType.picked")
        var id = x.attr('shift_type');
        cv.filter({'shift_type':id});
    });

    $(function(){
        s = new Date().moveToDayOfWeek(1, -1);
        s.setHours(0)
        s.setMinutes(0);

        var e = new Date(s.getTime()).add(7).days();

        datasource = new DataSource(s, e);

        function getView() {
            // we first try the address path, then we fall back to url-testing
            var view = $.address.value();
            console.log(view);

            console.log(document.location.href);
            return [];
        }

        // take care of switching between calendar and list with history tracking
        (function() {
            var History = window.History, last_view, root = root_path+"shifts";

            function getView() {
                return History.getState().hash.substring(root.length+1);
            }

            function showView(view) {
                if (view == last_view) return;

                switch (view) {
                    case "calendar":
                        datasource.setOutput(new CalendarView($("#calendar"), datasource.start, datasource.stop));
                        break;

                    case "list":
                        datasource.setOutput(new ListView($("#calendar"), datasource.start, datasource.stop));
                        break;

                    default:
                        alert("Unknown view: "+view);
                        return;
                }

                last_view = view;

                // we have normally not loaded data yet
                if (!datasource.query) datasource.fetch();
            }

            $(window).bind("statechange", function() {
                showView(getView());
            });

            // put actions on buttons
            $("#calendar_view,#list_view").click(function(e) {
                if (e.shiftKey || e.ctrlKey || e.metaKey) return true; // we don't want to abort opening links in new page, for example
                History.pushState(null, null, this.href);
                event.preventDefault();
            });

            showView(getView());
        })();

        new WeekPicker($("#picker"), s, e, datasource);
        //datasource.fetch();

        
        new FilterList($("#filters"), "Shift types", "shift_type", shifttypes, datasource, true);
        new FilterList($("#filters"), "Taken", "taken", {0:'Taken', 1:'Available'}, datasource);
        new FilterList($("#filters"), "Templates", "template", templates, datasource, true);

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
                /*if(Date.parse(value[i]))
                {
                    cv.setTime(Date.parse(value[i]));
                }
                else if(value[i] != "")*/
                    filter.push( value[i] + ".*");
            }

            $(".selected").removeClass("selected");
            
            if(filter.length > 0)
            {
                filter = new RegExp("(^" + filter.join("|^") + ")", "i");

                var reg_matches = Array();
                var exact_matches = Array();

                var e = function(){
                    if(value.indexOf(this.innerText) != -1)
                    {
                        exact_matches.push(this);
                    }
                    if(this.innerText.match(filter))
                    {
                        reg_matches.push(this);//$(this).addClass("selected");
                    }
                }

                $(".option").each(e);
/*
                if(exact_matches.length > 0)
                {
                    $(exact_matches).addClass('selected');
                }
                else
                {*/
                    $(reg_matches).addClass('selected');
                //}
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
/*
        $(".shift_link").live('click', function(){
            var iframe = $('<iframe />');
            iframe.attr('src', this.href);
            iframe.dialog({modal:true});
            return false;
        });*/
    });

});
