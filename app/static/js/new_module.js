class New_Module{
    constructor(module_info){
        this.module_name = module_info.name;
        this.components = module_info.components;
        this.draw_new_module();
    }

    clear_canvas(){
        $("#"+this.module_name+"_svg").remove();
    }

    draw_new_module(){
        // Module structure:
        // 1. Title: module name
        // 2. A button to run the analysis
        // 3. Components to display results (can be: scatter plot, table, etc.)

        console.log(this.module_name)
        let panel_container = d3.select("#sidebar-container").append("div").attr("id", this.module_name+"-panel").classed("block", true);
        panel_container.append("div").attr("id", this.module_name+"-panel_title").classed("block_title", true).html(this.module_name);
        let panel_body = panel_container.append("div").classed("block_body", true).style("max-height","1000px");
        this.panel_body_inner = panel_body.append("div").attr("id",this.module_name+"-block_body-inner").classed("block_body-inner", true);
        $("#"+this.module_name+"-block_body-inner").append("<input type='button' class='btn btn-outline-dark btn-block ui-form-button' id='"+this.module_name+"_button' value='Run "+this.module_name.toUpperCase()+"'>")


        let panel_title = document.getElementById(this.module_name+"-panel_title");
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
        }
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
            .attr("id", this.module_name+"_svg")
            .attr("width", width)
            .attr("height", height);
        module_svg.append("g").attr("id", this.module_name+"_axis_group");
        module_svg.append("g").attr("id", this.module_name+"_circle_group");

        let cg = d3.select("#"+this.module_name+"_circle_group").selectAll("circle").data(this.data);
        cg.exit().remove();
        cg = cg.enter().append("circle").merge(cg)
            .attr("cx", d=>xScale(d.col1))
            .attr("cy", d=>yScale(d.col2))
            .attr("r", 2)
            .attr("fill", "grey")
            // .attr("fill", d=>{
            //     return color(parseInt(d.kmeans_cluster));
            // })

        // x-axis
        d3.select("#"+this.module_name+"_axis_group").append("g") 
            .call(d3.axisBottom(xScale).ticks(5))
            .classed("axis_line", true)
            .attr("transform", "translate(0,"+(height-margin.bottom)+")");
        
        // y-axis
        d3.select("#"+this.module_name+"_axis_group").append("g")
            .call(d3.axisLeft(yScale).ticks(5))
            .classed("axis_line", true)
            .attr("transform", "translate("+margin.left+",0)");

    }
}