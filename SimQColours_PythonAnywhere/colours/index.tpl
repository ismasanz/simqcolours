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


</head>
<body>

<div class="container">
<h1 id="mainHeader">{{ _("Name the Colour") }}</h1>

<div id="feedback"></div>

<form name="input" action="/colours/submit" method="get">

% if visit_count <= 1:
    <input type="hidden" name="initSession" value="1" />
    % include("colours/init_session.tpl")
% else:
    <input type="hidden" name="initSession" value="0" />
    % include("colours/get_colour.tpl")
% end

<p>
<button class="button-primary" type="submit" name="submit" value="submit">{{ _("Submit") }}</button><br>
<span id="finishMsg">
{{ _("To finish the experiment, simply close the browser window.") }}
</span>
</form>
</div>
</body>
</html>
