(function(){
    var canvas = document.getElementById('hexmap');
    var tipCanvas = document.getElementById("tip");
    var tipCtx = tipCanvas.getContext("2d");

    var canvasOffset = $("canvas").offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;

    var xPadding = 30;
    var yPadding = 30;

    var hexHeight,
        hexRadius,
        hexRectangleHeight,
        hexRectangleWidth,
        hexagonAngle = 0.523598776, // 30 degrees in radians
        sideLength = 56,
        boardWidth = 10,
        boardHeight = 10;

    hexHeight = Math.sin(hexagonAngle) * sideLength;
    hexRadius = Math.cos(hexagonAngle) * sideLength;
    hexRectangleHeight = sideLength + 2 * hexHeight;
    hexRectangleWidth = 2 * hexRadius;
    var lastX = -1, lastY = -1;
    localStorage.setItem("lastX", lastX);
    localStorage.setItem("lastY", lastY);
    var stack = "",stackId = "";
   //var objMoves = [], arrHex = {x:0,y:0};
	var arrLocation = [
        { locId: 'adffd', name: 'Rivendell', locx: 0 , locy: 0, x: 2, y: 3, mp: 2, locType : 'hamlet', commodity: 'wood', terrain: 'woods', defenseAdd: 2, defenseMult: 1, value: 200 },
        { locId: 'asdfd', name: 'Gilgould', locx : 0, locy : 0, x: 4, y: 5, mp: 2, locType : 'hamlet', commodity: 'livestock', terrain: 'plains', defenseAdd: 1, defenseMult: 1, value: 150 } 
    ];

    var arrBlockedHexes = [
        {
            hexX: 0, hexY: 0, adjHexes : [{ adjhexX: 0, adjhexY: 1 }, { adjhexX: 1, adjhexY: 0 }],
            hexX: 0, hexY: 1, adjHexes : [{ adjhexX: 0, adjhexY: 0 }, { adjhexX: 1, adjhexY: 0 }, { adjhexX: 1, adjhexY: 1 }]
        }
             
    ];
    // define tooltips for each data point
   


    function printAt(context, text, x, y, lineHeight, fitWidth) {
        fitWidth = fitWidth || 0;

        if (fitWidth <= 0) {
            context.fillText(text, x, y);
            return;
        }

        for (var idx = 1; idx <= text.length; idx++) {
            var str = text.substr(0, idx);
            console.log(str, context.measureText(str).width, fitWidth);
            if (context.measureText(str).width > fitWidth) {
                context.fillText(text.substr(0, idx - 1), x, y);
                printAt(context, text.substr(idx - 1), x, y + lineHeight, lineHeight, fitWidth);
                return;
            }
        }
        context.fillText(text, x, y);
    }

   
    var objMoves = {
        addElem: function (id, elem) {
            var obj = this[id] || {
                       moves: []
            };
            obj.moves.push(elem);
            this[id] = obj;
        },
        removeElem: function (id, last) {
            this[id].moves.splice(last, 1);
        }
    }

    // Returns the max Y value in our data list
    function getMaxY() {
        var max = 0;

        for (var i = 0; i < data.values.length; i++) {
            if (data.values[i].Y > max) {
                max = data.values[i].Y;
            }
        }

        max += 10 - max % 10;
        return max;
    }

    // Returns the max X value in our data list
    function getMaxX() {
        var max = 0;

        for (var i = 0; i < data.values.length; i++) {
            if (data.values[i].X > max) {
                max = data.values[i].X;
            }
        }

        // omited
        //max += 10 - max % 10;
        return max;
    }

    // Return the x pixel for a graph point
    function getXPixel(val) {
        // uses the getMaxX() function
        return ((canvas.width - xPadding) / (getMaxX() + 1)) * val + (xPadding * 1.5);
        // was
        //return ((graph.width - xPadding) / getMaxX()) * val + (xPadding * 1.5);
    }

    // Return the y pixel for a graph point
    function getYPixel(val) {
        return canvas.height - (((canvas.height - yPadding) / getMaxY()) * val) - yPadding;
    }

    Number.prototype.between = function (a, b) {
        var min = Math.min(a, b),
            max = Math.max(a, b);

        return this > min && this < max;
    };


    if (canvas.getContext){
        var ctx = canvas.getContext('2d');
		
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#CCCCCC";
        ctx.lineWidth = 1;

        drawBoard(ctx, boardWidth, boardHeight,false,false);
		canvas.addEventListener("click" , function(eventInfo) {
	         var x,
                y,
                hexX,
                hexY,
                screenX,
                screenY;

            x = eventInfo.offsetX || eventInfo.layerX;
            y = eventInfo.offsetY || eventInfo.layerY;
            stack = document.getElementById('stack');
            stackId = stack.value;

            hexY = Math.floor(y / (hexHeight + sideLength));
			hexX = Math.floor((x - (hexY % 2) * hexRadius) / hexRectangleWidth);
            var fill = true;

            lastX = localStorage.getItem("lastX");
            lastY = localStorage.getItem("lastY");
            console.log("Lastx : " + lastX + ",LastY : " + lastY);
         



            //console.log(localStorage.lastX + "," + localStorage.lastY);
            
			screenX = hexX * hexRectangleWidth + ((hexY % 2) * hexRadius);
            screenY = hexY * (hexHeight + sideLength);
            //console.log ("screenx,y : " + screenX + "," + screenY)
            //ctx.clearRect(0, 0, canvas.width, canvas.height);
	        //drawBoard(ctx, boardWidth, boardHeight);
            // Check if the mouse's coords are on the board
            
            if(hexX >= 0 && hexX < boardWidth) {
                if(hexY >= 0 && hexY < boardHeight) {
                    if (lastX == hexX && lastY == hexY) {
                        objMoves.removeElem(stackId, objMoves[stackId].moves.length - 1);
                        if (objMoves[stackId].moves.length > 0) {
                            localStorage.setItem("lastX", objMoves[stackId].moves[objMoves[stackId].moves.length - 1].x);
                            localStorage.setItem("lastY", objMoves[stackId].moves[objMoves[stackId].moves.length - 1].y);
                        } else {
                            localStorage.setItem("lastX", -1);
                            localStorage.setItem("lastY", -1);
                        }
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        drawBoard(ctx, boardWidth, boardHeight, false,false);
                    } else {
                        objMoves.addElem(stackId, { x: hexX, y: hexY });
                        localStorage.setItem("lastX", hexX);
                        localStorage.setItem("lastY", hexY);

                    }           
                    drawBoard(ctx, boardWidth, boardHeight, true, true);
                    console.log(JSON.stringify(objMoves));
                    //drawHexagon(ctx, screenX, screenY, hexX, hexY, fill, "#EFEFEF");

				}
            }
             //drawBoard(objMoves,ctx, boardWidth, boardHeight);

        });
         canvas.addEventListener("mousemove", function(eventInfo) {
             var x,
                 y,
                 hexX,
                 hexY,
                 screenX,
                 screenY;

             x = eventInfo.offsetX || eventInfo.layerX;
             y = eventInfo.offsetY || eventInfo.layerY;

            
             hexY = Math.floor(y / (hexHeight + sideLength));
             hexX = Math.floor((x - (hexY % 2) * hexRadius) / hexRectangleWidth);
              document.getElementById("demo").innerHTML = "hexX:" + hexX + ",hexY:" + hexY + ",screenX:" + screenX + ",screenY:" + screenY;

             screenX = hexX * hexRectangleWidth + ((hexY % 2) * hexRadius);
             screenY = hexY * (hexHeight + sideLength);
             var hit = false;
             var result = arrLocation.find(loc => loc.x === hexX && loc.y === hexY);
             if (typeof result != "undefined") {
                 document.getElementById("demo").innerHTML = "found it";
                 if (x.between(result.locx + 10, result.locx - 10) && y.between(result.locy + 10, result.locy - 10)) {
                     //document.getElementById("demo").innerHTML = "hexX:" + hexX + ",hexY:" + hexY + ",screenX:" + screenX + ",screenY:" + screenY;
                     tipCanvas.style.left = (x + 465) + "px";
                     tipCanvas.style.top = (y - 40) + "px";
                     tipCtx.clearRect(0, 0, tipCanvas.width, tipCanvas.height);
                     tipCtx.fillText("Name : " + result.name, 5, 15);
                     tipCtx.fillText("Value : " + result.value, 5, 25);
                     tipCtx.fillText("Commodity : " + result.commodity, 5, 35);
                     tipCtx.fillText("Defense : +" + result.defenseAdd, 5, 45);

                     hit = true;
                 }
             }

             if (!hit) { tipCanvas.style.left = "-200px"; }

         });

    }
    function drawBoard(canvasContext, width, height,fill,drawMoves) {
        var i,
            j;
        
        for(i = 0; i < width; ++i) {
            for (j = 0; j < height; ++j) {
                x = i * hexRectangleWidth + ((j % 2) * hexRadius);
                y = j * (sideLength + hexHeight);
                hexY = Math.floor(y / (hexHeight + sideLength));
                hexX = Math.floor((x - (hexY % 2) * hexRadius) / hexRectangleWidth);
                displayY = hexY - 1;
                displayX = hexX - 1;
                var result = arrLocation.find(loc => loc.x === displayX && loc.y === displayY);

                var hexName = hexX + "," + hexY;
                ctx.fillStyle = "#CCCCCC";
                ctx.font = "bold 14px Arial";
                if (typeof result != "undefined") {
                    ctx.fillText(result.name, x+3, y -15);
                    ctx.beginPath();
                    ctx.arc(x-10, y-20, 5, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.fill();
                    result.locx = x + 3;
                    result.locy = y - 15;
                    ctx.beginPath();
                    ctx.arc(x-10, y-20, 8, 0, 2 * Math.PI);
                    ctx.stroke();
                }
                if (drawMoves) {
                    for (m = 0; m < objMoves[stackId].moves.length; ++m) {
                        clickedX = objMoves[stackId].moves[m].x;
                        clickedY = objMoves[stackId].moves[m].y;
                        if (clickedX == hexX && clickedY == hexY) {
                            console.log("found it");
                            ctx.fillText(hexName, x+38, y+25);
                            //                console.log(hexName);               
                            drawHexagon(
                                ctx,
                                i * hexRectangleWidth + ((j % 2) * hexRadius),
                                j * (sideLength + hexHeight),
                                hexX,
                                hexY,
                                true,
                                "#EFEFEF"
                            );

                        }

                    }
                } else {
                    //                console.log(hexName);               
                    drawHexagon(
                        ctx,
                        i * hexRectangleWidth + ((j % 2) * hexRadius),
                        j * (sideLength + hexHeight),
                        hexX,
                        hexY,
                        false,
                        "#FFFFFF"
                    );


                }
            }
        }
    }

    function drawHexagon(canvasContext, x, y, hexX, hexY, fill, fillstyle) {           
        var fill = fill || false;
        var hexName = hexX + "," + hexY;
        canvasContext.fillStyle = "#EFEFEF";
        document.getElementById("demo").innerHTML = fillstyle;
        canvasContext.beginPath();
        canvasContext.moveTo(x + hexRadius, y);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
        canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
        canvasContext.lineTo(x, y + sideLength + hexHeight);
        canvasContext.lineTo(x, y + hexHeight);
        canvasContext.closePath();

		if (fill) {
            //canvasContext.fillStyle = "#000000";
            //canvasContext.font = "bold 14px Arial";
            //canvasContext.fillStyle = "#FFFFFF";
            //canvasContext.fillText(hexName, x + 46, y + 82);

   //         canvasContext.shadowColor = '#999';
			//canvasContext.shadowBlur = 20;
			//canvasContext.shadowOffsetX = 15;
			//canvasContext.shadowOffsetY = 15;		
            canvasContext.fillStyle = fillstyle;
			canvasContext.fill();

		} else {
            canvasContext.stroke();
            if ((hexX == 0 && hexY == 0) || (hexX == 0 && hexY == 1) || (hexX == 0 && hexY == 2) || (hexX == 1 && hexY == 0) || (hexX == 2 && hexY == 0)) {
                canvasContext.fillStyle = "blue";
            } else { canvasContext.fillStyle = "#999966";}

            canvasContext.fill();

		}
        canvasContext.fillStyle = "#EFEFEF";
        canvasContext.fillText(hexName, x + 38, y + 25);

    }



})();