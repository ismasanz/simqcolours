<script>
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function show_message(msg) {
	msg = msg.replace("{cnt}", {{visit_count}});
	$('<div class="feedback">' + msg + '</div>').insertBefore("#feedback").delay(3000).fadeOut(function() { this.remove(); });
}

function do_feedback(visit_count) {
	if (visit_count == 1) {
		show_message('{{ _("You named your first colour! Remember that you can submit as many colours as you want") }}');
	}
	else if (visit_count % 5 == 0) {
		show_message('{{ _("You already named {cnt} colours! Great!") }}');
	}
}

$( document ).ready(function() {
	visit_count = {{visit_count}};
	do_feedback(visit_count);
	
	var r = Math.round(Math.random() * 256); 
	var g, b;
	if (visit_count % 6 == 0) {
		g = r;
		b = r;
	}
	else {
		g = Math.round(Math.random() * 256); 
		b = Math.round(Math.random() * 256);
	}
	$("#red").val(r);
	$("#green").val(g);
	$("#blue").val(b);
	var htmlColour = rgbToHex(r, g, b); //"#" + r.toString(16) + g.toString(16) + b.toString(16);
	$("#box").css('background-color', htmlColour);
	
});
</script>

<p>{{ _("A coloured box appears below. please determine first which name fits this colour best, and then choose an adjective for the colour.") }} </p>
<p lang="es"></p>

<input type="number" id="red" name="red" hidden="true"></input>
<input type="number" id="blue" name="blue" hidden="true"></input>
<input type="number" id="green" name="green" hidden="true"></input>

<div id="box" style="width:200px;height:200px;"></div>

<p>
<label for="name">{{ _("Select colour name") }}</label>
<select class="u-full-width" id="name" name="name">
<option value="black">{{ _("Black") }}</option>
<option  value="grey">{{ _("Grey") }}</option>
<option value="white">{{ _("White") }}</option>
<option  value="red">{{ _("Red") }}</option>
<option  value="orange">{{ _("Orange") }}</option>
<option  value="yellow">{{ _("Yellow") }}o</option>
<option  value="green">{{ _("Green") }}</option>
<option  value="turquoise">{{ _("Turquoise") }}</option>
<option  value="blue">{{ _("Blue") }}</option>
<option  value="purple">{{ _("Purple") }}</option>
<option  value="pink">{{ _("Pink") }}</option>
</select>
</p>

<p>
<label for="adjetivo">{{ _("Select the adjective for the colour") }}</label>
<select  class="u-full-width" id="adjetivo" name="adjetivo">
<option value="none">{{ _("None") }}</option>
<option value="dark">{{ _("Dark") }}</option>
<option value="light">{{ _("Light") }}</option>
<option value="pale">{{ _("Pale") }}</option>
</select>
</p>

<p>
<label for="confidenceTable">{{ _("Please rate the confidence you have in your answer") }}</label>
<table style="text-align:center;" id="confidenceTable">
<tr style="font-style: italic;"><th>{{ _("Not at all confident") }}</th><th colspan="3" /> <th>{{ _("Extremely Confident") }}</th></tr>
<tr><th style="min-width:50px">1</th><th style="min-width:50px">2</th><th style="min-width:50px">3</th><th style="min-width:50px">4</th><th style="min-width:50px">5</th></tr>
<tr><td><input type="radio" name="confidence" value="1"/></td>
    <td><input type="radio" name="confidence" value="2"/></td>
    <td><input type="radio" name="confidence" value="3"/></td>
    <td><input type="radio" name="confidence" value="4"/></td>
    <td><input type="radio" name="confidence" value="5"/></td>
    </tr>
</table>
</p>
