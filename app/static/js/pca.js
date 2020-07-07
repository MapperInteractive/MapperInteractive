class PCA{
    constructor(cols, selected_nodes){
        this.cols = cols;
        this.selected_nodes = selected_nodes;
        console.log(this.cols)

    }

    clear_canvas(){
        $("#pca_svg").remove();
    }

    draw_PCA(points_dict){
        this.clear_canvas();

        let color = d3.scaleOrdinal(d3.schemeCategory10);

        let margin = {"left":20, "top":20, "right":10, "bottom":15};
        let width = $(d3.select("#PCA-panel").select(".block_body-inner").node()).width();
        let height = width+5;
        let x = points_dict.map(d=>d.pc1);
        let y = points_dict.map(d=>d.pc2);
        let xScale = d3.scaleLinear()
            .domain([Math.min(...x), Math.max(...x)])
            .range([margin.left, width-margin.right]);
        let yScale = d3.scaleLinear()
            .domain([Math.min(...y), Math.max(...y)])
            .range([margin.top, height-margin.bottom]);
        let pca_svg = d3.select("#PCA-panel").select(".block_body-inner").append("svg")
            .attr("id", "pca_svg")
            .attr("width", width)
            .attr("height", height);
        pca_svg.append("g").attr("id","axis_group");
        pca_svg.append("g").attr("id", "circle_group");

        let cg = d3.select("#circle_group").selectAll("circle").data(points_dict);
        cg.exit().remove();
        cg = cg.enter().append("circle").merge(cg)
            .attr("cx", d=>xScale(d.pc1))
            .attr("cy", d=>yScale(d.pc2))
            .attr("r", 2)
            .attr("fill", d=>{
                return color(parseInt(d.kmeans_cluster));
            })

        // x-axis
        d3.select("#axis_group").append("g") 
            .call(d3.axisBottom(xScale).ticks(5))
            .classed("axis_line", true)
            .attr("transform", "translate(0,"+(height-margin.bottom)+")");
        
        // y-axis
        d3.select("#axis_group").append("g")
            .call(d3.axisLeft(yScale).ticks(5))
            .classed("axis_line", true)
            .attr("transform", "translate("+margin.left+",0)");
    }
}