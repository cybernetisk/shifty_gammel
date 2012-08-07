$(document).ready(function() {
	
	$(".pickType").click(function(){
		var shift_type = $(this).attr("shift_type");
		if(shift_type=="0"){
			$('[class^="type_"]').show('fast');
		}else{
			$('[class^="type_"]').hide();
			$(".type_"+shift_type).show('fast');
		}
		
		$(".pickType").removeClass("picked");
		$(this).addClass("picked");

	});
	
	var availableDates;
	$.ajax({
		url: "/shifts/getAvailableDates",
		success: function(data){
			availableDates = data;
		},
		async: false,
		dataType: 'json'
	});
	
	var unavailableDates;
	$.ajax({
		url: "/shifts/getUnavailableDates",
		success: function(data){
			unavailableDates = data;
		},
		async: false,
		dataType: 'json'
	});
	
	$('div#calendar_start').datepicker({
        inline: true,
        firstDay: 1,
        showOtherMonths: true,
        dayNamesMin: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
		monthNames: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'],
		prevText: "Forrige",
		nextText: "Neste",
		dateFormat: "yy-mm-dd",
		beforeShowDay: highlightDays,
		onSelect: showDate
    });
	
	function showDate(dateText, inst){
		window.location.href = "/shifts/showForDate/"+dateText;
	}
	function highlightDays(date){
		for(i=0; i<availableDates.length; i++){
			var a = new Date(availableDates[i].start);
			if((date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate())==(a.getFullYear()+"-"+a.getMonth()+"-"+a.getDate())){
				return [true, 'red', "Ledige skift"];
			}
		}
		
		for(i=0; i<unavailableDates.length; i++){
			var a = new Date(unavailableDates[i].start);
			if((date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate())==(a.getFullYear()+"-"+a.getMonth()+"-"+a.getDate())){
				return [true, 'green', "Ingen ledige skift"];
			}
		}
		return [true, ''];					
	}
});
