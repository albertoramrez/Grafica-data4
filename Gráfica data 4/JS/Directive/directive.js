app.directive('barChart', function(){
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="chartframe">' +
                  '<div class="filters"></div>' +
                  '</div>',
        scope:{
            data: '=data',
            selectedstate: '=selectoption',
            year: '=years',
            sort: '=sorted'
        },
        link: function(scope, element, attrs) {

          //Seleccionando el elemento dónde se colocará la gráfica
          var container = document.getElementById("chart");

          // Inicializando margenes, altura y ancho
          var margin = {top: 50, right: 20, bottom: 110, left: 60},
              width = container.clientWidth - margin.left - margin.right,
              height = container.clientHeight - margin.top - margin.bottom;

          //Estableciendo los rangos xy de la gráfica
          var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

          var y = d3.scale.linear()
              .range([height, 0]);

          // Añadiendo elemento svg para dibujar la gráfica
          var svg = d3.select("#chart").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //Añadiendo etiquetas al eje y
            svg.append("g")
            .append("text")
            .attr("class", "y label")
            .attr("transform", "rotate(-90)")
            .attr("y", -30)
            .style("text-anchor", "end")
            .text("IDH");

            //Dibujando gráfica con datos iniciales
            draw(arrayedos);

            //Observando el tamaño de la ventana y redibujar la gráfica
            window.addEventListener("resize", function() {
              redraw(arrayedos);
            });

          //Función para crear los ejes xy de la gráfica
          function createAxis() {

            var xAxis = d3.svg.axis() //Eje x de la gráfica
                .scale(x)             //Creando escala con los datos del rango establecidos en x
                .orient('bottom');    //Orientando el eje en el fondo del elemento

            var yAxis = d3.svg.axis() //Eje y de la gráfica
                .scale(y)             //Creando escala con los datos del rango establecidos en y
                .orient("left")       //Orientando el eje a la izquierda del elemento

            svg.append("g")                             //Añadiendo elemento para dibujar eje x
                .attr("class", "x axis")
                .attr("transform", "translate(0,0)");

            svg.append("g")                             //Añadiendo elemento para dibujar eje y
                .attr("class", "y axis");

            //Dibujando el eje x y añadiendo etiquetas
            svg.select(".x.axis")
              .attr({transform: 'translate(0,' + (height) + ')'})
              .call(xAxis)
              .selectAll('.tick')
              .selectAll('text')
              .attr("y", 0)
              .attr("x", -7)
              .attr("dy", ".0em")
              .attr("transform", "rotate(-60)")
              .style("text-anchor", "end");

            svg.select(".y.axis")   //Dibujando eje y
              .call(yAxis);

          }

          //Función dibujar gráfica
          function draw(data) {

            //Estableciendo el ancho y la altura de la gráfica
            d3.select("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom);

            x.domain(data.map(function(d) { return d.name; }));  //Obteniendo los datos para el eje X

            y.range([height, 0])  //Estableciendo el dominio y el rango del eje y
              .domain([0, 1]);

            //Obteniendo datos para las barras de la gráfica
            var bars = svg.selectAll(".bar")
              .data(data, function(d) { return d.name; });

            // Dibujando las barras
            bars.enter().append("rect")
              .attr("class", "bar")
              .attr("y", y(0))
              .attr("height", height - y(0))
              .transition()
              .delay(function(d, i) {return i * 25;})
              .duration(250)
              .attr("x", function(d) { return x(d.name); })
              .attr("width", x.rangeBand())
              .attr("y", function(d) { return y(d.value); })
              .attr("height", function(d) { return height - y(d.value); })
              .attr("state", function(d){return d.name;})
              .attr("idh", function(d){return d.value;});

            //LLamando a la función para crear los ejes
            createAxis();

          }

          //Función para redibujar la gráfica con dimensiones según la ventana
          function redraw(data) {

            //Reestableciendo los atributos de la gráfica
            width = container.clientWidth - margin.left - margin.right;
            height = container.clientHeight - margin.top - margin.bottom;

            d3.select("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom);

            x.rangeRoundBands([0, width], .1)
              .domain(data.map(function(d) { return d.name; }));

            y.range([height, 0])
              .domain([0, d3.max(data, function(d) { return d.value; })]);

            var bars = svg.selectAll(".bar")
              .data(data, function(d) { return d.name; });

            bars.enter().append("rect")
              .attr("class", "bar");

            //Eliminando las barras anteriores
            bars.exit()
              .transition()
                .duration(300)
              .attr("y", y(0))
              .attr("height", height - y(0))
              .remove();

            // Redibujando las barras con los nuevos elementos
            bars.attr("x", function(d) { return x(d.name); })
              .attr("width", x.rangeBand())
              .attr("y", function(d) { return y(d.value); })
              .attr("height", function(d) { return height - y(d.value); })
              .attr("state", function(d){return d.name;})
              .attr("idh", function(d){return d.value;});

            //Se crean de nuevo los ejes
            createAxis();

          }

          //Filtro Estados

          //Añadiendo selector con evento según función onchange
          var select = d3.select('.filters')
                       .append('select')
                       .attr('class','select')
                        .on('change',onchange);

          //Añadiendo elementos al selector
          var options = select
                      .selectAll('option')
                      .data(selectoption).enter()
                      .append('option')
                      .text(function (d) { return d; });

          function onchange() {
                         var selectValue = d3.select('select').property('value');  //Obteniendo el valor del selector
                         d3.selectAll(".bar").filter(function(d) { return d.name == selectValue; })  //Observando el estado seleccionado
                         .style("fill", "orange");     //Cambiando el color de la barra
                         d3.selectAll(".bar").each(function(d,i){
                           if(d.name == selectValue){                                     //Obteniendolos datos del estado seleccionado
                             var barname = d3.select(this).attr("state");
                             var baridh = d3.select(this).attr("idh");
                             var formatidh = parseFloat(baridh).toFixed(2);
                             d3.select('#selected-state').text("Estado: " + barname);
                             d3.select('#text-idh').text("IDH: " + formatidh);
                           }
                         });

                         //Redibujando el color de la barra seleccionada
                         d3.selectAll(".bar").filter(function(d) { return d.name != selectValue; })
                         .style("fill", "steelblue");
                      }

                      //Filtro Años

                      //Añadiendo selector con evento según función onchangey
                      var yearfilter = d3.select('.filters')
                                   .append('select')
                                   .attr('class','select-year')
                                   .on('change', onchangey);

                      //Añadiendo elementos al selector
                      var selectyear = d3.select('.select-year')
                                  .selectAll('option')
                                  .data(years).enter()
                                  .append('option')
                                  .text(function (d) { return d; });

                      function onchangey() {

                                  //Obteniendo el valor del selector
                                  var selectedYear = d3.select('.select-year').property('value');
                                  //Condición dependiente del valor del selector
                                  if(selectedYear == 2016){

                                    d3.selectAll('.bar').remove();   //Removiendo las barras

                                    draw(arrayedos2016);             //Redibujando las barras con nuevos datos

                                    d3.select('#selected-state').text(null);
                                    d3.select('#text-idh').text(null);

                                  }
                                  else if (selectedYear == 2015) {
                                    d3.selectAll('.bar').remove();

                                    draw(arrayedos2015);

                                    d3.select('#selected-state').text(null);
                                    d3.select('#text-idh').text(null);
                                  }
                                  else {

                                    d3.selectAll('.bar').remove();
                                    draw(arrayedos);

                                    d3.select('#selected-state').text(null);
                                    d3.select('#text-idh').text(null);
                                  }

                                }

                      //Filtro de Datos

                      //Añadiendo selector con evento según función onchangeData
                      var dataFilter = d3.select('.filters')
                                   .append('select')
                                   .attr('class','select-data')
                                    .on('change', onchangeData);

                      //Añadiendo elementos al selector
                      var selectData = d3.select('.select-data')
                                  .selectAll('option')
                                  .data(sortData).enter()
                                  .append('option')
                                  .text(function (d) { return d; });

                      function onchangeData() {

                                  //Obteniendo el valor de la selección
                                  var selectedData = d3.select('.select-data').property('value');

                                  //Condición a cumplir respecto a la selección
                                  if(selectedData == "Descendente (Z - A)"){
                                    descendAxis();     //LLamando función descendAxis
                                  }
                                  else {
                                    ascendAxis();      //LLamando función ascendAxis
                                  }
                      }

                      //Función para ordenar la gráfica de forma descendente
                      function descendAxis(){

                        //Estableciendo los nuevos atributos
                        var width = container.clientWidth - margin.left - margin.right;
                        var height = container.clientHeight - margin.top - margin.bottom;

                        //Ordenando los datos de forma descendente
                        var sorted = arrayedos.sort(function(a, b) {
                                return d3.descending(a.name, b.name);
                        });

                        var newsort = sorted.map(function(d){return d.name;});  //Obteniendo los nombres del arreglo

                        var xdescend = d3.scale.ordinal()    //Nuevo rango y dominio con datos de forma descendente
                            .domain(newsort)
                            .rangeRoundBands([0, width], .1);

                        var xAxisDescend = d3.svg.axis()      //Nuevo eje x
                            .scale(xdescend)
                            .orient('bottom');

                        //Redibujando y añadiendo etiquetas al eje x
                        d3.select('.x.axis')
                                .attr({transform: 'translate(0,' + (height) + ')'})
                                .call(xAxisDescend)
                                .selectAll('.tick')
                                .selectAll('text')
                                .attr("y", 0)
                                .attr("x", -7)
                                .attr("dy", ".0em")
                                .attr("transform", "rotate(-60)")
                                .style("text-anchor", "end");

                            //Ordenando las barras de forma descendente
                            var sortBarsA = svg.selectAll("rect")
                                 .transition()
                                 .delay(function(d, i) {
                                   return i * 50;
                                 })
                                 .duration(1000)
                                 .attr("x", function(d){return xdescend(d.name);});
                      }

                      //Función para ordenar la gráfica de forma ascendente
                      function ascendAxis(){

                             //Ordenando los datos de forma descendente
                             var sorteda = arrayedos.sort(function(a, b) {
                                  return d3.ascending(a.name, b.name);
                              });

                             var newsorta = sorteda.map(function(d){return d.name;});  //Obteniendo los nombres del arreglo

                             var xascend = d3.scale.ordinal()     //Nuevo rango y dominio con datos de forma ascendente
                                  .domain(newsorta)
                                  .rangeRoundBands([0, width], .1);

                             var xAxisAscend = d3.svg.axis()       //Nuevo eje x
                                  .scale(xascend)
                                  .orient('bottom');

                             //Redibujando y añadiendo etiquetas al eje x
                             d3.select('.x.axis')
                                  .attr({transform: 'translate(0,' + (height) + ')'})
                                  .call(xAxisAscend)
                                  .selectAll('.tick')
                                  .selectAll('text')
                                  .attr("y", 0)
                                  .attr("x", -7)
                                  .attr("dy", ".0em")
                                  .attr("transform", "rotate(-60)")
                                  .style("text-anchor", "end");

                              //Ordenando las barras de forma descendente
                              svg.selectAll("rect")
                                  .transition()
                                  .delay(function(d, i) {
                                        return i * 50;
                                  })
                                  .duration(1000)
                                  .attr("x", function(d){return xascend(d.name);});
                       }

  /*                   //Gráfica mobil

                       // Inicializando margenes, altura y ancho
                       var margin2 = {top: 50, right: 20, bottom: 110, left: 60},
                       width2 = 600,
                       height2 = 400;

                       //Estableciendo los rangos xy de la gráfica
                       var y2 = d3.scale.linear()
                         .range([width2, 0]);

                       var x2 = d3.scale.ordinal()
                           .rangeRoundBands([0, height2], .1);

                       // Añadiendo elemento svg para dibujar la gráfica
                       var svg2 = d3.select("#mchart").append("svg")
                           .attr("width", width2 + margin2.left + margin2.right)
                           .attr("height", height2 + margin2.top + margin2.bottom)
                         .append("g")
                           .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

                         //Añadiendo etiquetas al eje y
                         svg2.append("g")
                         .append("text")
                         .attr("class", "y label2")
                         .attr("transform", "rotate(-90)")
                         .attr("y", 450)
                         .style("text-anchor", "end")
                         .text("IDH");

                         //Dibujando gráfica con datos iniciales
                         draw2(arrayedos);

                       //Función para crear los ejes xy de la gráfica
                       function createAxis2() {

                         var xAxis2 = d3.svg.axis() //Eje x de la gráfica
                             .scale(x2)             //Creando escala con los datos del rango establecidos en x
                             .orient('left');    //Orientando el eje en el fondo del elemento

                         var yAxis2 = d3.svg.axis() //Eje y de la gráfica
                             .scale(y2)             //Creando escala con los datos del rango establecidos en y
                             .orient('top')       //Orientando el eje a la izquierda del elemento

                         svg2.append("g")                             //Añadiendo elemento para dibujar eje x
                             .attr("class", "x axis2")
                             .attr("transform", "translate(0,0)");

                         svg2.append("g")                             //Añadiendo elemento para dibujar eje y
                             .attr("class", "y axis2");

                         //Dibujando el eje x y añadiendo etiquetas
                         svg2.select(".x.axis2")
                           //.attr({transform: 'translate(0,' + (height2) + ')'})
                           .call(xAxis2)
                           .selectAll('.tick')
                           .selectAll('text')
                           .attr("y", 0)
                           .attr("x", -7)
                           .attr("dy", ".0em")
                           .attr("transform", "rotate(0)")
                           .style("text-anchor", "end");

                         svg2.select(".y.axis2")   //Dibujando eje y
                           .call(yAxis2);

                       }

                       //Función dibujar gráfica
                       function draw2(data) {

                         //Estableciendo el ancho y la altura de la gráfica
                         d3.select("svg")
                           .attr("width", width2 + margin2.left + margin2.right)
                           .attr("height", height2 + margin2.top + margin2.bottom);

                         x2.domain(data.map(function(d) { return d.abrv; }));  //Obteniendo los datos para el eje X

                         y2.range([0,height2])  //Estableciendo el dominio y el rango del eje y
                           .domain([1, 0]);

                         //Obteniendo datos para las barras de la gráfica
                         var bars2 = svg2
                                    .selectAll('.bar2')
                                    .data(data)
                                    .enter().append("rect")
                                    .classed('bar2', true)
                                    .attr("x", function(d){return x2(d.abrv);})
                                    .attr("y", function(d){return y2(d.value);})
                                    .attr("height", x2.rangeBand())
                                    .attr("width", function(d){return height2 - x2(d.abrv);})
                                    .attr("state", function(d){return d.name;})
                                    .attr("idh", function(d){return d.value;});

                         //LLamando a la función para crear los ejes
                         createAxis2();

                       } */

        }
    }
});
