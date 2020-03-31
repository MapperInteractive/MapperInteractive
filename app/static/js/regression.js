class Regression{

    constructor(cols){
        this.selectable_cols = cols;
        this.dependent_var = this.selectable_cols[0];
        this.indep_vars_selectable = this.selectable_cols.slice(1);
        this.indep_vars_selected = [];
        this.indep_idx = 1;
        console.log("selectable cols",this.selectable_cols) 
        console.log(this.dependent_var)

        this.clear_result();
        this.draw_dependent_var();
        this.add_var();
        this.initialize_new_select();
        this.change_vars();
    }

    draw_dependent_var(){
        let dg = d3.select("#regression-dependent").selectAll("option").data(this.selectable_cols);
        dg.exit().remove();
        dg = dg.enter().append("option").merge(dg)
            .html(d=>d);
    }

    add_var(){
        d3.select("#adding-var")
            .on("click",()=>{
                if(this.indep_vars_selectable.length>0){
                    let row = d3.select("#regression-independent-container").append("div").classed("row", true).attr("id","regression-independent-container-"+this.indep_idx);
                    let select_div = row.append("div").classed("col-sm-10", true)
                        .style("padding-top","5px");
                    let symbol_div = row.append("div").classed("col-sm-2", true)
                        .style("padding","0")
                        .style("padding-top","10px");
                    select_div.append("select")
                        .classed("custom-select",true)
                        .style("width","100%")
                        .attr("id", "regression-independent-"+this.indep_idx);
                    symbol_div.append("i")
                        .classed("fas fa-minus-circle", true)
                        .style("font-size", "15px")
                        .attr("id", "deleting-var-"+this.indep_idx);
                    this.initialize_new_select();
                    this.change_vars();
                } else {
                    alert("You have selected all variables!")
                }
                
            })
    }

    initialize_new_select(){
        this.draw_independent_var(this.indep_idx);
        this.indep_idx += 1;
        
    }

    draw_independent_var(indep_idx){
        let ig = d3.select("#regression-independent-"+indep_idx).selectAll("option").data(this.indep_vars_selectable);
        ig.exit().remove();
        ig = ig.enter().append("option").merge(ig)
            .html(d=>d);
        // initialize this select
        this.indep_vars_selected.push(this.indep_vars_selectable[0]);
        this.indep_vars_selectable.splice(0,1);
    }

    change_vars(){
        let that = this;
        let dp_dropdown = document.getElementById("regression-dependent");
        that.dependent_var = dp_dropdown.options[dp_dropdown.selectedIndex].text;
        dp_dropdown.onchange = function(){
            let v = dp_dropdown.options[dp_dropdown.selectedIndex].text;
            that.indep_vars_selectable = []
            that.selectable_cols.forEach(c=>{
                if(c!=v){
                    that.indep_vars_selectable.push(c);
                }
            })
            that.indep_vars_selected = [];
            that.dependent_var = v;
            for(let i=0; i<that.indep_idx-1; i++){
                let idx = i+1;
                that.draw_independent_var(idx);
            }
        }

        for(let i=0; i<this.indep_idx-1; i++){
            let idx = i+1;
            let ip_dropdown = document.getElementById("regression-independent-"+idx);
            that.indep_vars_selected[i] = ip_dropdown.options[ip_dropdown.selectedIndex].text;
            ip_dropdown.onchange = function(){
                let v = ip_dropdown.options[ip_dropdown.selectedIndex].text;
                let n = that.indep_idx;
                that.indep_idx = idx+1;
                that.indep_vars_selected = that.indep_vars_selected.slice(0,idx);
                that.indep_vars_selected[i] = v;
                that.indep_vars_selectable = [];
                that.selectable_cols.forEach(c=>{
                    if(that.indep_vars_selected.indexOf(c)===-1 && c!=that.dependent_var){
                        that.indep_vars_selectable.push(c);
                    }
                })
                for(let j=idx+1;j<n;j++){
                    that.initialize_new_select();
                }
            }
        }

        for(let i=0; i<this.indep_idx-1; i++){
            let idx = i+1;
            d3.select("#deleting-var-"+idx)
                .on("click",()=>{
                    this.indep_vars_selectable.push(this.indep_vars_selected[i]);
                    this.indep_vars_selected.splice(i,1);
                    // console.log(this.indep_vars_selectable, this.indep_vars_selected)
                    $("#regression-independent-container-"+idx).remove();
                    for(let k=i+1; k<this.indep_idx-1; k++){
                        let k_idx = k+1;
                        d3.select("#regression-independent-container-"+k_idx).attr("id","regression-independent-container-"+(k_idx-1));
                        d3.select("#deleting-var-"+k_idx).attr("id","deleting-var-"+(k_idx-1));
                        d3.select("#regression-independent-"+k_idx).attr("id", "regression-independent-"+(k_idx-1));
                        let ig = d3.select("#regression-independent-"+(k_idx-1)).selectAll("option").data([this.indep_vars_selected[k-1]].concat(this.indep_vars_selectable));
                        ig.exit().remove();
                        ig = ig.enter().append("option").merge(ig)
                                .html(d=>d);
                    }
                    this.indep_idx -= 1;
                    this.change_vars();
                })
        }
    }

    clear_result(){
        $('#regression-result').remove();
        $('.reg-result_title').remove();
    }

    draw_reg_result(res){
        console.log(res)
        this.clear_result();
        d3.select("#regression-panel").select(".block_body-inner").append("div").classed("reg-result_title",true).append("h6").html("Regression Result");
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