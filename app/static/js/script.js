let that = this;

this.side_bar = new DataLoader([], []);

$("#import").click(function(){
    $("#files").click();
})
d3.select("#files")
    .on("change",()=>{
        let files = $('#files')[0].files[0];
        let fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent) {
            let textFromFileLoaded = fileLoadedEvent.target.result;
            $.ajax({
                type: "POST",
                url: "/data_process",
                data: textFromFileLoaded,
                dataType:'text',
                success: function (response) {
                    response = JSON.parse(response);
                    that.side_bar = new DataLoader(response.columns, response.categorical_columns);
                },
                error: function (error) {
                    console.log("error",error);
                    alert("Incorrect data format!");
                }
            })
            d3.select(".columns-group")
                .style("max-height","1000px")
                .style("visibility", "visible")
        }
        fileReader.readAsText(files, "UTF-8");
    })


d3.select("#mapper_loader")
    .on("click",()=>{
        if(that.side_bar.all_cols.length>0){
            console.log(that.side_bar.config.filter)
            if(that.side_bar.config.filter[0] === "Density"){
                that.side_bar.config.density_bandwidth = parseFloat(d3.select("#density_bandwidth_values").node().value);
                let density_kernel_dropdown = document.getElementById("density_kernel_selection");
                that.side_bar.config.density_kernel = density_kernel_dropdown.options[density_kernel_dropdown.selectedIndex].text;

            } else if(that.side_bar.config.filter[1] === "Density"){
                that.side_bar.config.density_bandwidth = parseFloat(d3.select("#density_bandwidth_values2").node().value);
                let density_kernel_dropdown = document.getElementById("density_kernel_selection2");
                that.side_bar.config.density_kernel = density_kernel_dropdown.options[density_kernel_dropdown.selectedIndex].text;
            }
            if(that.side_bar.config.filter[0] === "Eccentricity"){
                that.side_bar.config.eccent_p = parseFloat(d3.select("#eccent_p_values").node().value);
                let eccent_dist_dropdown = document.getElementById("eccent_dist_selection")
                that.side_bar.config.eccent_dist = eccent_dist_dropdown.options[eccent_dist_dropdown.selectedIndex].text;
            } else if(that.side_bar.config.filter[1] === "Eccentricity"){
                that.side_bar.config.eccent_p = parseFloat(d3.select("#eccent_p_values2").node().value);
                let eccent_dist_dropdown = document.getElementById("eccent_dist_selection2")
                that.side_bar.config.eccent_dist = eccent_dist_dropdown.options[eccent_dist_dropdown.selectedIndex].text;
            }
            let mapper_data = {"cols":that.side_bar.selected_cols, "all_cols":that.side_bar.all_cols, "categorical_cols":that.side_bar.categorical_cols, "config":that.side_bar.config};
            $.post("/mapper_loader",{
                data: JSON.stringify(mapper_data)
            }, function(res){
                console.log(res);
                that.graph = new Graph(res.mapper, that.side_bar.all_cols, res.connected_components, that.side_bar.categorical_cols);
                that.regression = new Regression(that.side_bar.all_cols);
            })
        } else{
            alert("Please import a dataset frist!")
        } 
    })

d3.select("#linear_regression")
    .on("click", ()=>{
        if(that.graph){
            let selected_nodes = [...that.graph.selected_nodes];
            if(that.graph.selected_nodes.length===0){
                selected_nodes = that.graph.nodes.map(d=>d.id);
            } 
            console.log(that.regression.dependent_var)
            console.log(that.regression.indep_vars_selected)
            $.post("/linear_regression", {
                data: JSON.stringify({"nodes":selected_nodes, "dep_var":that.regression.dependent_var, "indep_vars":that.regression.indep_vars_selected})
            }, function(res){
                console.log(res)
                that.regression.draw_reg_result(res);
            })
        }
    })

d3.select("#pca")
    .on("click", ()=>{
        if(that.graph){
            let selected_nodes = [...that.graph.selected_nodes];
            if(that.graph.selected_nodes.length===0){
                selected_nodes = that.graph.nodes.map(d=>d.id);
            } 
            $.post("/pca", {
                data: JSON.stringify({"nodes":selected_nodes})
            }, function(res){
                that.pca = new PCA(that.side_bar.selected_cols, selected_nodes);
                that.pca.draw_PCA(JSON.parse(res.pca));
            })
        }
    })

let coll  = document.getElementsByClassName("block_title");
for(let i=0; i<coll.length; i++){
    coll[i].addEventListener("click", function(){
        this.classList.toggle("collapsed")
        let block_body = this.nextElementSibling;
        console.log(block_body.id)
        if (block_body.style.maxHeight){
            block_body.style.maxHeight = null;
        } else {
            // block_body.style.maxHeight = block_body.scrollHeight + "px";
            if(block_body.id === "block_body_histogram"){
                block_body.style.maxHeight = "500px";
            } else{
                block_body.style.maxHeight = "1000px";
            }
        } 
    })
}

let filtering_para_range1 = document.getElementById("filtering-para-range1");
let filtering_range_containers1 = document.getElementsByClassName("param-range-container-inner_filtering1")
filtering_para_range1.addEventListener("click", function(){
    for(let i=0; i<filtering_range_containers1.length; i++){

        if(filtering_range_containers1[i].style.maxHeight){
            filtering_range_containers1[i].style.maxHeight = null;
        } else{
            filtering_range_containers1[i].style.maxHeight = filtering_range_containers1[i].scrollHeight + "px";
        }
    }
})

let filtering_para_range2 = document.getElementById("filtering-para-range2");
let filtering_range_containers2 = document.getElementsByClassName("param-range-container-inner_filtering2")
filtering_para_range2.addEventListener("click", function(){
    for(let i=0; i<filtering_range_containers2.length; i++){

        if(filtering_range_containers2[i].style.maxHeight){
            filtering_range_containers2[i].style.maxHeight = null;
        } else{
            filtering_range_containers2[i].style.maxHeight = filtering_range_containers2[i].scrollHeight + "px";
        }
    }
})

let clustering_para_range = document.getElementById("clustering-para-range");
let clustering_range_containers = document.getElementsByClassName("param-range-container-inner_clustering");
clustering_para_range.addEventListener("click", function(){
    for(let i=0; i<clustering_range_containers.length; i++){
        if(clustering_range_containers[i].style.maxHeight){
            clustering_range_containers[i].style.maxHeight = null;
        } else{
            clustering_range_containers[i].style.maxHeight = clustering_range_containers[i].scrollHeight + "px";
        }
    }
})

let label_column_dropdown = document.getElementById("label_column_selection");
label_column_dropdown.onchange = function(){
    let label_column = label_column_dropdown.options[label_column_dropdown.selectedIndex].text;
    console.log(label_column)
    if(that.graph){
        let labels;
        if(label_column != "row index"){
            $.ajax({
                type: "POST",
                url: "/update_cluster_details",
                data: label_column,
                dataType:'text',
                success: function (response) {
                    labels = JSON.parse(response).labels;
                    that.graph.label_column = label_column;
                    that.graph.labels = labels;        
                    that.graph.text_cluster_details(that.graph.selected_nodes, label_column, labels);

                },
                error: function (error) {
                    console.log("error",error);
                }
            })
        } else {
            that.graph.label_column = label_column;
            that.graph.labels = labels;  
            that.graph.text_cluster_details(that.graph.selected_nodes, label_column, labels);
        }
    }
}
