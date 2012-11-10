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