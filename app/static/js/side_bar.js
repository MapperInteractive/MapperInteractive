class DataLoader{
    constructor(all_cols, categorical_cols, other_cols){
        this.all_cols = all_cols;
        this.selected_cols = all_cols.slice(0);
        this.selectable_cols = [];
        this.categorical_cols = categorical_cols;
        this.other_cols = other_cols;

        this.config = {};
  
        this.draw_all_cols();
        this.draw_selected_cols();
        this.draw_filter_dropdown();
        this.draw_filter_dropdown2();
        this.draw_label_dropdown();
        this.initialize_config();
        this.edit_param();
    }

    initialize_config(){
        let that = this;

        // 1. Normalization
        this.config.norm_type = d3.select('input[name="norm-type"]:checked').node().value;
        d3.select("#norm-type-form")
            .on("change", ()=>{
                this.config.norm_type = d3.select('input[name="norm-type"]:checked').node().value;
            })

        // 2. filtration
        d3.select("#mapper-dim-form")
            .on("change", ()=>{
                let mapper_dim = d3.select('input[name="mapper-dim"]:checked').node().value;
                let filter2 = document.getElementById("filter-inner-2");
                if(mapper_dim === "mapper_1d"){
                    that.config.filter = [filter_dropdown.options[filter_dropdown.selectedIndex].text];
                    filter2.style.maxHeight = 0;
                } else if (mapper_dim === "mapper_2d"){
                    if(this.filters.length > 1){
                        filter2.style.maxHeight = "300px";
                        this.draw_filter_dropdown2();
                        this.update_filter();
                    } else{
                        alert("Only one column selectable!");
                        d3.select("#mapper_1d").property("checked", true);
                    }
                }
            })

        let filter_dropdown = document.getElementById("filter_function_selection");
        filter_dropdown.onchange = function(){
            let mapper_dim = d3.select('input[name="mapper-dim"]:checked').node().value;
            if(filter_dropdown.options){
                let filter = filter_dropdown.options[filter_dropdown.selectedIndex].text;
                let eccent_param_container = document.getElementById("eccent-param-container-inner");
                let density_param_container = document.getElementById("density-param-container-inner");
                if(filter === "Eccentricity"){
                    eccent_param_container.style.maxHeight = eccent_param_container.scrollHeight + "px";
                } else {
                    eccent_param_container.style.maxHeight = null;
                }
                if(filter === "Density"){
                    density_param_container.style.maxHeight = density_param_container.scrollHeight + "px";
                } else {
                    density_param_container.style.maxHeight = null;
                }
                if(mapper_dim === "mapper_1d"){
                    that.config.filter = [filter];
                } else if(mapper_dim === "mapper_2d"){
                    that.config.filter[0] = filter;
                    that.draw_filter_dropdown2();
                }
            }
        }

        let filter_dropdown2 = document.getElementById("filter_function_selection2");
        filter_dropdown2.onchange = function(){
            if(filter_dropdown2.options){
                let filter = filter_dropdown2.options[filter_dropdown2.selectedIndex].text
                that.config.filter[1] = filter;
                let eccent_param_container = document.getElementById("eccent-param-container-inner2");
                let density_param_container = document.getElementById("density-param-container-inner2");
                if(filter === "Eccentricity"){
                    eccent_param_container.style.maxHeight = eccent_param_container.scrollHeight + "px";
                } else{
                    eccent_param_container.style.maxHeight = null;
                }
                if(filter === "Density"){
                    density_param_container.style.maxHeight = density_param_container.scrollHeight + "px";
                } else{
                    density_param_container.style.maxHeight = null;
                }
                that.draw_filter_dropdown();
            }
        }

        // the default is 1d
        if(filter_dropdown.options[filter_dropdown.selectedIndex]){
            this.config.filter = [filter_dropdown.options[filter_dropdown.selectedIndex].text];
        }

        //3. Parameters
        // interval
        let interval_slider1 = document.getElementById("interval1_input");
        this.config.interval1 = interval_slider1.value;
        interval_slider1.oninput = function(){
            that.config.interval1 = this.value;
            d3.select("#interval1_label")
                .html(this.value);
        }

        let interval_slider2 = document.getElementById("interval2_input");
        this.config.interval2 = interval_slider2.value;
        interval_slider2.oninput = function(){
            that.config.interval2 = this.value;
            d3.select("#interval2_label")
                .html(this.value);
        }

        // overlap
        let overlap_slider1 = document.getElementById("overlap1_input");
        this.config.overlap1 = overlap_slider1.value;
        overlap_slider1.oninput = function(){
            that.config.overlap1 = this.value;
            d3.select("#overlap1_label")
                .html(this.value);
        }

        let overlap_slider2 = document.getElementById("overlap2_input");
        this.config.overlap2 = overlap_slider2.value;
        overlap_slider2.oninput = function(){
            that.config.overlap2 = this.value;
            d3.select("#overlap2_label")
                .html(this.value);
        }

        // eps
        let eps_slider = document.getElementById("eps_input");
        this.config.eps = eps_slider.value;
        eps_slider.oninput = function(){
            that.config.eps = this.value;
            d3.select("#eps_label")
                .html(this.value);
        }

        // min samples
        let min_samples_slider = document.getElementById("min_samples_input");
        this.config.min_samples = min_samples_slider.value;
        min_samples_slider.oninput = function(){
            that.config.min_samples = this.value;
            d3.select("#min_samples_label")
                .html(this.value);
        }
        

    }

    draw_all_cols(){
        let ag = d3.select("#all-columns-list").select("ul").selectAll("li").data(this.all_cols);
        ag.exit().remove();
        ag = ag.enter().append("li").merge(ag)
            .html(d=>d)
            .on("click",(d)=>{
                if(this.selected_cols.indexOf(d)===-1){
                    this.selected_cols.push(d);
                    this.selectable_cols.splice(this.selectable_cols.indexOf(d),1);
                    this.draw_selected_cols();
                    this.initialize_filter();
                }
            });
    }

    draw_selected_cols(){
        let sg = d3.select("#selected-columns-list").select("ul").selectAll("li").data(this.selected_cols);
        sg.exit().remove();
        sg = sg.enter().append("li").merge(sg)
            .html(d=>d)
            .on("click",(d)=>{
                if(this.selected_cols.length>1){
                    this.selected_cols.splice(this.selected_cols.indexOf(d),1);
                    this.selectable_cols.push(d);
                    this.draw_selected_cols();
                    this.initialize_filter();
                    
                } else {
                    alert("Please select at least 1 column!")
                }
            });
    }

    initialize_filter(){
        // go back to 1d
        d3.select("#mapper_1d").property("checked", true)
        let filter_dropdown = document.getElementById("filter_function_selection");
        this.config.filter = [filter_dropdown.options[filter_dropdown.selectedIndex].text];

        this.draw_filter_dropdown();
        this.update_filter();
    }

    draw_filter_dropdown(){
        if(this.selected_cols.length >= 1){
            // this.filters = this.selectable_cols.concat(["sum", "mean", "median", "max", "min", "std"]);
            this.filters = this.all_cols.concat(["l2norm", "Density", "Eccentricity", "PC1", "PC2", "sum", "mean", "median", "max", "min", "std"]);
            if(this.all_cols.length === 1){
                this.filters = this.all_cols.concat(["l2norm", "Density", "Eccentricity", "PC1", "sum", "mean", "median", "max", "min", "std"]);
            }
        } else {
            this.filters = this.selectable_cols.slice(0);
        }
        let filter = [];
        this.filters.forEach(f=>{
            filter.push(f);
        })
        let mapper_dim = d3.select('input[name="mapper-dim"]:checked').node().value;
        if(mapper_dim === "mapper_2d"){
            let filter_dropdown2 = document.getElementById("filter_function_selection2");
            if(filter_dropdown2.options[filter_dropdown2.selectedIndex]){
                let selected_filter = filter_dropdown2.options[filter_dropdown2.selectedIndex].text;
                filter.splice(filter.indexOf(selected_filter),1);

            }
        }        

        let fg = d3.select("#filter_function_selection").selectAll("option").data(filter);
        fg.exit().remove();
        fg = fg.enter().append("option").merge(fg)
            .classed("select-items", true)
            .html(d=>d);
    }

    draw_filter_dropdown2(){
        let filter_dropdown = document.getElementById("filter_function_selection");
        if(filter_dropdown.options[filter_dropdown.selectedIndex]){
            let selected_filter = filter_dropdown.options[filter_dropdown.selectedIndex].text;
            let filter2 = [];
            this.filters.forEach(f=>{
                if(f!=selected_filter){
                    filter2.push(f);
                }
            })
            let fg2 = d3.select("#filter_function_selection2").selectAll("option").data(filter2);
            fg2.exit().remove();
            fg2 = fg2.enter().append("option").merge(fg2)
                .classed("select-items", true)
                .html(d=>d);
        }
    }

    draw_label_dropdown(){
        if(this.all_cols.length > 0){
            let label_cols = ["row index"].concat(this.categorical_cols.concat(this.all_cols).concat(this.other_cols));
            let cg = d3.select("#label_column_selection").selectAll("option").data(label_cols);
            cg.exit().remove();
            cg = cg.enter().append("option").merge(cg)
                .classed("select-items", true)
                .html(d=>d);
        }
    }

    update_filter(){
        let mapper_dim = d3.select('input[name="mapper-dim"]:checked').node().value;
        let filter_dropdown = document.getElementById("filter_function_selection");
        let filter_dropdown2 = document.getElementById("filter_function_selection2");
        if (mapper_dim === "mapper_1d") {
            this.config.filter = [filter_dropdown.options[filter_dropdown.selectedIndex].text];
        } else{
            this.config.filter = [filter_dropdown.options[filter_dropdown.selectedIndex].text, filter_dropdown2.options[filter_dropdown2.selectedIndex].text];
        }
    }

    edit_param(){
        this.edit_clustering_param();
        this.edit_filtering_param();
    }

    edit_filtering_param(){
        let filtering_param_ranges_limit = {"interval1":{"left":1, "right":100}, "overlap1":{"left":0, "right":100}, "interval2":{"left":1, "right":100}, "overlap2":{"left":0, "right":100}};
        let filtering_param_ranges = {}
        let filtering_params = ['interval1', 'overlap1', 'interval2', 'overlap2']
        for (let i=0; i<filtering_params.length; i++){
            let p = filtering_params[i];
            filtering_param_ranges[p] = {};
            filtering_param_ranges[p].left = d3.select("#range-"+p+"-left").node().value;
            filtering_param_ranges[p].right = d3.select("#range-"+p+"-right").node().value;
            d3.select("#range-"+p+"-left")
                .on("change", ()=>{
                    let v = parseFloat(d3.select("#range-"+p+"-left").node().value);
                    if(v >= filtering_param_ranges_limit[p].left && v<=filtering_param_ranges[p].right){
                        filtering_param_ranges[p].left = v;
                        d3.select("#"+p+"_label").html(d3.select("#"+p+"_input").node().value)
                        d3.select("#"+p+"_input").node().min = v;
                    } else {
                        alert("out of range!")
                    }
                })
            d3.select("#range-"+p+"-right")
                .on("change", ()=>{
                    let v = parseFloat(d3.select("#range-"+p+"-right").node().value);
                    if(v <= filtering_param_ranges_limit[p].right && v>=filtering_param_ranges[p].left){
                        filtering_param_ranges[p].right = v;
                        d3.select("#"+p+"_label").html(d3.select("#"+p+"_input").node().value)
                        d3.select("#"+p+"_input").node().max = v;
                    } else {
                        alert("out of range!")
                    }
                })
        }
    }

    edit_clustering_param(){
        let clustering_param_ranges_limit = {"eps":{"left":0, "right":300000}, "min_samples":{"left":1, "right":100}};
        let clustering_param_ranges = {};
        let clustering_params = ['eps', 'min_samples'];
        for(let i=0; i<clustering_params.length; i++){
            let p = clustering_params[i];
            clustering_param_ranges[p] = {};
            clustering_param_ranges[p].left = d3.select("#range-"+p+"-left").node().value;
            clustering_param_ranges[p].right = d3.select("#range-"+p+"-right").node().value;
            d3.select("#range-"+p+"-left")
                .on("change", ()=>{
                    let v = parseFloat(d3.select("#range-"+p+"-left").node().value);
                    if(v >= clustering_param_ranges_limit[p].left && v<=clustering_param_ranges[p].right){
                        clustering_param_ranges[p].left = v;
                        d3.select("#"+p+"_label").html(d3.select("#"+p+"_input").node().value)
                        d3.select("#"+p+"_input").node().min = v;
                    } else {
                        alert("out of range!");
                    }
                })
            d3.select("#range-"+p+"-right")
                .on("change", ()=>{
                    let v = parseFloat(d3.select("#range-"+p+"-right").node().value);
                    if(v <= clustering_param_ranges_limit[p].right && v>=clustering_param_ranges[p].left){
                        clustering_param_ranges[p].right = v;
                        d3.select("#"+p+"_label").html(d3.select("#"+p+"_input").node().value)
                        d3.select("#"+p+"_input").node().max = v;
                    } else {
                        alert("out of range!");
                    }
                })
        }
    }

}