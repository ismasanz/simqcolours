<!DOCTYPE html>
<!--[if lt IE 7 ]><html class="ie ie6" lang="en"> <![endif]-->
<!--[if IE 7 ]><html class="ie ie7" lang="en"> <![endif]-->
<!--[if IE 8 ]><html class="ie ie8" lang="en"> <![endif]-->
<!--[if (gte IE 9)|!(IE)]><!--><html lang="en"> <!--<![endif]-->
<head>
<meta charset="ISO-8859-1">
<title>{{ _("Name the Colour") }}</title>
	<!-- Mobile Specific Metas
  ================================================== -->
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

	<!-- CSS
  ================================================== -->
	<link rel="stylesheet" href="stylesheets/base.css">
	<link rel="stylesheet" href="stylesheets/skeleton.css">
	<link rel="stylesheet" href="stylesheets/layout.css">
	<link rel="stylesheet" href="style.css">

	<!--[if lt IE 9]>
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->

	<!-- Favicons
	================================================== -->
	<link rel="shortcut icon" href="images/favicon.ico">
	<link rel="apple-touch-icon" href="images/apple-touch-icon.png">
	<link rel="apple-touch-icon" sizes="72x72" href="images/apple-touch-icon-72x72.png">
	<link rel="apple-touch-icon" sizes="114x114" href="images/apple-touch-icon-114x114.png">

<script src="js/jquery-1.11.1.min.js"></script>
<script>
known_colours = {
		  'aliceblue': "#F0F8FF",
		  'antiquewhite': "#FAEBD7",
		  'aqua': "#00FFFF",
		  'aquamarine': "#7FFFD4",
		  'azure': "#F0FFFF",
		  'beige': "#F5F5DC",
		  'bisque': "#FFE4C4",
		  'black': "#000000",
		  'blanchedalmond': "#FFEBCD",
		  'blue': "#0000FF",
		  'blueviolet': "#8A2BE2",
		  'brown': "#A52A2A",
		  'burlywood': "#DEB887",
		  'cadetblue': "#5F9EA0",
		  'chartreuse': "#7FFF00",
		  'chocolate': "#D2691E",
		  'coral': "#FF7F50",
		  'cornflowerblue': "#6495ED",
		  'cornsilk': "#FFF8DC",
		  'crimson': "#DC143C",
		  'cyan': "#00FFFF",
		  'darkblue': "#00008B",
		  'darkcyan': "#008B8B",
		  'darkgoldenr0d': "#B8860B",
		  'darkgray': "#A9A9A9",
		  'darkgreen': "#006400",
		  'darkkhaki': "#BDB76B",
		  'darkmagenta': "#8B008B",
		  'darkolivegreen': "#556B2F",
		  'darkorange': "#FF8C00",
		  'darkorchid': "#9932CC",
		  'darkred': "#8B0000",
		  'darksalmon': "#E9967A",
		  'darkseagreen': "#8FBC8F",
		  'darkslateblue': "#483D8B",
		  'darkslategray': "#2F4F4F",
		  'darkturquoise': "#00CED1",
		  'darkviolet': "#9400D3",
		  'deeppink': "#FF1493",
		  'deepskyblue': "#00BFFF",
		  'dimgray': "#696969",
		  'dodgerblue': "#1E90FF",
		  'firebrick': "#B22222",
		  'floralwhite': "#FFFAF0",
		  'forestgreen': "#228B22",
		  'fuchsia': "#FF00FF",
		  'gainsboro': "#DCDCDC",
		  'ghostwhite': "#F8F8FF",
		  'gold': "#FFD700",
		  'goldenrod': "#DAA520",
		  'gray': "#808080",
		  'green': "#008000",
		  'greenyellow': "#ADFF2F",
		  'honeydew': "#F0FFF0",
		  'hotpink': "#FF69B4",
		  'indianred': "#CD5C5C",
		  'indigo': "#4B0082",
		  'ivory': "#FFFFF0",
		  'khaki': "#F0E68C",
		  'lavender': "#E6E6FA",
		  'lavenderblush': "#FFF0F5",
		  'lawngreen': "#7CFC00",
		  'lemonchiffon': "#FFFACD",
		  'lightblue': "#ADD8E6",
		  'lightcoral': "#F08080",
		  'lightcyan': "#E0FFFF",
		  'lightgoldenrodyellow': "#FAFAD2",
		  'lightgreen': "#90EE90",
		  'lightgrey': "#D3D3D3",
		  'lightpink': "#FFB6C1",
		  'lightsalmon': "#FFA07A",
		  'lightseagreen': "#20B2AA",
		  'lightskyblue': "#87CEFA",
		  'lightslategray': "#778899",
		  'lightsteelblue': "#B0C4DE",
		  'lightyellow': "#FFFFE0",
		  'lime': "#00FF00",
		  'limegreen': "#32CD32",
		  'linen': "#FAF0E6",
		  'magenta': "#FF00FF",
		  'maroon': "#800000",
		  'mediumaquamarine': "#66CDAA",
		  'mediumblue': "#0000CD",
		  'mediumorchid': "#BA55D3",
		  'mediumpurple': "#9370DB",
		  'mediumseagreen': "#3CB371",
		  'mediumslateblue': "#7B68EE",
		  'mediumspringgreen': "#00FA9A",
		  'mediumturquoise': "#48D1CC",
		  'mediumvioletred': "#C71585",
		  'midnightblue': "#191970",
		  'mintcream': "#F5FFFA",
		  'mistyrose': "#FFE4E1",
		  'moccasin': "#FFE4B5",
		  'navajowhite': "#FFDEAD",
		  'navy': "#000080",
		  'oldlace': "#FDF5E6",
		  'olive': "#808000",
		  'olivedrab': "#6B8E23",
		  'orange': "#FFA500",
		  'orangered': "#FF4500",
		  'orchid': "#DA70D6",
		  'palegoldenrod': "#EEE8AA",
		  'palegreen': "#98FB98",
		  'paleturquoise': "#AFEEEE",
		  'palevioletred': "#DB7093",
		  'papayawhip': "#FFEFD5",
		  'peachpuff': "#FFDAB9",
		  'peru': "#CD853F",
		  'pink': "#FFC0CB",
		  'plum': "#DDA0DD",
		  'powderblue': "#B0E0E6",
		  'purple': "#800080",
		  'red': "#FF0000",
		  'rosybrown': "#BC8F8F",
		  'royalblue': "#4169E1",
		  'saddlebrown': "#8B4513",
		  'salmon': "#FA8072",
		  'sandybrown': "#F4A460",
		  'seagreen': "#2E8B57",
		  'seashell': "#FFF5EE",
		  'sienna': "#A0522D",
		  'silver': "#C0C0C0",
		  'skyblue': "#87CEEB",
		  'slateblue': "#6A5ACD",
		  'slategray': "#708090",
		  'snow': "#FFFAFA",
		  'springgreen': "#00FF7F",
		  'steelblue': "#4682B4",
		  'tan': "#D2B48C",
		  'teal': "#008080",
		  'thistle': "#D8BFD8",
		  'tomato': "#FF6347",
		  'turquoise': "#40E0D0",
		  'violet': "#EE82EE",
		  'wheat': "#F5DEB3",
		  'white': "#FFFFFF",
		  'whitesmoke': "#F5F5F5",
		  'yellow': "#FFFF00",
		  'yellowgreen': "#9ACD32"
		  };
		  
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

$( document ).ready(function() {
	visit_count = {{visit_count}};
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
</head>
<body>

<h1>{{ _("Name the Colour") }}</h1>
<p>{{ _("A coloured box appears below. please determine first which name fits this colour best, and then choose an adjective for the colour.") }} </p>
<p lang="es"></p>

<form name="input" action="/colours/submit" method="get">

<input type="number" id="red" name="red" hidden="true"></input>
<input type="number" id="blue" name="blue" hidden="true"></input>
<input type="number" id="green" name="green" hidden="true"></input>

<div id="box" style="width:200px;height:200px;"></div>

<p></p>

<p>
<strong>{{ _("Select colour name") }}</strong>
<select name="name">
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
<strong>{{ _("Select the adjective for the colour") }}</strong>

<select name="adjetivo">
<option value="none">{{ _("None") }}</option>
<option value="dark">{{ _("Dark") }}</option>
<option value="light">{{ _("Light") }}</option>
<option value="pale">{{ _("Pale") }}</option>
</select>
</p>
<p>
<strong>{{ _("Please rate the confidence you have in your answer") }}</strong>
<table style="text-align:center;">
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
<p>
<button type="submit" name="submit" value="submit">Submit / Enviar</button>
</p>
</form>
</body>
</html>
