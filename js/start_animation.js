function startAnimation(rotSpeed1, rotSpeed2){
	var radius = 50,
		smallRadius = 6.5,
		durationScale = Math.max(rotSpeed1, rotSpeed2),
		posCircleOne = {x : 100, y : 100, r : radius, rotSpeed: rotSpeed1, rotate: 0},
		posCircleTwo = {x : 400, y : 400, r : radius, rotSpeed: rotSpeed2, rotate: -90},
		data = [ posCircleOne, posCircleTwo],
		lineData = 
				[
					{x:0, y:0},
					{x:1, y:0}
				],
		pathData = [{x:radius,y:0}];
				
	var svg = d3.select("svg");
	
	svg.selectAll("*").remove();

	var arc = d3.arc();

	var lineFunction = d3.line()
		.x(function(d){ return d.x; })
		.y(function(d){ return d.y; });
		
	var traceFunction = d3.line()
		.curve(d3.curveBasis)
		.x(function(d){ return d.x; })
		.y(function(d){ return d.y; });


		
	var circles = svg.append("g")
		.attr("id", "circles");
		
	var trace = svg.append("g")
		.attr("id", "trace")
		.attr("transform", "translate(400,100)");
		
	var circleGroup = circles.selectAll("g").data(data).enter()
		.append("g")
		.attr("id", function(d,i){ return "circle" + i.toString();})
		.attr("transform", function(d){
			return "translate(" + d.x+ "," + d.y + ")"
		});
		
	var circlePath = circleGroup.append("path")
		.attr("class", "circlePath")
		.attr("d", function(d){
		
			return arc({
				innerRadius:0,
				outerRadius:d.r,
				startAngle: 1/2* Math.PI,
				endAngle:5/2*Math.PI
		})});	

	var pathMove = circleGroup.append("path")
		.attr("class", "pathMove")
		.attr("d", lineFunction(lineData));	
		
	var circleMove = circleGroup.append("circle")
		.attr("class", "circleMove")
		.attr("r", smallRadius)
		.attr("transform", function(d){
			return "translate(" + d.r + "," + 0 + ")";
		});


	var traceCircle = trace
		.append("circle")
		.attr("id", "movingCircle") 
		.attr("r", smallRadius)
		.attr("transform", "translate(" + radius + "," + 0 + ")");
		
	var tracePath = trace
		.append("path")
		.data([pathData])
		.attr("id", "tracePath")
		.attr("d", lineFunction);
	
	if(rotSpeed1 != null && rotSpeed2 != null){
		transition();
	}
	
	

	function transition(){
		
		
		
		circleMove
					.transition()
						.duration(function(d){return durationScale * 1000;})
						.ease(d3.easeLinear)
						.attrTween("transform", translateAlong(circlePath.node()));
		
		pathMove
					.transition()
						.duration(durationScale * 1000)
						.ease(d3.easeLinear)
						.attrTween("transform", translateLineAlong(circlePath.node()))
						.attrTween("d",changeEndPoint());
	}


	// Returns an attrTween for translating along the specified path element.
	function translateAlong(path) {
		return function(d, i, a) {
			var l = path.getTotalLength();
			return function(t) {
				for(i=0;i<= d.rotSpeed - 1; i++){
					if(i/d.rotSpeed <= t && t<= i+1/d.rotSpeed){
						var p = path.getPointAtLength(l*d.rotSpeed*t - i*l);
					}
				}
				return "translate(" + p.x + "," + p.y + ")";
			};
		};
	}

	function translateLineAlong(path){
		return function(d, i, a) {
			var l = path.getTotalLength();
			return function(t) {
				for(i=0;i<= d.rotSpeed - 1; i++){
					if(i/d.rotSpeed <= t && t<= i+1/d.rotSpeed){
						var p = path.getPointAtLength(l*d.rotSpeed*t - i*l);
					}
				}
				var trans = "translate(" + p.x + "," + p.y + ") rotate(" + d.rotate + ")";
				return trans;
			};
		};
	}

	function moveCircle(path1Selection, path2Selection){
		//Both pathes have the same length.
		var path1 = path1Selection.node(),
			path2 = path2Selection.node(),
			rotSpeed1 = path1Selection.data()[0].rotSpeed,
			rotSpeed2 = path2Selection.data()[0].rotSpeed,
			l1 = path1.getTotalLength()/rotSpeed1,
			l2 = path2.getTotalLength()/rotSpeed2;

		return function(d,i,a){
			return function(t){
				p1 = path1.getPointAtLength(t*l1/rotSpeed2);
				p2 = path2.getPointAtLength(t*l2/rotSpeed1);
				return "translate(" + p1.x + "," + p2.y + ")";
			}
		}
	}

	function trace(path1Selection, path2Selection){
		//Both pathes have the same length.
		var path1 = path1Selection.node(),
			path2 = path2Selection.node(),
			rotSpeed1 = path1Selection.data()[0].rotSpeed,
			rotSpeed2 = path2Selection.data()[0].rotSpeed,
			l1 = path1.getTotalLength()/rotSpeed1,
			l2 = path2.getTotalLength()/rotSpeed2;

		return function(d,i,a){
			return function(t){
				p1 = path1.getPointAtLength(rotSpeed1*t*l1);
				p2 = path2.getPointAtLength(rotSpeed2*t*l2);
				p = svg.node().createSVGPoint();
				p.x = p1.x;
				p.y = p2.y;
				pathData.push(p);
				return traceFunction(pathData);
			}
		}
	}

	function changeEndPoint() {
		
		return function(d, i, a) {		
			return function(t) {
				var otherCircle = circleMove.filter(function(data){ return data != d ;});
				var thisCircle = circleMove
					.filter(function(data){
						return data == d ;
					});
				
				var otherTransform = otherCircle.attr("transform");
				var thisTransform = thisCircle.attr("transform");
				var otherPointTotal = [0,0];
				var thisPointTotal = [0,0];
				if(otherTransform != null && thisTransform != null){
					var otherPoint = getTranslation(otherTransform.toString());
					var thisPoint = getTranslation(thisTransform.toString());
					var otherPointTotal = [Math.abs(otherCircle.data()[0].x + otherPoint[0]), Math.abs(otherCircle.data()[0].y + otherPoint[1]) ];
					var thisPointTotal = [Math.abs(thisCircle.data()[0].x + thisPoint[0]), Math.abs(thisCircle.data()[0].y + thisPoint[1]) ];
					
					p = svg.node().createSVGPoint();
					p.x = thisPoint[0];
					p.y = otherPoint[1];
					if(i == 1){
						pathData.push(p);
						tracePath.attr("d", lineFunction);
						d3.select("#movingCircle").attr("transform", "translate(" + p.x + "," + p.y + ")");
					};
					
				};
				
				
				var x = (d.rotate == 0) ? (Math.abs(otherPointTotal[0] - thisPointTotal[0])) : (Math.abs(otherPointTotal[1] - thisPointTotal[1]));
				var lineData = [
					{x:0,y:0},
					{x:x,y:0}
				];
				return lineFunction(lineData);
				};
		};
	}

	function getTranslation(transform) {
		// Create a dummy g for calculation purposes only. This will never
		// be appended to the DOM and will be discarded once this function 
		// returns.
		var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

		// Set the transform attribute to the provided string value.
		g.setAttributeNS(null, "transform", transform);

		// consolidate the SVGTransformList containing all transformations
		// to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
		// its SVGMatrix. 
		var matrix = g.transform.baseVal.consolidate().matrix;

		// As per definition values e and f are the ones for the translation.
		return [matrix.e, matrix.f];
	}

};
