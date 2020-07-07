let that = this;

this.side_bar = new DataLoader([]);

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
                    console.log(JSON.parse(response));
                    that.side_bar = new DataLoader(JSON.parse(response).columns);
                },
                error: function (error) {
                    console.log("error",error);
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
            let mapper_data = {"cols":that.side_bar.selected_cols, "config":that.side_bar.config}
            console.log(mapper_data)

            $.post("/mapper_loader",{
                data: JSON.stringify(mapper_data)
            }, function(res){
                console.log(res);
                that.graph = new Graph(res.mapper, that.side_bar.all_cols, res.connected_components);
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
