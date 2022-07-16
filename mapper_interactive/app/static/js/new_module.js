class New_Module{
    constructor(module_info){
        this.module_name = module_info.name;
        this.module_id = module_info.id;
        this.components = module_info.components;
        this.draw_new_module();
    }

    clear_canvas(){
        $("#"+this.module_id+"_svg").remove();
    }

    draw_new_module(){
        // Module structure:
        // 1. Title: module name
        // 2. A button to run the analysis
        // 3. Components to display results (can be: scatter plot, table, etc.)

        console.log(this.module_name)
        let panel_container = d3.select("#sidebar-container").append("div").attr("id", this.module_id+"-panel").classed("block", true);
        panel_container.append("div").attr("id", this.module_id+"-panel_title").classed("block_title", true).html(this.module_name);
        let panel_body = panel_container.append("div").classed("block_body", true).style("max-height","1000px");
        this.panel_body_inner = panel_body.append("div").attr("id",this.module_id+"-block_body-inner").classed("block_body-inner", true);
        $("#"+this.module_id+"-block_body-inner").append("<input type='button' class='btn btn-outline-dark btn-block ui-form-button' id='"+this.module_id+"_button' value='Approximate "+this.module_name+"'>")


        let panel_title = document.getElementById(this.module_id+"-panel_title");
        panel_title.addEventListener("click", function(){
            this.classList.toggle("collapsed")
            let block_body = this.nextElementSibling;
            if (block_body.style.maxHeight){
                block_body.style.maxHeight = null;
            } else {
                block_body.style.maxHeight = "1000px";
            } 
        })
    }

    add_component(c) {
        if(c==="scatter plot"){
            this.add_plot();
        } else if(c === "table"){
            this.add_table();
        } else if(c === "line graph"){
            this.add_line_graph();
        }
    }

    add_line_graph(){
        // input data: list of values

        this.clear_canvas();

        console.log(this.data)

        let margin = {"left":25, "top":20, "right":20, "bottom":20};
        let width = $(this.panel_body_inner.node()).width();
        let height = width+5;

        let module_svg = this.panel_body_inner.append("svg")
            .attr("id", this.module_id+"_svg")
            .attr("width", width)
            .attr("height", height);

        let xScale = d3.scaleLinear()
            .domain([0, this.data.length])
            .range([margin.left, width-margin.right]);

        let yScale = d3.scaleLinear()
            .domain([Math.min(...this.data), Math.max(...this.data)])
            .range([height-margin.bottom, margin.top]);

        let line = d3.line() // line generator
            .x(function(d, i) { return xScale(i); })
            .y(function(d) { return yScale(d); }) 
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        module_svg.append("g").attr("id", this.module_id+"_axis_group");
        module_svg.append("g").attr("id", this.module_id+"_line_group");

        d3.select("#"+this.module_id+"_line_group").append("path")
            .datum(this.data) //  Binds data to the line 
            // .attr("class", "line")
            .attr("stroke", "blue")
            .attr("stroke-width", 1)
            .attr("fill", "none")
            .attr("d", line);

        // x-axis
        d3.select("#"+this.module_id+"_axis_group").append("g") 
            .call(d3.axisBottom(xScale).ticks(5))
            .classed("axis_line", true)
            .attr("transform", "translate(0,"+(height-margin.bottom)+")");
        
        // y-axis
        d3.select("#"+this.module_id+"_axis_group").append("g")
            .call(d3.axisLeft(yScale).ticks(5))
            .classed("axis_line", true)
            .attr("transform", "translate("+margin.left+",0)");
        
        

    }

    add_plot(){
        console.log(this.data)
        this.clear_canvas();
            
        let color = d3.scaleOrdinal(d3.schemeCategory10);
        let margin = {"left":20, "top":20, "right":10, "bottom":15};
        let width = $(this.panel_body_inner.node()).width();
        let height = width+5;

        let x = this.data.map(d=>d.col1);
        let y = this.data.map(d=>d.col2);

        let xScale = d3.scaleLinear()
            .domain([Math.min(...x), Math.max(...x)])
            .range([margin.left, width-margin.right]);

        let yScale = d3.scaleLinear()
            .domain([Math.min(...y), Math.max(...y)])
            .range([margin.top, height-margin.bottom]);

        let module_svg = this.panel_body_inner.append("svg")
            .attr("id", this.module_id+"_svg")
            .attr("width", width)
            .attr("height", height);
        module_svg.append("g").attr("id", this.module_id+"_axis_group");
        module_svg.append("g").attr("id", this.module_id+"_circle_group");

        let cg = d3.select("#"+this.module_id+"_circle_group").selectAll("circle").data(this.data);
        cg.exit().remove();
        cg = cg.enter().append("circle").merge(cg)
            .attr("cx", d=>xScale(d.col1))
            .attr("cy", d=>yScale(d.col2))
            .attr("r", 2)
            // .attr("fill", "orange")
            .attr("fill", d=>{
                return color(parseInt(d.kmeans_cluster));
            })

        // x-axis
        d3.select("#"+this.module_id+"_axis_group").append("g") 
            .call(d3.axisBottom(xScale).ticks(5))
            .classed("axis_line", true)
            .attr("transform", "translate(0,"+(height-margin.bottom)+")");
        
        // y-axis
        d3.select("#"+this.module_id+"_axis_group").append("g")
            .call(d3.axisLeft(yScale).ticks(5))
            .classed("axis_line", true)
            .attr("transform", "translate("+margin.left+",0)");

    }

    add_table(){
        console.log(res)
        this.clear_result();
        d3.select("#"+this.module_id+"-block_body-inner").append("div").classed("reg-result_title",true).append("h6").html(this.module_name);
        let result_container = d3.select("#regression-panel").select(".block_body-inner").append("div")
            .classed("row", true)
            .attr("id","regression-result")
            .style("padding-top","5px");
        
        let indep_vars_container = result_container.append("div")
            .classed("col-sm-3", true)
            .classed("scrollable-horizontal", true);
        indep_vars_container.append("text").html("vars").style("visibility", "hidden");
        let indep_vars_ul = indep_vars_container.append("ul");

        let coef_container = result_container.append("div")
            .classed("col-sm-2", true);
        coef_container.append("text").html("coef").classed("reg_title", true);
        let coef_ul = coef_container.append("ul");

        let std_container = result_container.append("div")
            .classed("col-sm-3", true);
        std_container.append("text").html("std err").classed("reg_title", true);
        let std_ul = std_container.append("ul");

        let pvalue_container = result_container.append("div")
            .classed("col-sm-4", true);
        pvalue_container.append("text").html("p-value").classed("reg_title", true);
        let pvalue_ul = pvalue_container.append("ul");


        let ig = indep_vars_ul.selectAll("li").data(['constant'].concat(this.indep_vars_selected));
        ig.exit().remove();
        ig = ig.enter().append("ul").merge(ig)
            .html(d=>d);

        let cg = coef_ul.selectAll("li").data(res.params);
        cg.exit().remove();
        cg = cg.enter().append("ul").merge(cg)
            .html(d=>Math.round(d*1000)/1000);

        let sg = std_ul.selectAll("li").data(res.stderr);
        sg.exit().remove();
        sg = sg.enter().append("ul").merge(sg)
            .html(d=>Math.round(d*1000)/1000);

        let pg = pvalue_ul.selectAll("li").data(res.pvalues);
        pg.exit().remove();
        pg = pg.enter().append("li").merge(pg)
            .html(d=>Math.round(d*1000)/1000);
    }
}