class Graph{
    constructor(graph_data, col_keys, connected_components){
        this.nodes = graph_data.nodes;
        this.links = graph_data.links;
        this.col_keys = col_keys;
        this.connected_components = {};
        for(let i=0; i<connected_components.length; i++){
            this.connected_components["cluster"+i] = connected_components[i];
        }
        this.assign_cc2node();
        this.find_neighbor_nodes();
        console.log(this.nodes)
        console.log(this.links)
        console.log(this.col_keys)
        console.log(this.connected_components)
        this.clear_mapper();
        // init graph container
        this.width = $(d3.select(".viewer-graph__graph").node()).width();
        this.height = Math.max($(d3.select(".viewer-graph__graph").node()).height(), 650);
        this.graphSvg = d3.select("#graphSVG")
            .attr("width", this.width)
            .attr("height", this.height);
        this.graphSvg_g = this.graphSvg.append("g");
        this.link_group = this.graphSvg_g.append("g")
            .attr("id","graph-link-group");
        this.node_group = this.graphSvg_g.append("g")
            .attr("id","graph-node-group");
        this.label_group = this.graphSvg_g.append("g")
            .attr("id","graph-label-group");

        d3.select(".sidebar-container").style("height", this.height)
            
        // histogram SVG
        this.hist_margin = {"top":15, "left":10, "between":20, "bar_height":5};
        this.hist_width = $(d3.select("#workspace-histogram").node()).width();
        this.hist_height = this.hist_margin.top*2 + this.col_keys.length*(this.hist_margin.bar_height+this.hist_margin.between);
        this.hist_scale = this.get_scale();

        // color functions
        this.COLORMAPS = {"- None -":undefined, 
        "Yellow, Red":["yellow", "red"], 
        "Purple, Red":["purple", "red"], 
        "Green, Blue":["green", "blue"]};
        this.colorScale = d3.scaleLinear();

        // this.COLORMAPS = [
        //     { 'label': '- None -', 'scheme': null },
        //     // { 'label': 'Rainbow', 'scheme': 'interpolateRainbow' },
        //     { 'label': 'Yellow, Red', 'scheme': 'interpolateYlOrRd' },
        //     // { 'label': 'Yellow, Blue', 'scheme': 'interpolateYlOrBr' },
        //     // { 'label': 'Yellow, Green', 'scheme': 'interpolateYlGn' },
        //     // { 'label': 'Yellow, Green, Blue', 'scheme': 'interpolateYlGnBu' },
        //     { 'label': 'Purple, Red', 'scheme': 'interpolatePuRd' },
        //     // { 'label': 'Purple, Blue', 'scheme': 'interpolatePuBu' },
        //     // { 'label': 'Purple, Blue, Green', 'scheme': 'interpolatePuBuGn' },
        //     { 'label': 'Green, Blue', 'scheme': 'interpolateGnBu' },
        //     // { 'label': 'Red', 'scheme': 'interpolateOrRd' },
        //     // { 'label': 'Red, Blue', 'scheme': 'interpolateRdPu' },
        //     // { 'label': 'Blue', 'scheme': 'interpolateBlues' },
        //     // { 'label': 'Blue, Purple', 'scheme': 'interpolateBuPu' }
        //   ]      
        
        this.color_functions();
        this.size_functions();
        this.select_view();
        this.draw_mapper();
        this.selection_nodes();
    }
    color_functions(){
        let selections = ['Number of points'].concat(this.col_keys);
        let vg = d3.select("#color_function_values").selectAll("option").data(selections);
        vg.exit().remove();
        vg = vg.enter().append("option").merge(vg)
            .html(d=>d);

        let mg = d3.select("#color_function_maps").selectAll("option").data(Object.keys(this.COLORMAPS));
        mg.exit().remove();
        mg = mg.enter().append("option").merge(mg)
            .html(d=>d);

        let that=this;
        let value_dropdown = document.getElementById("color_function_values");
        let value = value_dropdown.options[value_dropdown.selectedIndex].text;
        this.color_col = value;
        this.colorScale.domain(this.find_col_domain(value));
        value_dropdown.onchange = function(){
            value = value_dropdown.options[value_dropdown.selectedIndex].text;
            that.color_col = value;
            that.colorScale.domain(that.find_col_domain(value));
            that.fill_vertex(value);
        }
    
        let map_dropdown = document.getElementById("color_function_maps");
        let map = map_dropdown.options[map_dropdown.selectedIndex].text;
        if(this.COLORMAPS[map]){
            this.colorScale.range(this.COLORMAPS[map]);
        } else { this.colorScale.range([undefined, undefined]); }
        map_dropdown.onchange = function(){
            map = map_dropdown.options[map_dropdown.selectedIndex].text;
            if(that.COLORMAPS[map]){
                that.colorScale.range(that.COLORMAPS[map]);
                // that.draw_color_legend();
            } else { that.colorScale.range([undefined, undefined]); }
            that.fill_vertex(value);
        }

        


    }


    draw_color_legend(){
        // reset svg 
        $('#color-legend-svg').remove();
        $('#block_body-inner_color').append('<svg width="0" height="0" id="color-legend-svg"></svg>');
        // draw legend
        let width = $(d3.select("#workspace-color_functions").node()).width();
        let height = 60;
        let axisMargin = 20;
        let colorTileNumber = 50;
        let colorTileHeight = 20;
        let colorTileWidth = (width - (axisMargin * 2)) / colorTileNumber;
        let axisDomain = this.find_col_domain(this.color_col);
        let svg = d3.select("#color-legend-svg").attr('width', width).attr('height', height);


        // axis
        let tickValues = [axisDomain[0], d3.mean(axisDomain), axisDomain[1]];
        let axisScale = d3.scaleLinear().domain(axisDomain).range([axisMargin, width - axisMargin]);
        let axis = d3.axisBottom(axisScale).tickValues(tickValues);

        svg.append("g").attr("transform", "translate(0,25)").call(axis);



        let tilesGroup = svg.append("g")

        let domainStep = (axisDomain[1] - axisDomain[0])/colorTileNumber;
        let rects = d3.range(axisDomain[0], axisDomain[1], domainStep)
        let rg = this.titlesGroup.selectAll("rect").data(rects);
        rg.exit().remove();
        rg = rg.enter().append("rect").merge(rg);
        rg
            .attr('x', (d)=>axisScale(d))
            .attr('y', )
        .map((d)=>{
            let color = this.colorScale(d);
            tilesGroup.append('rect')
                .attr('x', x)
                .attr('width', colorTileWidth)
                .attr('height', colorTileHeight)
                .attr('fill', color)
                .classed('color_legend', true);
        })

    }

    size_functions(){
        let selections = ['- None -', 'Number of points'].concat(this.col_keys);
        let sg = d3.select("#size_function_values").selectAll("option").data(selections);
        sg.exit().remove();
        sg = sg.enter().append("option").merge(sg)
            .html(d=>d);

        let col_scales = {};
        for(let i=0; i<this.col_keys.length; i++){
            let c = this.col_keys[i];
            let v = this.nodes.map(d=>d.avgs[c]);
            col_scales[c] = d3.scaleLinear()
                .domain([Math.min(...v), Math.max(...v)])
                .range([6,18])
        }
        let v = this.nodes.map(d=>d.size);
        col_scales['Number of points'] = d3.scaleLinear()
            .domain([Math.min(...v), Math.max(...v)])
            .range([6,18])

        let size_dropdown = document.getElementById("size_function_values");
        let size = size_dropdown.options[size_dropdown.selectedIndex].text;
        size_dropdown.onchange = function(){
            size = size_dropdown.options[size_dropdown.selectedIndex].text;
            if(size === "Number of points"){
                d3.selectAll(".viewer-graph__vertex")
                    .attr("r", d=>col_scales[size](d.size));
            } else if(col_scales[size]){
                d3.selectAll(".viewer-graph__vertex")
                    .attr("r", d=>col_scales[size](d.avgs[size]));
            } else {
                d3.selectAll(".viewer-graph__vertex")
                    .attr("r", 12);
            }
        }
    }

    assign_cc2node(){
        for(let cluster_key in this.connected_components){
            let cluster = this.connected_components[cluster_key];
            for(let i=0; i<cluster.length; i++){
                let nodeId = cluster[i];
                this.nodes[nodeId].clusterId = cluster_key;
            }
        }
    }

    find_neighbor_nodes(){
        this.nodes.forEach(node=>{
            node.neighbor_nodes = [];
        })
        this.links.forEach(link=>{
            this.nodes[link.source-1].neighbor_nodes.push(link.target.toString());
            this.nodes[link.target-1].neighbor_nodes.push(link.source.toString());
        })
    }

    get_scale(){
        let hist_scale = {};
        let col_ranges = {};
        for(let i=0; i<this.col_keys.length; i++){
            col_ranges[this.col_keys[i]] = {"max":-Infinity, "min":Infinity};
        }
        this.nodes.forEach(n=>{
            for(let col_key in n.avgs){
                if(n.avgs[col_key]<col_ranges[col_key].min){
                    col_ranges[col_key].min = n.avgs[col_key];
                }
                if(n.avgs[col_key]>col_ranges[col_key].max){
                    col_ranges[col_key].max = n.avgs[col_key];
                }
            }
        })
        for(let i=0; i<this.col_keys.length; i++){
            let col_key = this.col_keys[i]
            hist_scale[col_key] = d3.scaleLinear()
                .domain([col_ranges[col_key].min, col_ranges[col_key].max])
                .range([this.hist_margin.left*6, this.hist_width-this.hist_margin.left*10]);
        }
        return hist_scale;
    }

    clear_mapper(){
        $('#graphSVG').remove();
        $('.viewer-graph__graph').append('<svg id="graphSVG"></svg>');
        $('#size_function_values').remove();
        $('#size-function-container').append('<select class="custom-select"  name="size_function_values" id="size_function_values"></select>');
        $('#color_function_values').remove();
        $('#color_function_maps').remove();
        $('#color-function-values-container').append('<select class="custom-select"  name="color_function_values" id="color_function_values"></select>');
        $('#color-function-maps-container').append('<select class="custom-select"  name="color_function_maps" id="color_function_maps"></select>');
    }

    selection_nodes(){
        d3.select("#unselect-view")
            .on("click",()=>{
                this.select_view();
            })
        d3.select("#select-node")
            .on("click",()=>{
                this.select_node();
            })
        d3.select("#select-cluster")
            .on("click", ()=>{
                this.select_cluster();
            })
        d3.select("#select-path")
            .on("click", ()=>{
                this.select_path();
            })
    }

    select_node(){
        if(!this.if_select_node){
            d3.selectAll(".viewer-graph__vertex").classed("selected",false);
            d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
            d3.selectAll(".viewer-graph__edge").classed("selected", false);
        }
        this.selected_nodes = [];
        this.if_select_node = true;
        d3.select("#select-node").classed("selected", true);
        d3.select("#unselect-view").classed("selected", false);
        this.if_select_cluster = false;
        d3.select("#select-cluster").classed("selected", false);
        this.if_select_path = false;
        d3.select("#select-path").classed("selected", false);
        d3.selectAll(".viewer-graph__vertex").classed("selected",false);
        d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
        d3.selectAll(".viewer-graph__edge").classed("selected", false);
        this.fill_vertex(this.color_col);
    }

    select_cluster(){
        if(!this.if_select_cluster){
            d3.selectAll(".viewer-graph__vertex").classed("selected",false);
            d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
            d3.selectAll(".viewer-graph__edge").classed("selected", false);
        }
        this.selected_nodes = [];
        this.if_select_cluster = true;
        d3.select("#select-cluster").classed("selected", true);
        d3.select("#unselect-view").classed("selected", false);
        this.if_select_node = false;
        d3.select("#select-node").classed("selected", false);
        this.if_select_path = false;
        d3.select("#select-path").classed("selected", false);
        d3.selectAll(".viewer-graph__vertex").classed("selected",false);
        d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
        d3.selectAll(".viewer-graph__edge").classed("selected", false);
        this.fill_vertex(this.color_col);
    }

    select_path(){
        if(!this.if_select_path){
            d3.selectAll(".viewer-graph__vertex").classed("selected",false);
            d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
            d3.selectAll(".viewer-graph__edge").classed("selected", false);
        }
        this.selected_nodes = [];
        this.selectable_nodes = [];
        this.nodes.forEach(node=>{
            this.selectable_nodes.push(node.id);
        })
        this.if_select_path = true;
        d3.select("#select-path").classed("selected", true);
        d3.select("#unselect-view").classed("selected", false);
        this.if_select_node = false;
        d3.select("#select-node").classed("selected", false);
        this.if_select_cluster = false;
        d3.select("#select-cluster").classed("selected", false);
        this.fill_vertex(this.color_col);
    }

    select_view(){
        this.selected_nodes = [];
        d3.select("#unselect-view").classed("selected", true);
        this.if_select_node = false;
        d3.select("#select-node").classed("selected", false);
        this.if_select_cluster = false;
        d3.select("#select-cluster").classed("selected", false);
        this.if_select_path = false;
        d3.select("#select-path").classed("selected", false);
        d3.selectAll(".viewer-graph__vertex").classed("selected", false);
        this.remove_hist();
        d3.selectAll(".viewer-graph__vertex").classed("selected",false);
        d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
        d3.selectAll(".viewer-graph__edge").classed("selected", false);
        this.fill_vertex(this.color_col);

    }

    draw_hist(){
        this.remove_hist();
        let colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        for(let i=0; i<this.selected_nodes.length; i++){
            let node_index = parseInt(this.selected_nodes[i])-1;
            let node = this.nodes[node_index];
            d3.select("#workspace-histogram").select(".block_body-inner").append("div").attr("id","div"+i)
            d3.select("#workspace-histogram").select(".block_body-inner").select("#div"+i).append("h6").classed("text-center", true).html("Node #"+node.id);
            let hist_svg = d3.select("#workspace-histogram").select(".block_body-inner").select("#div"+i).append("svg")
                .attr("width", this.hist_width)
                .attr("height", this.hist_height);
            let avgs = d3.entries(node.avgs);
            for(let j=0; j<avgs.length; j++){
                hist_svg.append("text")
                    .classed("hist_value", true)
                    .attr("x", this.hist_margin.left)
                    .attr("y", j*(this.hist_margin.between+this.hist_margin.bar_height)+this.hist_margin.top)
                    .text(Math.round(avgs[j].value*100)/100);

                hist_svg.append("rect")
                    .classed("hist_bar", true)
                    .attr("x",this.hist_margin.left*6)
                    .attr("y",j*(this.hist_margin.between+this.hist_margin.bar_height)+this.hist_margin.top)
                    .attr("height", 5)
                    .attr("width", this.hist_scale[avgs[j].key](avgs[j].value))
                    .attr("fill", colorScale(j));
                
                hist_svg.append("text")
                    .classed("hist_label", true)
                    .attr("x", this.hist_margin.left*6+5)
                    .attr("y", j*(this.hist_margin.between+this.hist_margin.bar_height)+this.hist_margin.top-5)
                    .text(avgs[j].key);
            }

            hist_svg.append("line")
                .classed("hist_bar_boundary", true)
                .attr("x1", this.hist_margin.left*6)
                .attr("y1",0)
                .attr("x2", this.hist_margin.left*6)
                .attr("y2",(avgs.length-1)*(this.hist_margin.between+this.hist_margin.bar_height)+this.hist_margin.top);
        }
    }

    remove_hist(){
        d3.select("#workspace-histogram").selectAll("svg").remove();
        d3.select("#workspace-histogram").selectAll("h6").remove();
    }

    dijkstra(startId){

        let path = {};
        let nodeList = [startId].concat(this.selectable_nodes.slice(0));
        let distances = {};
        nodeList.forEach(nId=>{ distances[nId] = Infinity; })
        
        distances[startId] = 0;

        let unvisited = nodeList.slice(0);

        while(unvisited.length > 0) {
            let currentId = undefined;
            let nearestDistance = Infinity;

            unvisited.forEach(nId=>{
                if(distances[nId] < nearestDistance) {
                    currentId = nId;
                    nearestDistance = distances[nId];
                }
            });
            unvisited.splice(unvisited.indexOf(currentId), 1);

            // no unvisited node in current cluster
            if (currentId === undefined){
                break;
            }

            let currentIdx = parseInt(currentId)-1;
            let currentNode = this.nodes[currentIdx];
            currentNode.neighbor_nodes.forEach(nbId=>{
                if(unvisited.indexOf(nbId)!=-1){
                    if(distances[nbId] > distances[currentId]+1){
                        distances[nbId] = distances[currentId] + 1;
                        path[nbId] = currentId;
                    }
                }
            })
        }

        return path;
    }

    highlight_path(path, fromId, toId){
        let currentId = toId;
        let kk = 0;
        while (currentId!=fromId && kk < 500){
            let nextId = path[currentId];
            if(this.selected_nodes.indexOf(currentId)===-1){
                d3.select("#node"+currentId).classed("highlighted_path", true).style("fill", "white");
                d3.select("#node-label"+currentId).style("fill", "#555");
                d3.select("#link"+currentId+"_"+nextId).classed("highlighted_path", true);
                d3.select("#link"+nextId+"_"+currentId).classed("highlighted_path", true);

            }
            currentId = nextId;
            kk += 1;
        }
    }

    unhighlight_selectable(){
        d3.selectAll(".viewer-graph__vertex").classed("highlighted_path", false);
        d3.selectAll(".viewer-graph__vertex").classed("selectable", false);
        d3.selectAll(".viewer-graph__edge").classed("highlighted_path", false);
    }

    draw_mapper(){
        let simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.links).id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(this.width/2, this.height/2))
            .force("x", d3.forceX().strength(0.2))
            .force("y", d3.forceY().strength(0.2));
        
        let ng = this.node_group.selectAll("circle").data(this.nodes);
        ng.exit().remove();
        ng = ng.enter().append("circle").merge(ng);
        ng
            .classed("viewer-graph__vertex",true)
            .attr("id",(d)=>"node"+d.id)
            .attr("r", 12)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("mouseover", (d)=>{
                if(this.if_select_node) {
                    if(this.selected_nodes.indexOf(d.id) === -1){
                        d3.select("#node"+d.id).classed("selectable", true).style("fill", "white");
                        d3.select("#node-label"+d.id).style("fill", "#555");
                    }
                } else if(this.if_select_cluster) {
                    if(this.selected_nodes.indexOf(d.id) === -1) {
                        let cluster = this.connected_components[d.clusterId];
                        cluster.forEach(nId=>{
                            d3.select("#node"+(nId+1).toString()).classed("selectable", true).style("fill", "white");
                            d3.select("#node-label"+(nId+1).toString()).style("fill", "#555");
                        })
                    }
                }
                else if(this.if_select_path){
                    if(this.selected_nodes.length === 0){
                        d3.select("#node"+d.id).classed("selectable", true);
                        d3.select("#node-label"+d.id).style("fill", "#555");
                    }
                    else { // this.selected_nodes.length > 0
                        let path = this.dijkstra(this.path_start_id);
                        this.highlight_path(path, this.path_start_id, d.id);
                    }
                }
            })
            .on("mouseout", ()=>{
                if(this.if_select_node || this.if_select_cluster || this.if_select_path){
                    this.unhighlight_selectable();
                    this.fill_vertex(this.color_col);
                }             
            })
            .on("click",(d)=>{
                this.clicking = true;
                if(this.if_select_node){
                    console.log("node", d)
                    let details_text = "";
                    d.vertices.forEach(nn=>{
                        details_text += nn+" ";
                    })
                    d3.select("#nodes-details-labels").html(details_text);

                    this.unhighlight_selectable();
                    if(this.selected_nodes.indexOf(d.id)===-1){ // Selecting nodes
                        this.selected_nodes.push(d.id);
                        d3.select("#node"+d.id).classed("selected",true).style("fill", "white");
                        d3.select("#node-label"+d.id).style("fill","#555");
                    } else{ // Unselecting
                        this.selected_nodes.splice(this.selected_nodes.indexOf(d.id),1);
                        d3.select("#node"+d.id).classed("selected",false);
                        this.fill_vertex(this.color_col);
                    }
                    this.draw_hist();
                } else if(this.if_select_cluster){
                    this.unhighlight_selectable();
                    let cluster = this.connected_components[d.clusterId];
                    this.selected_nodes = [];
                    cluster.forEach(nodeId=>{
                        this.selected_nodes.push((nodeId+1).toString());
                    })
                    this.nodes.forEach(node=>{
                        if(node.clusterId === d.clusterId){
                            d3.select("#node"+node.id).classed("selected", true).style("fill", "white");
                            d3.select("#node-label"+node.id).style("fill","#555");
                        } else{
                            d3.select("#node"+node.id).classed("selected", false);
                            this.fill_vertex(this.color_col);
                        }
                    })
                    this.draw_hist();
                } else if(this.if_select_path){
                    this.unhighlight_selectable();
                    if(this.selected_nodes.length===0){
                        this.selected_nodes.push(d.id);
                        d3.select("#node"+d.id).classed("selected",true).style("fill", "white");
                        d3.select("#node-label"+d.id).style("fill","#555");
                        this.selectable_nodes = this.connected_components[d.clusterId].map(nIdx=>(nIdx+1).toString());
                        this.selectable_nodes.splice(this.selectable_nodes.indexOf(d.id),1);
                        this.path_start_id = d.id;
                    } else if(this.selectable_nodes.indexOf(d.id)!=-1){
                        let startId = this.path_start_id;
                        let path = this.dijkstra(startId);
                        let currentId = d.id;
                        let kk = 0;
                        while (currentId!=startId && kk < 500){
                            this.selected_nodes.push(currentId);
                            this.selectable_nodes.splice(this.selectable_nodes.indexOf(currentId), 1);
                            let nextId = path[currentId];
                            d3.select("#link"+currentId+"_"+nextId).classed("selected", true);
                            d3.select("#link"+nextId+"_"+currentId).classed("selected", true);
                            d3.select("#node"+currentId).classed("selected",true).style("fill", "white");
                            d3.select("#node-label"+currentId).style("fill","#555");
                            currentId = nextId;
                            kk += 1;
                        }
                        this.path_start_id = d.id;
                    }
                    this.nodes.forEach(node=>{
                        if(this.selectable_nodes.indexOf(node.id)===-1 && this.selected_nodes.indexOf(node.id)===-1){
                            d3.select("#node"+node.id).classed("unselectable", true);
                        } else{
                            d3.select("#node"+node.id).classed("unselectable", false);
                        }
                    })
                    this.draw_hist();
                }
            });

        let lg = this.link_group.selectAll("line").data(this.links);
        lg.exit().remove();
        lg = lg.enter().append("line").merge(lg);
        lg
            .classed("viewer-graph__edge",true)
            .attr("id",d=>"link"+d.source.id+"_"+d.target.id);

        let lbg = this.label_group.selectAll("text").data(this.nodes);
        lbg.exit().remove();
        lbg = lbg.enter().append("text").merge(lbg);
        lbg
            .classed("viewer-graph__label", true)
            .attr("id",(d)=>"node-label"+d.id)
            .text((d)=>d.id);

        simulation
            .nodes(this.nodes)
                .on("tick", ticked);

        simulation.force("link")
            .links(this.links);

        let that = this;
        function ticked() {
            lg
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        
            let radius = 8;
            ng
                .attr("cx", function(d) {
                    return d.x;
                    // return (d.x = Math.max(radius, Math.min(that.width - radius, d.x)));
                })
                .attr("cy", function(d) {
                    return d.y;
                    // return (d.y = Math.max(radius, Math.min(that.height - radius, d.y)));
                })
    
            // **** TODO **** how to make the label centered?
            lbg
                .attr("x",d=>d.x-3)
                .attr("y",d=>d.y+4);
        }
    
        function dragstarted(d) {
            if (!d3.event.active) {simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;}
        }
    
        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }
    
        function dragended(d) {
            if (!d3.event.active) {simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;}
        }

        const zoom_handler = d3.zoom()
            .on("zoom", zoom_actions);

        // drag_handler(ng);
        zoom_handler(this.graphSvg);

        function zoom_actions() {
            that.graphSvg_g.attr("transform", d3.event.transform);
        }
    }

    find_col_domain(col_key){
        let min_val = Infinity;
        let max_val = -Infinity;
        if(col_key === 'Number of points') {
            this.nodes.forEach(node=>{
                if(node.size<min_val){
                    min_val = node.size;
                }
                if(node.size>max_val){
                    max_val = node.size;
                }
            })
        } else {
            this.nodes.forEach(node=>{
                if(node.avgs[col_key]<min_val){
                    min_val = node.avgs[col_key];
                }
                if(node.avgs[col_key]>max_val){
                    max_val = node.avgs[col_key];
                }
            })
        }
        
        return [min_val,max_val];
    }

    fill_vertex(col_key){
        console.log(col_key)
        d3.selectAll(".viewer-graph__vertex")
            .style("fill", d=>{
                if(d3.select("#node"+d.id).classed("selected")===false){
                    if(col_key === "Number of points"){
                        return this.colorScale(d.size)
                    } else{
                        return this.colorScale(d.avgs[col_key]);
                    }
                }
                });
        d3.selectAll(".viewer-graph__label")
            .style("fill", d=>{
                let circle_rgb = d3.select("#node"+d.id).style("fill");
                let rgb = circle_rgb.replace(/rgb\(|\)|rgba\(|\)|\s/gi, '').split(',');
                for (let i = 0; i < rgb.length; i++){ rgb[i] = (i === 3 ? 1 : 255) - rgb[i] };
                return 'rgb(' + rgb.join(',') + ')';
            })
    }
}