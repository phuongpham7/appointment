(function(){

	var url = "http://localhost:8090";

	getAppointments();
	validateDate();

	$("input.appt-date").datepicker({ dateFormat: 'mm/dd/yy' });
	$("input.appt-time").timepicker({ 'timeFormat': 'h:i A', step:1 });

	$(".search-button button").click(function(){
		getAppointments();
	});

	$("button.button-new").click(function(){
		var text = $(this).text();
		if(text == "New")
		{
			$("input[name='dateField']").attr("style","");
			$("input[name='dateField']").val("");
			$("input[name='timeField']").attr("style","");
			$("input[name='timeField']").val("");
			$("textarea[name='description']").attr("style","");
			$("textarea[name='description']").val("");
			$(this).text("Add");
			$("button.button-cancel").slideDown();
			$("form.appt-form").slideDown();
		}
		else
		{
			if(isFormValid()){
				$.get({
					url:url + '/add/',
					method:"POST",
					data:{date:$("input[name='date']").val(), description:$("textarea[name='description']").val()},
					success:function(data){
						buildApptTable(data);
					},
					error:function(data){
						console.log(data);
						alert('There is problem in retrieving data.');
					}
				});
			}
		}		
	});
	$("button.button-cancel").click(function(){
		$(this).slideUp();
		$("button.button-new").text("New");
		$("form.appt-form").slideUp();
	})
	$("input.appt-time").change(function(){
		var dateValue = $("input.appt-date").val();
		dateValue += " " + $(this).val();
		$(this).attr("style","");
		var d = new Date(dateValue);
		$("input[name='date']").val(d.toISOString());
	});
	
	$('body').on('click', '#delete', function() {
		var id = $(this).parent().find("input[type='hidden']").val();
		$.get({
			url:url + '/delete/:' + id,
			method:"DELETE",
			success:function(data){
				buildApptTable(data);
			},
			error:function(data){
				console.log(data);
				alert('There is problem in retrieving data.');
			}
		});
	});

	var dateIsValid = false;
	isFormValid = function()
	{
		var valid = true;
		if(!dateIsValid)
		{
			valid = false;
			$("input[name='dateField']").attr("style","border:1px solid red;");
		}
		if($("input[name='timeField']").val() == "")
		{
			$("input[name='timeField']").attr("style","border:1px solid red;");
			valid = false;
		}
		else
		{
			$("input[name='timeField']").attr("style","");
		}
		if($("textarea[name='description']").val() == "")
		{
			$("textarea[name='description']").attr("style","border:1px solid red;");
			valid = false;
		}
		else
		{
			$("textarea[name='description']").attr("style","");
		}
		return valid;
	};
	
	buildApptTable = function(rows){
		var table=$("<table>");
		var header = $("<thead>");
		header.append("<tr><th>Date</th><th>Time</th><th>Description</th><th></th></tr>");
		table.append(header);
		var table_body = $("<tbody>");
		$.each(rows,function(index,row){
			var tr = $("<tr>");
			var date = new Date(row.Date);
			tr.append("<td>"+getDate(date.toDateString())+"</td>");
			tr.append("<td>"+getTime(date.toTimeString())+"</td>");
			tr.append("<td>"+row.Description+"</td>");
			tr.append("<td>"+'<a href="#" id="delete">Delete</a><input type="hidden" value="' + row.Id + '"/>'+"</td>");
			table_body.append(tr);
		});
		table.append(table_body);
		$("table.tblAppt").html(table.html());
	}
	getDate = function(dateStr)
	{
		var date = dateStr.split(" ");
		return date[1] + ' ' + date[2] + ' ' + date[3];
	};
	getTime = function(dateStr)
	{
		var date = dateStr.split(" ");
		var time = date[0];
		time     = time.split(":");
		var isAmOrPm = time[0] >= 12 ? "PM":"AM";
		var hour = time[0] == 0?12:time[0]==12?12:time[0]%12;
		hour 	 = parseInt(hour) < 10 ? "0" + hour:hour;
		return hour + ":" + time[1] + " " + isAmOrPm;
	};
	getAppointments = function(){
		$.get({
			url: url + "/appt/:" + $("input[name='search']").val(),
			method:"GET",
			success:function(data){
				buildApptTable(data);
			},
			error:function(data){
				console.log(data);
				alert('There is problem in retrieving data.');
			}
		});
	}
	validateDate = function(){
		var datePattern = /^(0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-]\d{4}$/;
		$("input.appt-date").on("change",function() {			
			var dateValue = $(this).val();
			var match = dateValue.match(datePattern);
			if(match != null)
			{
				$(this).val(match[0]);
				$(this).attr("style","");
				dateIsValid = true;
			}
			else
			{
				$(this).val("");
				$(this).attr("style","border:1px solid red;");
				alert('Incorrect date format');
				dateIsValid = false;
			}
			
		});
	}
})();