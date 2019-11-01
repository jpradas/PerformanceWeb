$(() => {
    //console.log("ready!");
    $("button.btn.btn-light.collapsed").on("click", function(){
        //console.log($(this).text().trim());
        $("#"+$(this).text().trim()+"body").collapse('toggle');
    });

    $(".menu-button").on("click", function(){
        //console.log($(this).attr("name"));
        $("#"+$(this).attr("name")+"modal").modal('show');
    });
})