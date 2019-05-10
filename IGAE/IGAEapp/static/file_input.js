$(()=>{

    var disabled1 = false;
    var disabled2 = false;   

    $('#inputGroupFile01').on('change', function(){
        var filename = $(this).val();
        var file = filename.split("\\");
        var ext = file[2].split(".").pop();
        if(ext != 'json'){
            $(this).addClass('is-invalid');
            $(this).next('.custom-file-label').addClass("invalid").html(file[2]);
            disabled1 = true;
            if(!disabled2){
                $('#submit-btn').attr('disabled', true);
            }
        }
        else{
            $(this).removeClass('is-invalid');
            $(this).next('.custom-file-label').removeClass('invalid');
            $(this).next('.custom-file-label').addClass("selected").html(file[2]);
            disabled1 = false;
            if(!disabled2){
                $('#submit-btn').attr('disabled', false);
            }
        }
    });

    $('#inputGroupFile02').on('change', function(){
        var filename = $(this).val();
        var file = filename.split("\\");
        var ext = file[2].split(".").pop();
        if(ext != 'json'){
            $(this).addClass('is-invalid');
            $(this).next('.custom-file-label').addClass("invalid").html(file[2]);
            disabled2 = true;
            if(!disabled1){
                $('#submit-btn').attr('disabled', true);
            }
        }
        else{
            $(this).removeClass('is-invalid');
            $(this).next('.custom-file-label').removeClass('invalid');
            $(this).next('.custom-file-label').addClass("selected").html(file[2]);
            disabled2 = false;
            if(!disabled1){
                $('#submit-btn').attr('disabled', false);
            }
        }
    });

    $('#inputGroupFileJmeter01').on('change', function(){
        var filename = $(this).val();
        var file = filename.split("\\");
        var ext = file[2].split(".").pop();
        if(ext != 'jtl'){
            $(this).addClass('is-invalid');
            $(this).next('.custom-file-label').addClass("invalid").html(file[2]);
            disabled1 = true;
            if(!disabled2){
                $('#submit-btn').attr('disabled', true);
            }
        }
        else{
            $(this).removeClass('is-invalid');
            $(this).next('.custom-file-label').removeClass('invalid');
            $(this).next('.custom-file-label').addClass("selected").html(file[2]);
            disabled1 = false;
            if(!disabled2){
                $('#submit-btn').attr('disabled', false);
            }
        }
    });

    
});