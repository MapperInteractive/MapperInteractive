class PCA{
    constructor(cols, selected_nodes){
        this.cols = cols;
        this.selected_nodes = selected_nodes;
        console.log(this.cols)

    }

    clear_canvas(){
        $("#pca_svg").remove();
    }

    draw_PCA(points_dict, color_type=undefined){
        this.clear_canvas();
        this.points_dict = points_dict;
        if(color_type === "categorical"){
            let color_categorical = d3.scaleOrdinal(d3.schemeCategory10);
            let color_dict = {};

            let categories = [];
    
            this.points_dict.forEach(pt=>{
                if(categories.indexOf(pt.color_val)===-1){
                    categories.push(pt.color_val);
                }
            }) 
            // ordering categories to make sure the colors are consistent
            categories.sort((a,b)=>d3.ascending(a,b))
            for(let i=0; i<categories.length; i++){
                let c = categories[i];
                color_dict[c] = color_categorical(i);
            }
            this.points_dict.forEach(pt=>{
                pt.color = color_dict[pt.color_val];
            })

        } else if(color_type === "numerical"){
            let color_vals = points_dict.map(d=>parseFloat(d.color_val))
            console.log(color_vals)
            let colorScale = d3.scaleLinear()
                        .domain([Math.min(...color_vals), Math.max(...color_vals)])
                        .range(["yellow", "red"]);
            this.points_dict.forEach(pt=>{
                pt.color = colorScale(parseFloat(pt.color_val));
            })
        } else{
            this.points_dict.forEach(pt=>{
                pt.color = "gray";
            })
        }

        

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
            .classed("pca-points", true)
            .attr("cx", d=>xScale(d.pc1))
            .attr("cy", d=>yScale(d.pc2))
            .attr("r", 2)
            .attr("fill", d=>d.color);

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