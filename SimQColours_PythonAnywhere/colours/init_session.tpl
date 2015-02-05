<h2>{{ _("Welcome") }}</h2>

<div id="userdata">
<p>{{ _("Thanks for your collaboration in this experiment. Before you begin, please fill in the following data about you") }}</p>
<p>{{ _("Remember that you may contribute as many responses as you want") }}</p>
 <label for="sex">{{_("Gender") }}</label>
 <select class="u-full-width" name="sex" id="sex">
 	<option value="unknown">{{ _("Please select...") }}</option>
    <option value="male">{{ _("Female") }}</option>
    <option value="female">{{ _("Male") }}</option>
  </select>
 <label for="age">{{ _("Age range") }}</label> 
 <select class="u-full-width" name="age" id="age">
 	<option value="unknown">{{ _("Please select...") }}</option>
    <option value="0-17">0-17</option>
    <option value="18_24">18-24</option>
    <option value="25-33">25-33</option>
    <option value="34-44">34-44</option>
    <option value="45-54">45-54</option>
    <option value="55-65">55-64</option>
    <option value="66+">66+</option>
  </select> 
</div>