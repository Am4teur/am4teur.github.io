$(document).ready(function(){

    console.log("");

});

$(document).on("click", ".menu-trigger", function() {
    if($(this).hasClass("active"))
    {
        $(this).removeClass("active");
        $(".aside").removeClass("active");
    }
    else
    {
        $(this).addClass("active");
        $(".aside").addClass("active");
    }
})


//$().button('toggle')

//$().button('dispose');






/*
<!-- burguer begin 
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarResponsive">
            <ul class="navbar-nav ml-auto">
                <li class="nav-ite active">
                    <a class="nav-link" href="#">Home</a>
                </li>
                <li class="nav-ite">
                    <a class="nav-link" href="#">Home2</a>
                </li>
            </ul>
        </div>
        <!-- burguer end -->
*/