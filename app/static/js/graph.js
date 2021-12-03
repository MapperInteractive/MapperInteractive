class Graph{
    constructor(graph_data, col_keys, connected_components, categorical_cols, other_cols=undefined, filter_functions=undefined){
        console.log("cok", col_keys)
        this.nodes = graph_data.nodes;
        this.links = graph_data.links;
        this.col_keys = col_keys;
        this.connected_components = {};
        this.filter_functions = filter_functions;
        for(let i=0; i<connected_components.length; i++){
            this.connected_components["cluster"+i] = connected_components[i];
        }
        this.categorical_cols = categorical_cols;
        this.other_cols = other_cols;
        console.log("categorical cols", this.categorical_cols)
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
        this.axis_group = this.graphSvg_g.append("g")
            .attr("id","graph-axis-group");

        d3.select(".sidebar-container").style("height", this.height)
            
        // histogram SVG
        this.hist_margin = {"top":15, "left":10, "between":20, "bar_height":5};
        this.hist_width = $(d3.select("#workspace-histogram").node()).width();
        this.hist_height = this.hist_margin.top*2 + this.col_keys.length*(this.hist_margin.bar_height+this.hist_margin.between);
        this.hist_scale = this.get_scale();

        // color functions
        this.COLORMAPS = {"- None -":undefined, 
        "spectral":d3.interpolateSpectral, 
        "turbo":d3.interpolateTurbo,
        "BuYlRd":d3.interpolateRdYlBu,
        "Yellow, Red":["yellow", "red"], 
        "Purple, Red":["purple", "red"],
        "Yellow, Blue":["yellow", "blue"], 
        "Green, Blue":["green", "blue"],
        "Blue, Red":["blue", "red"]
    };
        this.colorScale = d3.scaleLinear(); 
        
        this.label_column = "row index";

        this.color_functions();
        this.size_functions();
        this.toggle_graph_layout();
        this.select_view();
        this.draw_mapper_fd();
        this.selection_nodes();
        this.img_functions();
    }

    toggle_graph_layout(){
        this.layout_alg = "fd";
        let layout_dropdown = document.getElementById("graph_layout_dropdown");
        let that = this;
        layout_dropdown.onchange = function(){
            that.layout_alg = layout_dropdown.options[layout_dropdown.selectedIndex].value;
            if(that.layout_alg === "fd"){
                $("#graph_layout_filter-container").remove()
                that.draw_mapper_fd();
            } else if(that.layout_alg === "sorted"){
                let filter_row = d3.select("#workspace-graph_layout").select(".block_body-inner").append("div")
                    .classed("row", true)
                    .attr("id", "graph_layout_filter-container")
                    .style("padding-top", "5px")
                    .style("padding-bottom", "5px");
                filter_row.append("div")
                    .classed("col-sm-4", true)
                    .classed("col-form-label", true)
                    .html("Filter function")
                filter_row.append("div")
                    .classed("col-sm-8", true)
                    .attr("id", "graph_layout_filter_dropdown-container")
                $("#graph_layout_filter_dropdown-container").append('<select class="custom-select"  name="graph_layout_filter_dropdown" id="graph_layout_filter_dropdown"></select>')
                that.filter_functions.forEach(filter=>{
                    d3.select("#graph_layout_filter_dropdown").append("option")
                        .html(filter);
                })
                that.sorted_filter = that.filter_functions[0];
                let filter_dropdown = document.getElementById("graph_layout_filter_dropdown");
                filter_dropdown.onchange = function(){
                    that.sorted_filter = filter_dropdown.options[filter_dropdown.selectedIndex].text;
                    console.log(that.sorted_filter)
                    that.draw_mapper_sorted();
                }
                that.draw_mapper_sorted();
            }
        }
    }

    img_functions(){
       let names = ['airplane',
        'automobile',
        'bird',
        'cat',
        'deer',
        'dog',
        'frog',
        'horse',
        'ship',
        'truck']
        let names2idx = {};
        for(let i=0; i<names.length; i++){
            names2idx[names[i]] = i;
        }
        let labels = ['-None-'];
        for(let j=0; j<5000; j++){
            labels.push(j);
        }
        d3.select("#img-category").selectAll("option").data(names)
            .enter().append("option")
            .html(d=>d);
        d3.select("#img-locations").selectAll("option").data(labels)
            .enter().append("option")
            .html(d=>d);
            
        let that=this;
        this.img_locations = [];
        let img_category_dropdown = document.getElementById("img-category");
        let img_category_val = img_category_dropdown.options[img_category_dropdown.selectedIndex].text;
        let img_label_dropdown = document.getElementById("img-locations");
        let img_label_val = parseInt(img_label_dropdown.options[img_label_dropdown.selectedIndex].text);

        let f = d3.format(".3f");
        img_category_dropdown.onchange = function(){
            img_category_val = img_category_dropdown.options[img_category_dropdown.selectedIndex].text;
            console.log(img_category_val, img_label_val)
            that.img_locations = [];
            let purity = 0;
            let img_idx = names2idx[img_category_val]*5000 + img_label_val;
            for(let i=0; i<that.nodes.length; i++){
                let node = that.nodes[i];
                let vertices = node.vertices.vertices;
                if(vertices.indexOf(img_idx)!=-1){
                    that.img_locations.push(i);
                    purity += 1 / Object.keys(node.categorical_cols_summary.label).length;
                }
                
            }
            purity /= that.img_locations.length;
            d3.selectAll(".viewer-graph__vertex")
            .style("stroke", d=>{
                if(that.img_locations.indexOf(d.index)!=-1){
                    return "magenta"
                } else {
                    return "#696969"
                }
            })
            .style("stroke-width", d=>{
                if(that.img_locations.indexOf(d.index)!=-1){
                    return 8
                } else {
                    return 2
                }
            })
            d3.select("#point_purity").html("point purity: " + f(purity))

        }


        img_label_dropdown.onchange = function(){
            img_label_val = parseInt(img_label_dropdown.options[img_label_dropdown.selectedIndex].text);
            console.log(img_category_val, img_label_val)
            that.img_locations = [];
            let purity = 0;
            let img_idx = names2idx[img_category_val]*5000 + img_label_val;
            for(let i=0; i<that.nodes.length; i++){
                let node = that.nodes[i];
                let vertices = node.vertices.vertices;
                if(vertices.indexOf(img_idx)!=-1){
                    that.img_locations.push(i);
                    purity += 1 / Object.keys(node.categorical_cols_summary.label).length;
                }
                
            }
            purity /= that.img_locations.length;
            d3.selectAll(".viewer-graph__vertex")
            .style("stroke", d=>{
                if(that.img_locations.indexOf(d.index)!=-1){
                    return "magenta"
                } else {
                    return "#696969"
                }
            })
            .style("stroke-width", d=>{
                if(that.img_locations.indexOf(d.index)!=-1){
                    return 8
                } else {
                    return 2
                }
            })
            d3.select("#point_purity").html("point purity: " + f(purity))
        }


        
    }

    color_functions(){
        let selections = ['- None -', 'Number of points'].concat(this.col_keys);
        selections = selections.concat(this.categorical_cols);
        let vg = d3.select("#color_function_values").selectAll("option").data(selections);
        vg.exit().remove();
        vg = vg.enter().append("option").merge(vg)
            .html(d=>d);

        let mg = d3.select("#color_function_maps").selectAll("option").data(Object.keys(this.COLORMAPS));
        mg.exit().remove();
        mg = mg.enter().append("option").merge(mg)
            .html(d=>d);

        let scale_options = ["Default range", "Data range", "Custom range"];
        let sg = d3.select("#color_function_scale").selectAll("option").data(scale_options);
        sg.exit().remove();
        sg = sg.enter().append("option").merge(sg)
            .html(d=>d);

        let that=this;
        let value_dropdown = document.getElementById("color_function_values");
        let value = value_dropdown.options[value_dropdown.selectedIndex].text;
        let map_dropdown = document.getElementById("color_function_maps");
        let map = map_dropdown.options[map_dropdown.selectedIndex].text;
        let scale_dropdown = document.getElementById("color_function_scale");
        let scale = scale_dropdown.options[scale_dropdown.selectedIndex].text;
        
        value_dropdown.onchange = function(){
            value = value_dropdown.options[value_dropdown.selectedIndex].text;
            that.color_col = value;
            if(that.col_keys.indexOf(value)!=-1 || value==="Number of points"){
                $('#color-legend-svg').remove();
                if(scale === "Default range"){
                    that.colorScale.domain([0,1]);
                } else if(scale === "Data range"){
                    that.colorScale.domain(that.find_col_domain(value));
                }
                if(map!='- None -'){
                    that.draw_color_legend(that.colorScale);
                    that.fill_vertex(value);
                }
                $("#color_function_maps").prop("disabled", false);
                $("#color_function_scale").prop("disabled", false);
            } else if(that.categorical_cols.indexOf(value)!=-1){
                console.log(value)
                let color_dict = that.fill_vertex_categorical(value);
                // let color_dict;
                // if(value === "label"){
                //     color_dict = that.fill_vertex_categorical(value);
                // }
                
                // else{
                //     color_dict = that.fill_vertex_categorical_single_class(value);
                // }
                
                that.draw_color_legend_categorical(color_dict);
                $("#color_function_maps").prop("disabled", true);
                $("#color_function_scale").prop("disabled", true);
            } else if(value === "- None -"){
                that.colorScale.domain([undefined, undefined]); 
                that.fill_vertex(value);
                $("#color_function_maps").prop("disabled", false);
                $("#color_function_scale").prop("disabled", false);
            }
            
        }
        
        map_dropdown.onchange = function(){
            map = map_dropdown.options[map_dropdown.selectedIndex].text;
            if(that.COLORMAPS[map]){
                if(map === 'spectral' || map === 'turbo' || map === 'BuYlRd'){
                    that.colorScale = d3.scaleSequential(that.COLORMAPS[map]);
                } else {
                    that.colorScale = d3.scaleLinear()
                        .range(that.COLORMAPS[map]);
                }
                
                that.draw_color_legend(that.colorScale);
            } else { 
                that.colorScale.range([undefined, undefined]); 
                $('#color-legend-svg').remove();
            }
            that.fill_vertex(value);
        }

        scale_dropdown.onchange = function(){
            scale = scale_dropdown.options[scale_dropdown.selectedIndex].text;
            let scale_range_container = document.getElementById("scale-range-container-inner");
            if(scale === "Custom range"){
                scale_range_container.style.maxHeight = scale_range_container.scrollHeight + "px";
            } else {
                scale_range_container.style.maxHeight = null;
            }
            if(scale === "Default range"){
                that.colorScale.domain([0,1]);
            } else if (scale === "Data range"){
                that.colorScale.domain(that.find_col_domain(value));
            }
            if(map!='- None -'){
                that.draw_color_legend(that.colorScale);
                that.fill_vertex(value);
            }
        }

        d3.select("#apply_scale")
            .on("click", ()=>{
                let scale_left = parseFloat(d3.select("#scale-interval-left").node().value);
                let scale_right = parseFloat(d3.select("#scale-interval-right").node().value);
                if(scale_left > scale_right){
                    alert("Invalid range!")
                } else{
                    that.colorScale.domain([scale_left, scale_right]);
                    if(map!='- None -'){
                        that.draw_color_legend(that.colorScale);
                        that.fill_vertex(value);
                    }
                }
            })
    }


    draw_color_legend(color_scale){
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
        let axisDomain = color_scale.domain();
        let svg = d3.select("#color-legend-svg").attr('width', width).attr('height', height);

        // axis
        let tickValues = [axisDomain[0], d3.mean(axisDomain), axisDomain[1]];
        let axisScale = d3.scaleLinear().domain(axisDomain).range([axisMargin, width - axisMargin*3]);
        let axis = d3.axisBottom(axisScale).tickValues(tickValues);

        svg.append("g").attr("transform", "translate(0,40)").call(axis);

        let legendGroup = svg.append("g")

        let domainStep = (axisDomain[1] - axisDomain[0])/colorTileNumber;
        let rects = d3.range(axisDomain[0], axisDomain[1], domainStep)
        let rg = legendGroup.selectAll("rect").data(rects);
        rg.exit().remove();
        rg = rg.enter().append("rect").merge(rg);
        rg
            .attr('x', d=>axisScale(d))
            .attr('y', 10)
            .attr('width', colorTileWidth-1)
            .attr('height',colorTileHeight)
            .attr('fill', d=>color_scale(d));
    }

    draw_color_legend_categorical(color_dict){
        console.log("color_dict", color_dict)
        // reset svg 
        $('#color-legend-svg').remove();
        $('#block_body-inner_color').append('<svg width="0" height="0" id="color-legend-svg"></svg>');
        // draw legend
        let color_array = d3.entries(color_dict).sort(d3.ascending);
        let width = $(d3.select("#workspace-color_functions").node()).width();
        let margin = 10;
        let rect_height = 10;
        let rect_width = 25;
        let rect_margin = 8;
        let height = color_array.length*(rect_height+rect_margin)+margin*2;
        let svg = d3.select("#color-legend-svg").attr('width', width).attr('height', height);

        console.log(color_array)

        let lg = svg.selectAll("g").data(color_array.filter(d=>d.value!="#fff"));
        lg.exit().remove();
        lg = lg.enter().append("g").merge(lg)
            .attr("transform", "translate("+margin+","+margin+")")
        lg.append("rect")
            .attr("x",0)
            .attr("y",(d,i)=>i*(rect_height+rect_margin))
            .attr("height", rect_height)
            .attr("width",rect_width)
            .attr("fill", d=>d.value)
            .style("opacity", 0.8);

        lg.append("text")
            .attr("x", rect_width+margin*3)
            .attr("y", (d,i)=>i*(rect_height+rect_margin)+8)
            .text(d=>d.key);
    }

    size_functions(){
        let selections = ['- None -', 'Number of points'].concat(this.col_keys);
        let sg = d3.select("#size_function_values").selectAll("option").data(selections);
        sg.exit().remove();
        sg = sg.enter().append("option").merge(sg)
            .html(d=>d);

        this.size_scales = {};
        for(let i=0; i<this.col_keys.length; i++){
            let c = this.col_keys[i];
            let v = this.nodes.map(d=>d.avgs[c]);
            this.size_scales[c] = d3.scaleLinear()
                .domain([Math.min(...v), Math.max(...v)])
                .range([6,18])
        }
        let v = this.nodes.map(d=>d.size);
        this.size_scales['Number of points'] = d3.scaleLinear()
            .domain([Math.min(...v), Math.max(...v)])
            .range([10,18])

        let size_dropdown = document.getElementById("size_function_values");
        let size = size_dropdown.options[size_dropdown.selectedIndex].text;
        let that = this;
        size_dropdown.onchange = function(){
            size = size_dropdown.options[size_dropdown.selectedIndex].text;
            if(size === "Number of points"){
                d3.selectAll(".viewer-graph__vertex")
                    .attr("r", d=>that.size_scales[size](d.size));
            } else if(that.size_scales[size]){
                d3.selectAll(".viewer-graph__vertex")
                    .attr("r", d=>that.size_scales[size](d.avgs[size]));
            } else {
                d3.selectAll(".viewer-graph__vertex")
                    .attr("r", 12);
            }
            let arc = d3.arc().innerRadius(0);
            d3.selectAll(".pie-group-piece")
                .attr("d", d=>{
                    let r = d3.select("#node"+d.data.node_id).attr("r")
                    arc.outerRadius(r);
                    return arc(d);
                })
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
        // let hist_scale = {};
        // let col_ranges = {};
        // for(let i=0; i<this.col_keys.length; i++){
        //     col_ranges[this.col_keys[i]] = {"max":-Infinity, "min":Infinity};
        // }
        // this.nodes.forEach(n=>{
        //     for(let col_key in n.avgs){
        //         if(n.avgs[col_key]<col_ranges[col_key].min){
        //             col_ranges[col_key].min = n.avgs[col_key];
        //         }
        //         if(n.avgs[col_key]>col_ranges[col_key].max){
        //             col_ranges[col_key].max = n.avgs[col_key];
        //         }
        //     }
        // })
        // for(let i=0; i<this.col_keys.length; i++){
        //     let col_key = this.col_keys[i]
        //     hist_scale[col_key] = d3.scaleLinear()
        //         .domain([col_ranges[col_key].min, col_ranges[col_key].max])
        //         .range([this.hist_margin.left*6, this.hist_width-this.hist_margin.left*10]);
        // }
        // return hist_scale;
        let max_val = -Infinity;
        let min_val = Infinity;
        this.nodes.forEach(n=>{
            for(let col_key in n.avgs){
                if(n.avgs[col_key]<min_val){
                    min_val = n.avgs[col_key];
                }
                if(n.avgs[col_key]>max_val){
                    max_val = n.avgs[col_key];
                }
            }
        })
        min_val = Math.min(0, min_val);
        let hist_scale = d3.scaleLinear()
            .domain([min_val, max_val])
            .range([0, this.hist_width-this.hist_margin.left*10]);
        return hist_scale
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
        $('#color-legend-svg').remove();
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
        this.selected_nodes = [];
        this.if_select_node = true;
        d3.select("#select-node").classed("selected", true);
        d3.select("#unselect-view").classed("selected", false);
        this.if_select_cluster = false;
        d3.select("#select-cluster").classed("selected", false);
        this.if_select_path = false;
        d3.select("#select-path").classed("selected", false);
        this.unhighlight_all()
        
    }

    select_cluster(){
        this.selected_nodes = [];
        this.if_select_cluster = true;
        d3.select("#select-cluster").classed("selected", true);
        d3.select("#unselect-view").classed("selected", false);
        this.if_select_node = false;
        d3.select("#select-node").classed("selected", false);
        this.if_select_path = false;
        d3.select("#select-path").classed("selected", false);
        this.unhighlight_all();
    }

    select_path(){
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
        this.unhighlight_all();
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
        this.unhighlight_all();

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
                    // .attr("width", this.hist_scale[avgs[j].key](avgs[j].value))
                    .attr("width", this.hist_scale(avgs[j].value))
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
                // d3.select("#node"+currentId).classed("highlighted_path", true).style("fill", "white");
                // d3.select("#node-label"+currentId).style("fill", "#555");
                this.highlight_selectable(currentId, true);
                d3.select("#link"+currentId+"_"+nextId).classed("highlighted_path", true);
                d3.select("#link"+nextId+"_"+currentId).classed("highlighted_path", true);

            }
            currentId = nextId;
            kk += 1;
        }
    }

    highlight_selected(nid){
        d3.select("#node"+nid).classed("selected", true);
        d3.select("#node-label"+nid).classed("selected", true);
        d3.select("#group"+nid).select(".viewer-graph__pie").classed("selected", true);

    }

    unhighlight_selected(nid){
        d3.select("#node"+nid).classed("selected", false);
        d3.select("#node-label"+nid).classed("selected", false);
        d3.select("#group"+nid).select(".viewer-graph__pie").classed("selected", false);
    }

    highlight_selectable(nid, if_highlight_path=false){
        if(if_highlight_path){
            d3.select("#node"+nid).classed("highlighted_path", true);
        } else{
            d3.select("#node"+nid).classed("selectable", true);
        }
        d3.select("#node-label"+nid).classed("selectable", true);
        d3.select("#group"+nid).select(".viewer-graph__pie").classed("selectable", true);
    }

    unhighlight_selectable(){
        d3.selectAll(".viewer-graph__vertex").classed("highlighted_path", false);
        d3.selectAll(".viewer-graph__vertex").classed("selectable", false);
        d3.selectAll(".viewer-graph__label").classed("selectable", false);
        d3.selectAll(".viewer-graph__pie").classed("selectable", false);
        d3.selectAll(".viewer-graph__edge").classed("highlighted_path", false);
    }

    highlight_unselectable(nid){
        d3.select("#node"+nid).classed("unselectable", true);
        d3.select("#node-label"+nid).classed("unselectable", true);
        d3.select("#group"+nid).select(".viewer-graph__pie").classed("unselectable", true);
    }

    unhighlight_unselectable(nid){
        d3.select("#node"+nid).classed("unselectable", false);
        d3.select("#node-label"+nid).classed("unselectable", false);
        d3.select("#group"+nid).select(".viewer-graph__pie").classed("unselectable", false);
    }

    unhighlight_all(){
        d3.selectAll(".viewer-graph__vertex").classed("selected",false);
        d3.selectAll(".viewer-graph__label").classed("selected",false);
        d3.selectAll(".viewer-graph__pie").classed("selected",false);
        d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
        d3.selectAll(".viewer-graph__label").classed("unselectable",false);
        d3.selectAll(".viewer-graph__pie").classed("unselectable",false);
        d3.selectAll(".viewer-graph__edge").classed("selected", false);
    }

    draw_mapper_fd(){
        this.axis_group.remove();
        this.axis_group = this.graphSvg_g.append("g")
            .attr("id","graph-axis-group");

        this.nodes.forEach(node=>{
            delete node['fx'];
        })

        let simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.links).id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(this.width/2, this.height/2))
            .force("x", d3.forceX().strength(0.2))
            .force("y", d3.forceY().strength(0.2));
                
        let ng = this.node_group.selectAll("g").data(this.nodes);
        ng.exit().remove();
        ng = ng.enter().append("g").merge(ng)
            .attr("class", "viewer-graph__vertex-group")
            .attr("id",(d)=>"group"+d.id)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("mouseover", (d)=>{
                if(this.if_select_node) {
                    if(this.selected_nodes.indexOf(d.id) === -1){
                        this.highlight_selectable(d.id);
                    }
                } else if(this.if_select_cluster) {
                    if(this.selected_nodes.indexOf(d.id) === -1) {
                        let cluster = this.connected_components[d.clusterId];
                        cluster.forEach(nId=>{
                            this.highlight_selectable((nId+1).toString());
                        })
                    }
                }
                else if(this.if_select_path){
                    if(this.selected_nodes.length === 0){
                        this.highlight_selectable(d.id);
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
                }             
            })
            .on("click",(d)=>{
                this.clicking = true;
                if(this.if_select_node){
                    this.unhighlight_selectable();
                    if(this.selected_nodes.indexOf(d.id)===-1){ // Selecting nodes
                        this.selected_nodes.push(d.id);
                        this.highlight_selected(d.id)
                    } else{ // Unselecting
                        this.selected_nodes.splice(this.selected_nodes.indexOf(d.id),1);
                        this.unhighlight_selected(d.id)
                    }
                    this.draw_hist();
                } else if(this.if_select_cluster){
                    this.unhighlight_selectable();
                    let cluster = this.connected_components[d.clusterId];
                    if(this.selected_nodes.indexOf(d.id)===-1){
                        cluster.forEach(nodeId=>{
                            this.selected_nodes.push((nodeId+1).toString());
                        })
                        this.nodes.forEach(node=>{
                            if(node.clusterId === d.clusterId){                                
                                this.highlight_selected(node.id)
                            } 
                        })
                    } else{
                        cluster.forEach(nId=>{
                            this.selected_nodes.splice(this.selected_nodes.indexOf((nId+1).toString()),1);
                            this.unhighlight_selected((nId+1).toString());
                        })
                    }
                    this.draw_hist();
                } else if(this.if_select_path){
                    this.unhighlight_selectable();
                    if(this.selected_nodes.length===0){
                        this.selected_nodes.push(d.id);
                        this.highlight_selected(d.id)
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
                            this.highlight_selected(currentId)
                            currentId = nextId;
                            kk += 1;
                        }
                        this.path_start_id = d.id;
                    }
                    this.nodes.forEach(node=>{
                        if(this.selectable_nodes.indexOf(node.id)===-1 && this.selected_nodes.indexOf(node.id)===-1){
                            this.highlight_unselectable(node.id);
                        } else{
                            this.unhighlight_unselectable(node.id);
                        }
                    })
                    this.draw_hist();
                }
                console.log(this.selected_nodes)
                this.text_cluster_details(this.selected_nodes, this.label_column, this.labels);
            });



        ng.append("circle")
            .classed("viewer-graph__vertex",true)
            .attr("fill", "#fff")
            .attr("id",(d)=>"node"+d.id)
            .attr("r", 12);

        let lg = this.link_group.selectAll("line").data(this.links);
        lg.exit().remove();
        lg = lg.enter().append("line").merge(lg);
        lg
            .classed("viewer-graph__edge",true)
            .attr("id",d=>"link"+d.source.id+"_"+d.target.id);
            // .attr("x1", d => d.source.x)
            // .attr("y1", d => d.source.y)
            // .attr("x2", d => d.target.x)
            // .attr("y2", d => d.target.y);

        // let lbg = this.label_group.selectAll("text").data(this.nodes);
        // lbg.exit().remove();
        // lbg = lbg.enter().append("text").merge(lbg);
        // lbg
        

        ng.append("text")
            .classed("viewer-graph__label", true)
            .attr("fill", "#555")
            .attr("id",(d)=>"node-label"+d.id)
            .text((d)=>d.id)
            .attr("x",d=>-3)
            .attr("y",d=>4);

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
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
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

    draw_mapper_sorted(){
        this.axis_group.remove();
        this.axis_group = this.graphSvg_g.append("g")
            .attr("id","graph-axis-group");
        let simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.links).id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(this.width/2, this.height/2))
            .force("x", d3.forceX().strength(0.2))
            .force("y", d3.forceY().strength(0.4))
            .stop();

        this.nodes.forEach(node=>{
            node.links = {"source":[], "target":[]};
        })

        this.links.forEach(l=>{
            l.source.links.source.push(`link${l.source.id}_${l.target.id}`);
            l.target.links.target.push(`link${l.source.id}_${l.target.id}`);
        })

        let selected_lens = this.sorted_filter;

        let margin = 40;
        let lens_values = this.nodes.map(d=>d.avgs[selected_lens]);
        let lens_scale = d3.scaleLinear()
            .domain([Math.min(...lens_values), Math.max(...lens_values)])
            .range([margin, this.width-margin])


        this.nodes.forEach(node=>{
            node.fx = lens_scale(node.avgs[selected_lens]);
        })

        simulation.tick(300);

        let y_max = Math.max(...this.nodes.map(d=>d.y));

        // draw axis
        let lens_axis = d3.axisBottom(lens_scale).ticks(5);
        this.axis_group.append("g")
            .classed("axis", true)
            .attr("transform", `translate(0,${y_max+20})`)
            .call(lens_axis);
        
        this.axis_group.append("text")
            .attr("transform", `translate(${this.width/2},${Math.max(...this.nodes.map(d=>d.y))+60})`)
            .text(selected_lens)
        
        let ng = this.node_group.selectAll("g").data(this.nodes);
        ng.exit().remove();
        ng = ng.enter().append("g").merge(ng)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .attr("class", "viewer-graph__vertex-group")
            .attr("id",(d)=>"group"+d.id)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("mouseover", (d)=>{
                if(this.if_select_node) {
                    if(this.selected_nodes.indexOf(d.id) === -1){
                        this.highlight_selectable(d.id);
                    }
                } else if(this.if_select_cluster) {
                    if(this.selected_nodes.indexOf(d.id) === -1) {
                        let cluster = this.connected_components[d.clusterId];
                        cluster.forEach(nId=>{
                            this.highlight_selectable((nId+1).toString());
                        })
                    }
                }
                else if(this.if_select_path){
                    if(this.selected_nodes.length === 0){
                        this.highlight_selectable(d.id);
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
                }             
            })
            .on("click",(d)=>{
                this.clicking = true;
                if(this.if_select_node){
                    this.unhighlight_selectable();
                    if(this.selected_nodes.indexOf(d.id)===-1){ // Selecting nodes
                        this.selected_nodes.push(d.id);
                        this.highlight_selected(d.id)
                    } else{ // Unselecting
                        this.selected_nodes.splice(this.selected_nodes.indexOf(d.id),1);
                        this.unhighlight_selected(d.id)
                    }
                    this.draw_hist();
                } else if(this.if_select_cluster){
                    this.unhighlight_selectable();
                    let cluster = this.connected_components[d.clusterId];
                    if(this.selected_nodes.indexOf(d.id)===-1){
                        cluster.forEach(nodeId=>{
                            this.selected_nodes.push((nodeId+1).toString());
                        })
                        this.nodes.forEach(node=>{
                            if(node.clusterId === d.clusterId){                                
                                this.highlight_selected(node.id)
                            } 
                        })
                    } else{
                        cluster.forEach(nId=>{
                            this.selected_nodes.splice(this.selected_nodes.indexOf((nId+1).toString()),1);
                            this.unhighlight_selected((nId+1).toString());
                        })
                    }
                    this.draw_hist();
                } else if(this.if_select_path){
                    this.unhighlight_selectable();
                    if(this.selected_nodes.length===0){
                        this.selected_nodes.push(d.id);
                        this.highlight_selected(d.id)
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
                            this.highlight_selected(currentId)
                            currentId = nextId;
                            kk += 1;
                        }
                        this.path_start_id = d.id;
                    }
                    this.nodes.forEach(node=>{
                        if(this.selectable_nodes.indexOf(node.id)===-1 && this.selected_nodes.indexOf(node.id)===-1){
                            this.highlight_unselectable(node.id);
                        } else{
                            this.unhighlight_unselectable(node.id);
                        }
                    })
                    this.draw_hist();
                }
                console.log(this.selected_nodes)
                this.text_cluster_details(this.selected_nodes, this.label_column, this.labels);
            });



        ng.append("circle")
            .classed("viewer-graph__vertex",true)
            .attr("fill", "#fff")
            .attr("id",(d)=>"node"+d.id)
            .attr("r", 12);

        ng.append("text")
            .classed("viewer-graph__label", true)
            .attr("fill", "#555")
            .attr("id",(d)=>"node-label"+d.id)
            .text((d)=>d.id)
            .attr("x",d=>-3)
            .attr("y",d=>4);

        let lg = this.link_group.selectAll("line").data(this.links);
        lg.exit().remove();
        lg = lg.enter().append("line").merge(lg);
        lg
            .classed("viewer-graph__edge",true)
            .attr("id",d=>"link"+d.source.id+"_"+d.target.id)
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        let that = this;
        function ticked() {
            lg
                .attr("x1", d => lens_scale(d.source.avgs[selected_lens]))
                .attr("y1", d => d.source.y)
                .attr("x2", d => lens_scale(d.target.avgs[selected_lens]))
                .attr("y2", d => d.target.y);
        
            let radius = 8;
            ng
                .attr("transform", function (d) {
                    return "translate(" + lens_scale(d.avgs[selected_lens]) + "," + d.y + ")";
                });
    
            // **** TODO **** how to make the label centered?
            lbg
                .attr("x",d=>lens_scale(d.avgs[selected_lens])-3)
                .attr("y",d=>d.y+4);
        }
    
        function dragstarted(d) {
            
            // if (!d3.event.active) {simulation.alphaTarget(0.3).restart();
            // d.fx = d.x;
            // d.fy = d.y;}
        }
    
        function dragged(d) {
            // d.fx = d3.event.x;
            // d.fy = d3.event.y;
            // d.x = d3.mouse(this.parentNode)[0];
            d.y = d3.mouse(this.parentNode)[1];
            d3.select(`#group${d.id}`).attr("transform", `translate(${d.x}, ${d.y})`)
            d.links.source.forEach(eid=>{
                d3.select(`#${eid}`).attr("x1", d.x).attr("y1", d.y);
            });
            d.links.target.forEach(eid=>{
                d3.select(`#${eid}`).attr("x2", d.x).attr("y2", d.y);
            });
        }
    
        function dragended(d) {
            // if (!d3.event.active) {simulation.alphaTarget(0);
            // d.fx = null;
            // d.fy = null;}
            d3.select(`#group${d.id}`).attr("transform", `translate(${d.x}, ${d.y})`)
            d.links.source.forEach(eid=>{
                d3.select(`#${eid}`).attr("x1", d.x).attr("y1", d.y);
            });
            d.links.target.forEach(eid=>{
                d3.select(`#${eid}`).attr("x2", d.x).attr("y2", d.y);
            });
        }

        const zoom_handler = d3.zoom()
            .on("zoom", zoom_actions);

        // drag_handler(ng);
        zoom_handler(this.graphSvg);

        function zoom_actions() {
            that.graphSvg_g.attr("transform", d3.event.transform);
        }
    }

    text_cluster_details(nodes, label_column, labels){
        console.log(labels)
        let details_text = "";
        let vertices_list = [];
        nodes.forEach(nId => {
            let node_index = parseInt(nId)-1;
            let node = this.nodes[node_index];
            node.vertices.forEach(v=>{
                if(vertices_list.indexOf(v)===-1){
                    vertices_list.push(parseInt(v));
                }
            })
        })
        vertices_list.sort((a,b)=>d3.ascending(a,b));
        if(label_column === "row index"){
            vertices_list.forEach(v=>{
                details_text += v + " ";
            })
        } else{
            if(labels){
                vertices_list.forEach(v=>{
                    details_text += labels[v] + " ";
                })
            }
        }
        d3.select("#nodes-details-labels").html(details_text);

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
        d3.selectAll(".viewer-graph__pie").remove();
        d3.selectAll(".viewer-graph__vertex")
            .attr("fill", d=>{
                if(d3.select("#node"+d.id).classed("selected")===false){
                    if(col_key === "Number of points"){
                        if(d.size < this.colorScale.domain()[0]){
                            return "#fff"; // white
                        } else if(d.size > this.colorScale.domain()[1]){
                            return "rgb(169,169,169)"; // grey
                        }
                        return this.colorScale(d.size);
                    } else if(col_key === "- None -"){
                        return "#fff";
                    }
                    else{
                        return this.colorScale(d.avgs[col_key]);
                    }
                }
                });
        d3.selectAll(".viewer-graph__label")
            .attr("fill", d=>{
                let circle_rgb = d3.select("#node"+d.id).attr("fill");
                let rgb = circle_rgb.replace(/rgb\(|\)|rgba\(|\)|\s/gi, '').split(',');
                for (let i = 0; i < rgb.length; i++){ rgb[i] = (i === 3 ? 1 : 255) - rgb[i] };
                return 'rgb(' + rgb.join(',') + ')';
            })
    }

    fill_vertex_categorical_single_class(col_key){
        d3.selectAll(".viewer-graph__pie").remove();
        d3.selectAll(".viewer-graph__vertex").attr("fill", "#fff");
        d3.selectAll(".viewer-graph__label").attr("fill", "#555");
        let color_categorical = d3.scaleOrdinal(d3.schemeCategory10);
        let color_dict = {};
        // let color_dict = {"airplane": "#1f77b4", "automobile": "#ff7f0e", "bird": "#2ca02c", "cat": "#d62728", "deer": "#9467bd", "dog": "#8c564b", "frog": "#e377c2", "horse": "#bcbd22", "ship": "#17becf", "truck": "#7f7f7f", 'others':'#fff'};

        let width_scale = d3.scaleLinear()
            .domain([1,1000])
            .range([2,6])

        let size_scale = d3.scaleLinear()
            .domain([1,1000])
            .range([8,18])


        d3.selectAll(".viewer-graph__vertex")
            // .attr("fill", d=>{
            //     if(d.id == "72"){
            //         return "#1f77b4"
            //     }
            //     else if(d.id == "36" && col_key == "horse"){
            //         return "#d62728"
            //     }
            //     else if(d.id == "14" && col_key == "airplane"){
            //         return "#d62728"
            //     }
            //     else if(d.id == "8" && col_key == "bird"){
            //         return "#d62728"
            //     }
            //     else{
            //         return "#fff"
            //     }
            // })
            .style("opacity", 0.6)
            // .attr("r", d=>{
            //     if(d.categorical_cols_summary[col_key]['name_noises'] > 0){
            //         return size_scale(d.categorical_cols_summary[col_key]['name_noises'])
            //     } else{
            //         return 6
            //     }

            // })
            .attr("r", d=>{
                if(d.categorical_cols_summary[col_key][col_key] > 0){
                    return size_scale(d.categorical_cols_summary[col_key][col_key])
                } else{
                    return 6
                }

            })
            // .style("stroke", d=>{
            //     if(d.categorical_cols_summary[col_key]['name_noises'] > 0){
            //         return "magenta"
            //     } else {
            //         return "#696969"
            //     }
            // })
            // .style("stroke-width", d=>{
            //     if(d.categorical_cols_summary[col_key]['name_noises'] > 0){
            //         return width_scale(d.categorical_cols_summary[col_key]['name_noises'])
            //     } else {
            //         return 2
            //     }
            // })
        d3.selectAll(".viewer-graph__label").remove();

        


        

        
        let idx = 0;

        // let that = this;
        let pie = d3.pie()
                .value(d => d.value)
                .sort(null);

        let pg = d3.selectAll(".viewer-graph__vertex-group").append("g")
                .attr("class", "viewer-graph__pie");

        d3.selectAll(".viewer-graph__vertex-group")
                .append("text")
                .classed("viewer-graph__label", true)
                // .text(d=>{
                //     if(d.categorical_cols_summary[col_key]['name_noises'] > 0){
                //         return d.categorical_cols_summary[col_key]['name_noises']
                //     } else{
                //         return ""
                //     }
                // })
                .text(d=>{
                    if(d.categorical_cols_summary[col_key][col_key] > 0){
                        return d.categorical_cols_summary[col_key][col_key]
                    } else{
                        return ""
                    }
                })
                .style("font-size", 14)
                // .style("fill", "red")
                .style("fill", "black")

        
        
        let arc = d3.arc().innerRadius(0);

        pg.selectAll("path").data(d=>pie(prepare_pie_data(d)))
            .enter().append("path")
            .attr("class", "pie-group-piece")
            .attr("d", d=> {
                let r = d3.select("#node"+d.data.node_id).attr("r")
                arc.outerRadius(r);
                return arc(d);
            })
            .attr("fill", d=>d.data.color)
            .attr("stroke", "#696969")
            .style("opacity", 0.6);

        function prepare_pie_data(node){
            let pie_data = [];
            for(let c in node.categorical_cols_summary[col_key]){
                if(c!='name_noises'){
                    let p = {};
                    p.category_id = c;
                    p.value = node.categorical_cols_summary[col_key][c];
                    if(p.value > 0){
                        p.node_id = node.id;
                        if(Object.keys(color_dict).indexOf(c)!=-1){
                        // if(color_dict[c]!=""){
                            p.color = color_dict[c];
                        } else {
                            p.color = color_categorical(idx);
                            // p.color = d3.interpolateRainbow((idx+1)/Object.keys(color_dict).length);
                            idx += 1;
                            color_dict[c] = p.color;
                        }
                        pie_data.push(p);
                    }
                    
                }
                
            }
            return pie_data;
        }

        return color_dict;

    }


    fill_vertex_categorical(col_key){
        d3.selectAll(".viewer-graph__pie").remove();
        d3.selectAll(".viewer-graph__vertex").attr("fill", "#fff");
        d3.selectAll(".viewer-graph__label").attr("fill", "#555");
        // let color_categorical = d3.scaleOrdinal(d3.schemeCategory10);
        let color_categorical = d3.scaleOrdinal()
            .range(['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#696969', '#F5F5F5']);
        // let color_dict = {};
        // let color_dict = {"airplane": "#1f77b4", "automobile": "#ff7f0e", "bird": "#2ca02c", "cat": "#d62728", "deer": "#9467bd", "dog": "#8c564b", "frog": "#e377c2", "horse": "#bcbd22", "ship": "#17becf", "truck": "#7f7f7f", "false": "#1f77b4", "true": "#ff7f0e"};
        // // get # catogories
        // this.nodes.forEach(node=>{
        //     for(let c in node.categorical_cols_summary[col_key]){
        //         if(Object.keys(color_dict).indexOf(c)===-1){
        //             color_dict[c] = "";
        //         }
        //     }
        // })
        // d3.selectAll(".viewer-graph__vertex")
        //     .style("stroke", d=>{
        //         if(this.img_locations.indexOf(d.index)!=-1){
        //             return "magenta"
        //         } else {
        //             return "#696969"
        //         }
        //     })
        //     .style("stroke-width", d=>{
        //         if(this.img_locations.indexOf(d.index)!=-1){
        //             return 8
        //         } else {
        //             return 2
        //         }
        //     })

        let color_dict = {};

        let categories = [];

        this.nodes.forEach(node=>{
            for(let c in node.categorical_cols_summary[col_key]){
                if(categories.indexOf(c)===-1){
                    categories.push(c);
                }
            }
        }) 
        // ordering categories to make sure the colors are consistent
        categories.sort((a,b)=>d3.ascending(a,b))
        for(let i=0; i<categories.length; i++){
            let c = categories[i];
            color_dict[c] = color_categorical(i);
        }

           

           

        
        let idx = 0;

        // let that = this;
        let pie = d3.pie()
                .value(d => d.value)
                .sort(null);

        let pg = d3.selectAll(".viewer-graph__vertex-group").append("g")
            .attr("class", "viewer-graph__pie");
        
        let arc = d3.arc().innerRadius(0);

        pg.selectAll("path").data(d=>pie(prepare_pie_data(d)))
            .enter().append("path")
            .attr("class", "pie-group-piece")
            .attr("d", d=> {
                let r = d3.select("#node"+d.data.node_id).attr("r")
                arc.outerRadius(r);
                return arc(d);
            })
            .attr("fill", d=>d.data.color)
            .attr("stroke", "#696969")
            .style("opacity", 0.6);

        function prepare_pie_data(node){
            let coarse_label = 'aquatic_mammals'
            let coarse_label2 = 'fish'
            let pie_data = [];
            for(let c in node.categorical_cols_summary[col_key]){
                let p = {};
                p.category_id = c;
                p.value = node.categorical_cols_summary[col_key][c];
                p.node_id = node.id;
                if(col_key === "fine_label"){
                    if(coarse_label in node.categorical_cols_summary['coarse_label'] || coarse_label2 in node.categorical_cols_summary['coarse_label']){
                        if(Object.keys(color_dict).indexOf(c)!=-1){
                            // if(color_dict[c]!=""){
                                p.color = color_dict[c];
                            } else {
                                p.color = color_categorical(idx);
                                // p.color = d3.interpolateRainbow((idx+1)/Object.keys(color_dict).length);
                                idx += 1;
                                color_dict[c] = p.color;
                            }
                    } else {
                        p.color = "#fff";
                        color_dict[c] = p.color;
                    }
                } else {
                    if(Object.keys(color_dict).indexOf(c)!=-1){
                    // if(color_dict[c]!=""){
                        p.color = color_dict[c];
                    } else {
                        p.color = color_categorical(idx);
                        // p.color = d3.interpolateRainbow((idx+1)/Object.keys(color_dict).length);
                        idx += 1;
                        color_dict[c] = p.color;
                    }
                    if(c != coarse_label && c != coarse_label2){
                        p.color = "#fff"
                    }
                }
                // if(Object.keys(color_dict).indexOf(c)!=-1){
                // // if(color_dict[c]!=""){
                //     p.color = color_dict[c];
                // } else {
                //     p.color = color_categorical(idx);
                //     // p.color = d3.interpolateRainbow((idx+1)/Object.keys(color_dict).length);
                //     idx += 1;
                //     color_dict[c] = p.color;
                // }
                pie_data.push(p);
            }
            if(pie_data.length > 12){
                pie_data.splice(12); // if too many categories, only keep 12 of them and the pie chart becomes a glyph now
            }
            return pie_data;
        }

        return color_dict;
    }


}