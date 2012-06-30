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
	
	    $('div#calendar_start').datepicker({
	        inline: true,
	        firstDay: 1,
	        showOtherMonths: true,
	        dayNamesMin: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
			monthNames: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'],
			prevText: "Forrige",
			nextText: "Neste"
	    });


});
