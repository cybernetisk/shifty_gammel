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

});
