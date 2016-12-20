# Fractions_On_Circles
Rotate around circles and trace the movement. This is written with d3.js by Mike Bostock. The two big circles are basically svg-paths realized by d3.arc() and the small circles are svg-circles. Furthermore, the main ingredient to 
move the circles around and trace the path is transition.attrTween(). This function smoothly changes an attribute (i.e. "d" or "transform"). We just need to commit a function with a variable t, which calculates the attr for every
iteration  t in the interval [0,1]. Just have a look at the code.
